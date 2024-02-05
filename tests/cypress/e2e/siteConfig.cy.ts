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
    const newlyCreatedContentCKEditor4 = 'Newly created content CKEditor4';
    const newlyCreatedContentCKEditor5 = 'Newly created content CKEditor5';
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
        ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text').type(newlyCreatedContentCKEditor5);
        ckeditor5.create();
        jcontent.getTable().getRowByLabel(newlyCreatedContentCKEditor5).should('exist').and('be.visible');
    });

    it('Switches to CKEditor 4', function () {
        cy.apollo({
            mutationFile: 'toggleCkeditorVersionOnSite.graphql',
            variables: {sitePath: `/sites/${siteKey}`, ckeditor4: 'true'}
        });
        jcontent = visitContentFolders(siteKey, jcontent);
        jcontent.createContent('Rich text');
        const ckeditor4 = new ContentEditor();
        ckeditor4.getRichTextField('jnt:bigText_text').type(newlyCreatedContentCKEditor4);
        ckeditor4.create();
        jcontent.getTable().getRowByLabel(newlyCreatedContentCKEditor4).should('exist').and('be.visible');
    });

    it('Opens previously saved content from Ckeditor 5 in CKEditor 4', function () {
        jcontent = visitContentFolders(siteKey, jcontent);
        jcontent.getTable().getRowByLabel(newlyCreatedContentCKEditor5).contextMenu().select('Edit');
        const ckeditor4 = new ContentEditor();
        ckeditor4.getRichTextField('jnt:bigText_text').getData().should('eq', `<p>${newlyCreatedContentCKEditor5}</p>\n`);
        ckeditor4.cancel();
    });

    it('Opens previously saved content from Ckeditor 4 in CKEditor 5', function () {
        cy.apollo({
            mutationFile: 'toggleCkeditorVersionOnSite.graphql',
            variables: {sitePath: `/sites/${siteKey}`, ckeditor4: 'false'}
        });
        jcontent = visitContentFolders(siteKey, jcontent);
        jcontent.getTable().getRowByLabel(newlyCreatedContentCKEditor4).contextMenu().select('Edit');
        const ckeditor5 = new Ckeditor5();
        ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text').getData().should('eq', `<p>${newlyCreatedContentCKEditor4}</p>`);
        ckeditor5.cancel();
    });

    it('Opens previously saved content from Ckeditor 5 and formats it to Heading 2', function () {
        cy.apollo({
            mutationFile: 'toggleCkeditorVersionOnSite.graphql',
            variables: {sitePath: `/sites/${siteKey}`, ckeditor4: 'false'}
        });
        jcontent = visitContentFolders(siteKey, jcontent);
        jcontent.getTable().getRowByLabel(newlyCreatedContentCKEditor5).contextMenu().select('Edit');
        const ckeditor5 = new Ckeditor5();
        ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text').getData().should('eq', `<p>${newlyCreatedContentCKEditor5}</p>`);
        ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text').getToolbarButton('Heading').click();
        ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text').selectHeading('Heading 2');
        ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text').getData().should('eq', `<h2>${newlyCreatedContentCKEditor5}</h2>`);
        ckeditor5.save();
    });

    it('Opens image picker when insert an image', function () {
        jcontent = visitContentFolders(siteKey, jcontent);
        cy.apollo({
            mutationFile: 'toggleCkeditorVersionOnSite.graphql',
            variables: {sitePath: `/sites/${siteKey}`, ckeditor4: 'false'}
        });
        jcontent.createContent('Rich text');
        const ckeditor5 = new Ckeditor5();
        ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text').getToolbarButton('Insert image').click();
        cy.get('div[data-sel-role="picker-dialog"][data-sel-type="image"]').should('be.visible');
        cy.get('button[data-sel-picker-dialog-action="cancel"]').click();
        ckeditor5.cancel();
    });

    it('Opens link picker when insert a link', function () {
        jcontent = visitContentFolders(siteKey, jcontent);
        cy.apollo({
            mutationFile: 'toggleCkeditorVersionOnSite.graphql',
            variables: {sitePath: `/sites/${siteKey}`, ckeditor4: 'false'}
        });
        jcontent.createContent('Rich text');
        const ckeditor5 = new Ckeditor5();
        ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text').getToolbarButton('Insert link').click();
        cy.get('div[data-sel-role="picker-dialog"][data-sel-type="editoriallink"]').should('be.visible');
        cy.get('button[data-sel-picker-dialog-action="cancel"]').click();
        ckeditor5.cancel();
    });
});
