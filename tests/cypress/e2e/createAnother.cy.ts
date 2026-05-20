import {JContent, ContentEditor} from '@jahia/jcontent-cypress/dist/page-object';
import {createSite, deleteSite} from '@jahia/cypress';
import {Ckeditor5, RichTextCKeditor5Field} from '../page-object/ckeditor5';

describe('Create another tests', () => {
    const siteKey = 'createAnotherCKEditor5Site';
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

    it('Creates another without throwing exception', () => {
        const ce: ContentEditor = JContent.visit(siteKey, 'en', 'content-folders/contents').createContent('jnt:bigText');
        let ck5field: RichTextCKeditor5Field = ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text');
        ck5field.type('Hello');
        ck5field.getData().then(data => {
            const isEmpty = data === '' || data === '<p></p>' || data === '<p>&nbsp;</p>';
            expect(isEmpty).not.to.be.true;
        });
        ce.addAnotherContent();
        ce.createUnchecked();
        // This is necessary as we switch editors in the same content editor and it takes some time for react to switch,
        // so we end up with a wrong instance.
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(3000);
        ck5field = ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text');
        ck5field.getData().then(data => {
            const isEmpty = data === '' || data === '<p></p>' || data === '<p>&nbsp;</p>';
            expect(isEmpty).to.be.true;
        });
    });
});
