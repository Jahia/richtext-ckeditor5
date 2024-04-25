import {JContent} from '@jahia/jcontent-cypress/dist/page-object';
import {Picker} from '@jahia/jcontent-cypress/dist/page-object/picker';
import {createSite, deleteSite, getComponentByRole} from '@jahia/cypress';
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

    it('should have buttons visible and clickable', () => {
        jcontent.createContent('Rich text');
        const ckeditor5 = new Ckeditor5();
        const ck5field: RichTextCKeditor5Field = ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text');
        ck5field.type('this is my text');
        ck5field.getToolbarButton('Bold (⌘B)').click();
        ck5field.getToolbarButton('Italic (⌘I)').click();
        ck5field.getToolbarButton('Strikethrough (⌘⇧X)').click();
        ck5field.getToolbarButton('Heading').click().click();
        ck5field.getToolbarButton('Text alignment').click().click();
        ck5field.getToolbarButton('Insert image or file').click();
        let picker: Picker = getComponentByRole(Picker, 'picker-dialog');
        picker.cancel();
        ck5field.getToolbarButton('Insert link').click();
        picker = getComponentByRole(Picker, 'picker-dialog');
        picker.cancel();
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
