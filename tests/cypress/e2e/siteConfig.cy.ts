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

        cy.apollo({
            mutationFile: 'disableEnableCK5.graphql',
            variables: {isEnabled: 'true'}
        });

        cy.apollo({
            mutationFile: 'updateIncludeSites.graphql',
            variables: {siteKey: ''}
        });

        cy.apollo({
            mutationFile: 'updateExcludeSites.graphql',
            variables: {siteKey: ''}
        });
    });

    after(function () {
        cy.logout();
        cy.apollo({
            mutationFile: 'disableEnableCK5.graphql',
            variables: {isEnabled: 'true'}
        });
        deleteSite(siteKey);
    });
    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    it('Can create content in content folders', function () {
        jcontent = visitContentFolders(siteKey, jcontent);
        jcontent.createContent('jnt:bigText');
        const ckeditor5 = new Ckeditor5();
        ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text').type(newlyCreatedContentCKEditor5);
        ckeditor5.create();
        jcontent.getTable().getRowByLabel(newlyCreatedContentCKEditor5).should('exist').and('be.visible');
    });

    it('Switches to CKEditor 4', function () {
        cy.apollo({
            mutationFile: 'updateExcludeSites.graphql',
            variables: {siteKey: siteKey}
        });

        jcontent = visitContentFolders(siteKey, jcontent);
        jcontent.createContent('jnt:bigText');
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
            mutationFile: 'removeProp.graphql',
            variables: {prop: 'excludeSites'}
        });

        jcontent = visitContentFolders(siteKey, jcontent);
        jcontent.getTable().getRowByLabel(newlyCreatedContentCKEditor4).contextMenu().select('Edit');
        const ckeditor5 = new Ckeditor5();
        ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text').getData().should('eq', `<p>${newlyCreatedContentCKEditor4}</p>`);
        ckeditor5.cancel();
    });

    it('Opens previously saved content from Ckeditor 5 and formats it to Heading 2', function () {
        cy.apollo({
            mutationFile: 'removeProp.graphql',
            variables: {prop: 'excludeSites'}
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
            mutationFile: 'removeProp.graphql',
            variables: {prop: 'excludeSites'}
        });

        jcontent.createContent('jnt:bigText');
        const ckeditor5 = new Ckeditor5();
        ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text').getToolbarButton('Insert image').click();
        cy.get('div[data-sel-role="picker-dialog"][data-sel-type="image"]').should('be.visible');
        cy.get('button[data-sel-picker-dialog-action="cancel"]').click();
        ckeditor5.cancel();
    });

    it('Switches to CKEditor 4 if not enabled by default', function () {
        cy.apollo({
            mutationFile: 'disableEnableCK5.graphql',
            variables: {isEnabled: 'false'}
        });

        jcontent = visitContentFolders(siteKey, jcontent);
        jcontent.createContent('jnt:bigText');
        const ckeditor4 = new ContentEditor();
        ckeditor4.getRichTextField('jnt:bigText_text').type(newlyCreatedContentCKEditor4);
        ckeditor4.create();
        jcontent.getTable().getRowByLabel(newlyCreatedContentCKEditor4).should('exist').and('be.visible');
    });

    it('Can create content with CKEditor 5 if disabled by default but included in site list', function () {
        cy.apollo({
            mutationFile: 'disableEnableCK5.graphql',
            variables: {isEnabled: 'false'}
        });

        cy.apollo({
            mutationFile: 'updateIncludeSites.graphql',
            variables: {siteKey: siteKey}
        });

        jcontent = visitContentFolders(siteKey, jcontent);
        jcontent.createContent('jnt:bigText');
        const ckeditor5 = new Ckeditor5();
        ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text').type(newlyCreatedContentCKEditor5);
        ckeditor5.create();
        jcontent.getTable().getRowByLabel(newlyCreatedContentCKEditor5).should('exist').and('be.visible');
    });
});
