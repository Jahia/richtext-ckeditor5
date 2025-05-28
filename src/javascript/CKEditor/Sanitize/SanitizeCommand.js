import {Command} from 'ckeditor5';
import gql from 'graphql-tag';

export class SanitizeCommand extends Command {
    execute() {
        const editor = this.editor;
        // Get apollo client
        const client = editor.config.get('apolloClient');
        const context = editor.config.get('editorContext');
        const root = editor.model.document.getRoot();
        client.query({
            query,
            variables:
                {
                    html: editor.getData(),
                    siteKey: context.site
                }
        }).then(resp => {
            editor.model.change(writer => {
                if (!resp?.data?.htmlFiltering?.validate?.safe) {
                    // Clean the editor
                    writer.remove(writer.createRangeIn(root));
                    const text = editor.data.parse(resp?.data?.htmlFiltering?.validate?.sanitizedHtml);
                    // Add updated text
                    writer.insert(text, root, 0);
                }
            });
        });
    }
}

const query = gql`
    query HtmlFiltering($html: String!, $workspace: Workspace = EDIT, $siteKey: String) {
        htmlFiltering {
            validate(html: $html, workspace: $workspace, siteKey: $siteKey) {
                removedTags
                removedAttributes {
                    attributes
                    tag
                }
                sanitizedHtml
                safe
            }
        }
    }
`;
