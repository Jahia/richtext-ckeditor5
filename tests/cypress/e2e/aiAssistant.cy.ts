import {JContent} from '@jahia/jcontent-cypress/dist/page-object';
import {createSite, deleteSite, createUser, deleteUser, grantRoles} from '@jahia/cypress';
import {Ckeditor5, RichTextCKeditor5Field} from '../page-object/ckeditor5';

describe('AI Assistant tests', () => {
    const siteKey = 'ck5AiSite';
    let jcontent: JContent;

    before(function () {
        createSite(siteKey);
        cy.loginAndStoreSession();
    });

    after(function () {
        // Restore AI to disabled (default)
        cy.apollo({
            mutationFile: 'enableDisableAI.graphql',
            variables: {isEnabled: 'false'}
        });
        cy.logout();
        deleteSite(siteKey);
    });

    describe('AI configuration toggle', () => {
        beforeEach(() => {
            cy.loginAndStoreSession();
        });

        it('should NOT show AI toolbar buttons when AI is disabled', () => {
            cy.apollo({
                mutationFile: 'enableDisableAI.graphql',
                variables: {isEnabled: 'false'}
            });

            jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
            jcontent.createContent('jnt:bigText');
            const ckeditor5 = new Ckeditor5();
            const ck5field: RichTextCKeditor5Field = ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text');
            ck5field.type('test content');

            ck5field.getToolbarButton('AI Assistant').should('not.exist');
            ck5field.getToolbarButton('AI Commands').should('not.exist');

            ck5field.assertMenuBarDoesNotContain('Tools', 'AI Assistant');
            ck5field.assertMenuBarDoesNotContain('Tools', 'AI Commands');

            ckeditor5.cancelAndDiscard();
        });

        it('should show AI toolbar buttons when AI is enabled', () => {
            cy.apollo({
                mutationFile: 'enableDisableAI.graphql',
                variables: {isEnabled: 'true'}
            }).then(resp => {
                expect(resp?.data?.admin.jahia.configuration.value).to.be.eq('true');
            });

            jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
            jcontent.createContent('jnt:bigText');
            const ckeditor5 = new Ckeditor5();
            const ck5field: RichTextCKeditor5Field = ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text');
            ck5field.type('test content');

            ck5field.getToolbarButton('AI Assistant').should('be.visible');
            ck5field.getToolbarButton('AI Commands').should('be.visible');

            ck5field.clickMenuItemByLabel('Tools');
            ck5field.getMenuSubItemByLabel('AI Assistant').should('be.visible');
            ck5field.getMenuSubItemByLabel('AI Commands').should('be.visible');

            ckeditor5.cancelAndDiscard();
        });
    });

    describe('AI proxy endpoint permissions', () => {
        const testUser = 'aiTestUser';
        const testPassword = 'password';
        const proxyUrl = '/modules/ckeditor5/ai-proxy';
        const contentPath = `/sites/${siteKey}/contents`;
        const requestBody = JSON.stringify({
            model: 'gpt-4',
            messages: [{role: 'user', content: 'test'}]
        });

        before(() => {
            createUser(testUser, testPassword);
            // Reviewer does not have wysiwyg-editor-toolbar permission
            grantRoles(`/sites/${siteKey}/home`, ['reviewer'], testUser, 'USER');
        });

        after(() => {
            deleteUser(testUser);
        });

        it('should return unauthorized when no X-Jahia-Path header is provided', () => {
            cy.loginAndStoreSession();
            cy.request({
                method: 'POST',
                url: proxyUrl,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: requestBody,
                failOnStatusCode: false
            }).then(response => {
                expect(response.status).to.eq(401);
                expect(response.body).to.have.property('error', 'Unauthorized');
            });
        });

        it('should return unauthorized for user without wysiwyg-editor-toolbar permission', () => {
            cy.loginAndStoreSession(testUser, testPassword);
            cy.request({
                method: 'POST',
                url: proxyUrl,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Jahia-Path': contentPath
                },
                body: requestBody,
                failOnStatusCode: false
            }).then(response => {
                expect(response.status).to.eq(401);
                expect(response.body).to.have.property('error', 'Unauthorized');
            });
        });

        it('should return unauthorized for unauthenticated (guest) requests', () => {
            cy.request({
                method: 'POST',
                url: proxyUrl,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Jahia-Path': contentPath
                },
                body: requestBody,
                failOnStatusCode: false
            }).then(response => {
                expect(response.status).to.eq(401);
            });
        });
    });

    describe('AI proxy endpoint with AI disabled', () => {
        const proxyUrl = '/modules/ckeditor5/ai-proxy';
        const contentPath = `/sites/${siteKey}/contents`;
        const requestBody = JSON.stringify({
            model: 'gpt-4',
            messages: [{role: 'user', content: 'test'}]
        });

        it('should return service unavailable when AI is disabled', () => {
            cy.loginAndStoreSession();
            cy.apollo({
                mutationFile: 'enableDisableAI.graphql',
                variables: {isEnabled: 'false'}
            });

            cy.request({
                method: 'POST',
                url: proxyUrl,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Jahia-Path': contentPath
                },
                body: requestBody,
                failOnStatusCode: false
            }).then(response => {
                expect(response.status).to.eq(503);
                expect(response.body).to.have.property('error');
            });
        });
    });
});
