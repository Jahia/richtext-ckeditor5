import {JContent, ContentEditor} from '@jahia/jcontent-cypress/dist/page-object';
import {createSite, deleteSite} from '@jahia/cypress';
import {Ckeditor5} from '../page-object/ckeditor5';

function visitContentFolders(siteKey: string, jcontent) {
    JContent.visit(siteKey, 'en', 'content-folders/contents');
    jcontent = new JContent();
    jcontent.selectAccordion('content-folders');
    return jcontent;
}

describe('Rich Text CKeditor 5 - Site level configuration tests', () => {
    const siteKey = 'richTextCKEditor5Site';
    let jcontent: JContent;
    before(function () {
        createSite(siteKey);

        cy.loginAndStoreSession(); // Edit in chief
    });

    after(function () {
        cy.logout();
        deleteSite(siteKey);
    });
    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    it('Can create content in content folders', function () {
        jcontent = visitContentFolders(siteKey, jcontent);
        jcontent.createContent('Rich text');
        const ckeditor5 = new Ckeditor5();
        ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text').type('Newly created content');
        ckeditor5.create();
        jcontent.getTable().getRowByLabel('Newly created content').should('exist').and('be.visible');
    });

    it('Switches to CKEditor 4', function () {
        cy.apollo({
            mutationFile: 'toggleCkeditorVersionOnSite.graphql',
            variables: {sitePath: `/sites/${siteKey}`, ckeditor4: 'true'}
        });
        jcontent = visitContentFolders(siteKey, jcontent);
        jcontent.createContent('Rich text');
        const ckeditor4 = new ContentEditor();
        ckeditor4.getRichTextField('jnt:bigText_text').type('Newly created content Ckeditor4');
        ckeditor4.create();
        jcontent.getTable().getRowByLabel('Newly created content Ckeditor4').should('exist').and('be.visible');
    });
});
