import {JContent} from '@jahia/jcontent-cypress/dist/page-object';
import {createSite, deleteSite} from '@jahia/cypress';
import {Ckeditor5, RichTextCKeditor5Field} from '../page-object/ckeditor5';

describe('Macros tests', () => {
    const siteKey = 'macrosCKEditor5Site';
    const ckeditor5 = new Ckeditor5();

    before(function () {
        createSite(siteKey);
    });

    after(function () {
        cy.logout();
        deleteSite(siteKey);
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    it('Checks that macros is available and can be used', () => {
        JContent.visit(siteKey, 'en', 'content-folders/contents').createContent('jnt:bigText');
        const ck5field: RichTextCKeditor5Field = ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text');
        ck5field.getEditArea().click(); // Focus the editor with a real click
        ck5field.type('##');
        ck5field.getEditArea().click();
        const suggestion = ck5field.getMacrosSuggestion('macros-item-username');
        suggestion.click();
        ck5field.getData().then(data => {
            expect(data.indexOf('##username##') !== -1).to.be.true;
        });
    });
});
