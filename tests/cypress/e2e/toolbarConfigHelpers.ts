import {JContent} from '@jahia/jcontent-cypress/dist/page-object';
import {createSite, deleteSite, enableModule} from '@jahia/cypress';
import {RichTextCKeditor5Field} from '../page-object/ckeditor5';
import gql from 'graphql-tag';

export const siteKey = 'toolbarCKEditor5Site';

export const clearConfig = () => {
    cy.apollo({
        mutation: gql`mutation {
            admin {
                jahia {
                    configuration(pid: "org.jahia.modules.richtextCKEditor5") {
                        remove(name: "configs")
                    }
                }
            }
        }`
    });
};

export const checkForCompleteToolbar = (ck5field: RichTextCKeditor5Field) => {
    // Menu bar + source editing
    ck5field.getMenuItemByLabel('Edit').should('exist');
    ck5field.getToolbarButton('Edit source').should('exist');
};

export const checkForAdvancedToolbar = (ck5field: RichTextCKeditor5Field) => {
    // No menu bar but source editing
    ck5field.getMenuBar().should('not.exist');
    ck5field.getToolbarButton('Edit source').should('not.exist');
    ck5field.getToolbarButton('Bookmark').should('exist');
};

export const checkForLightToolbar = (ck5field: RichTextCKeditor5Field) => {
    // No menu bar, no source editing but bookmark
    ck5field.getMenuBar().should('not.exist');
    ck5field.getToolbarButton('Edit source').should('not.exist');
    ck5field.getToolbarButton('Bookmark').should('exist');
};

export const checkForMinimalToolbar = (ck5field: RichTextCKeditor5Field) => {
    // No menu bar, no source editing, no bookmark but italic
    ck5field.getMenuBar().should('not.exist');
    ck5field.getToolbarButton('Edit source').should('not.exist');
    ck5field.getToolbarButton('Bookmark').should('not.exist');
    ck5field.getToolbarButton('Italic').should('exist');
};

export const setupToolbarConfig = () => {
    createSite(siteKey);

    cy.loginAndStoreSession(); // Edit in chief

    cy.apollo({
        mutationFile: 'disableEnableCK5.graphql',
        variables: {isEnabled: 'true'}
    });

    enableModule('test-ckeditor5-config', siteKey);
};

export const teardownToolbarConfig = () => {
    // Use direct request to avoid cy.logout() crashing on DNS failure during cleanup
    cy.request({
        url: `${Cypress.env('JAHIA_URL') || Cypress.config('baseUrl')}/cms/logout`,
        method: 'POST',
        failOnStatusCode: false,
        timeout: 30000
    });
    cy.apollo({
        mutationFile: 'disableEnableCK5.graphql',
        variables: {isEnabled: 'true'}
    });
    deleteSite(siteKey);
};

export const setupBeforeEach = (): JContent => {
    cy.loginAndStoreSession();
    return JContent.visit(siteKey, 'en', 'content-folders/contents');
};
