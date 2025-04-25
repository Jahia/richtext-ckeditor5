import {JContent, ContentEditor} from '@jahia/jcontent-cypress/dist/page-object';
import {createSite, deleteSite} from '@jahia/cypress';
import {Ckeditor5, RichTextCKeditor5Field} from '../page-object/ckeditor5';

describe('Language tests', () => {
    const siteKeyEn = 'enRichTextCKEditor5Site';
    let jcontent: JContent;

    before(function () {
        createSite(siteKeyEn);
        cy.loginAndStoreSession(); // Edit in chief
    });

    after(function () {
        cy.apollo({
            mutationFile: 'updateProfileLanguage.graphql',
            variables: {lang: 'en'}
        });
        cy.logout();
        deleteSite(siteKeyEn);
    });
    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    it('should have labels in English', () => {
        jcontent = JContent.visit(siteKeyEn, 'en', 'content-folders/contents');
        jcontent.createContent('Rich text');
        const ckeditor5 = new Ckeditor5();
        const ck5field: RichTextCKeditor5Field = ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text');
        ck5field.getToolbarButton('Bold').should('exist');
        ck5field.getToolbarButton('Italic').should('exist');
    });

    it('should have labels in French', () => {
        cy.apollo({
            mutationFile: 'updateProfileLanguage.graphql',
            variables: {lang: 'fr'}
        });
        jcontent = JContent.visit(siteKeyEn, 'en', 'content-folders/contents');
        let contentEditor = jcontent.createContent('Texte riche');
        const ckeditor5 = new Ckeditor5();
        const ck5field: RichTextCKeditor5Field = ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text');
        ck5field.type('Texte riche');
        ck5field.getToolbarButton('Gras').should('exist');
        ck5field.getToolbarButton('Italique').should('exist');

        contentEditor.createUnchecked();

        jcontent.getTable().getRowByLabel('Texte riche').contextMenu().select('Editer');
        contentEditor = new ContentEditor();
        contentEditor.switchToAdvancedMode();

        ck5field.getToolbarButton('Gras').should('exist');
        ck5field.getToolbarButton('Italique').should('exist');
    });
});
