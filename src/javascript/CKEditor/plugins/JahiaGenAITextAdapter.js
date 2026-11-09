import {AIRequestError, OpenAITextAdapter} from 'ckeditor5-premium-features';

const joinContent = (messages, role) => messages
    .filter(message => message.role === role)
    .map(message => message.content)
    .join('\n\n');

const parseFrame = frame => {
    let event = 'message';
    const dataLines = [];
    frame.split('\n').forEach(line => {
        if (line.startsWith('event:')) {
            event = line.slice('event:'.length).trim();
        } else if (line.startsWith('data:')) {
            dataLines.push(line.slice('data:'.length).trimStart());
        }
    });

    return {event, data: dataLines.length > 0 ? JSON.parse(dataLines.join('\n')) : {}};
};

const errorMessage = async response => {
    try {
        const body = await response.json();
        return body.error || response.statusText;
    } catch {
        return response.statusText;
    }
};

/**
 * Reads the server-sent events of the AI proxy until the terminal one.
 * Calls onData() with the whole text received so far, as AITextAdapter requires.
 */
const readEvents = async (body, onData) => {
    const reader = body.pipeThrough(new TextDecoderStream()).getReader();
    let buffer = '';
    let text = '';
    let chunk = await reader.read();
    while (!chunk.done) {
        buffer += chunk.value;
        let end = buffer.indexOf('\n\n');
        while (end !== -1) {
            const {event, data} = parseFrame(buffer.slice(0, end));
            buffer = buffer.slice(end + 2);
            if (event === 'partial') {
                text += data.text;
                onData(text);
            } else if (event === 'complete') {
                if (data.text !== text) {
                    onData(data.text);
                }

                return;
            } else if (event === 'error') {
                throw new AIRequestError(data.error);
            }

            end = buffer.indexOf('\n\n');
        }

        // eslint-disable-next-line no-await-in-loop
        chunk = await reader.read();
    }

    throw new AIRequestError('The AI answer ended before it was complete.');
};

/**
 * AI assistant adapter that answers through the Jahia GenAI connector, by way of the CKEditor 5 AI proxy.
 *
 * It keeps the system and user messages that OpenAITextAdapter prepares, sends them as the instructions and
 * the input of a GenAI completion, and reads the server-sent events of the proxy. The provider, the key and
 * the model are set in the configuration of the GenAI connector, never in the editor.
 *
 * Configuration: ai.assistant.adapter.jahiaGenAI with apiUrl and requestHeaders, as for the OpenAI adapter.
 */
export class JahiaGenAITextAdapter extends OpenAITextAdapter {
    static get pluginName() {
        return 'JahiaGenAITextAdapter';
    }

    async sendRequest({query, context, onData, actionId}) {
        const {apiUrl, requestHeaders} = this.editor.config.get('ai.assistant.adapter.jahiaGenAI');
        const messages = await this.prepareMessages(query, context, actionId);
        const headers = typeof requestHeaders === 'function' ? await requestHeaders(actionId) : requestHeaders;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {...headers, 'Content-Type': 'application/json'},
            body: JSON.stringify({
                instructions: joinContent(messages, 'system'),
                input: joinContent(messages, 'user')
            }),
            signal: this.abortController.signal
        });
        if (!response.ok) {
            throw new AIRequestError(await errorMessage(response));
        }

        await readEvents(response.body, onData);
    }
}
