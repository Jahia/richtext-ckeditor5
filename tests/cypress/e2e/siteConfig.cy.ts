import {JContent} from '@jahia/jcontent-cypress/dist/page-object';
import {createSite, deleteSite} from '@jahia/cypress';
import {Ckeditor5} from '../page-object/ckeditor5';

describe('Rich Text CKeditor 5 - SIte level configuration tests', () => {
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
        JContent.visit(siteKey, 'en', 'content-folders/contents');
        jcontent = new JContent();
        jcontent.selectAccordion('content-folders');
    });
    it('Can create content in content folders', function () {
        jcontent.createContent('Rich text');
        const ckeditor5 = new Ckeditor5();
        ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text').type('Newly created content');
        ckeditor5.create();
        jcontent.getTable().getRowByLabel('Newly created content').should('exist').and('be.visible');
    });
});
