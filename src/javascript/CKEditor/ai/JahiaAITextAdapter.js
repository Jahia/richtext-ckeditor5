/*
 * Jahia AI Text Adapter - Extends OpenAI adapter to proxy through Servlet
 * Based on: https://ckeditor.com/docs/ckeditor5/latest/features/ai/ai-assistant/ai-assistant-integration.html
 */

import {OpenAITextAdapter} from 'ckeditor5-premium-features';

export class JahiaAITextAdapter extends OpenAITextAdapter {
    static get aiProxyEndpoint() {
        return `${window.contextJsParameters?.contextPath || ''}/cms/ai/proxy`;
    }

    /**
     * Override sendRequest to proxy through servlet
     */
    async sendRequest(request) {
        const response = await fetch(JahiaAITextAdapter.aiProxyEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                apiType: 'openai',
                messages: [
                    {
                        role: 'system',
                        content: 'Your task is to generate HTML content accordingly to the given instruction. Never include <img> tag in your response even if asked for. Your answer must be a well-structured and properly formatted HTML code. Answer only with the generated HTML content. Do not add any additional remarks or notes. Do not act like a chatbot or a real person. Do not wrap your response in markdown code blocks or backticks. Return only raw HTML.'
                    },
                    {
                        role: 'user',
                        content: request.prompt
                    }
                ],
                model: 'gpt-4o',
                temperature: 1,
                top_p: 1,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const aiResponseStr = await response.text();
        
        // Parse the JSON response (non-streaming)
        const jsonResponse = JSON.parse(aiResponseStr);
        
        // Extract content from message
        let content = jsonResponse.choices[0]?.message?.content || '';
        
        // Strip markdown code fences if present
        content = content.replace(/^```(?:html)?\n?/i, '').replace(/\n?```$/, '').trim();
        
        // Return as ReadableStream for CKEditor
        const encoder = new TextEncoder();
        return new ReadableStream({
            start(controller) {
                // Enqueue the content in the format CKEditor expects
                const chunk = JSON.stringify({
                    choices: [{
                        delta: {
                            content: content
                        }
                    }]
                }) + '\n';
                
                controller.enqueue(encoder.encode(chunk));
                controller.close();
            }
        });
    }
}

