import {JContent} from '@jahia/jcontent-cypress/dist/page-object';
import {createSite, deleteSite} from '@jahia/cypress';
import {Ckeditor5, RichTextCKeditor5Field} from '../page-object/ckeditor5';

describe('Toolbar tests', () => {
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
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
    });

    // To be reenabled once source saving is fixed properly
    it.skip('should have source button working', () => {
        jcontent.createContent('Rich text');
        const ckeditor5 = new Ckeditor5();
        const ck5field: RichTextCKeditor5Field = ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text');
        ck5field.type('this is my text');
        ck5field.getToolbarButton('Source').click();
        ck5field.getSourceEditingArea()
            .should('be.visible')
            .invoke('attr', 'data-value')
            .should('contain', '<p>\n    this is my text\n</p>');
    });
});
