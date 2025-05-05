import {JContent} from '@jahia/jcontent-cypress/dist/page-object';
import {addNode, createSite, deleteSite} from '@jahia/cypress';
import {Ckeditor5, RichTextCKeditor5Field} from '../page-object/ckeditor5';

describe('Table tests', () => {
    const siteKey = 'tableCKEditor5Site';
    const ckeditor5 = new Ckeditor5();
    const textName = 'test-table';

    before(function () {
        createSite(siteKey);
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: textName,
            primaryNodeType: 'jnt:bigText',
            properties: [{
                name: 'text',
                language: 'en',
                value: `
                    <figure class="table">
                        <table><tbody><tr><td>hello</td></tr></tbody></table>
                    </figure>`
            }]
        });
    });

    after(function () {
        cy.logout();
        deleteSite(siteKey);
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    it('should display table context balloon toolbar', () => {
        JContent.visit(siteKey, 'en', `content-folders/contents/${textName}`).editContent();
        const ck5field: RichTextCKeditor5Field = ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text');

        ck5field.getEditArea().find('span').contains('hello').click('center');
        cy.log('Verify table properties toolbar buttons are visible');
        ['Column', 'Row', 'Merge cells', 'Cell properties', 'Table properties'].forEach(toolbarLabel => {
            ck5field.getBalloonToolbarButton(toolbarLabel).should('be.visible');
        });
    });
});
