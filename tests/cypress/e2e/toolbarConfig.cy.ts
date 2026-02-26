import {JContent} from '@jahia/jcontent-cypress/dist/page-object';
import {createSite, deleteSite, enableModule} from '@jahia/cypress';
import {Ckeditor5, RichTextCKeditor5Field} from '../page-object/ckeditor5';
import gql from 'graphql-tag';

describe('Rich Text CKeditor 5 - Toolbar configuration tests', () => {
    const siteKey = 'toolbarCKEditor5Site';
    let jcontent: JContent;

    const clearConfig = () => {
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

    const checkForCompleteToolbar = (ck5field: RichTextCKeditor5Field) => {
        // Menu bar + source editing
        ck5field.getMenuItemByLabel('Edit').should('exist');
        ck5field.getToolbarButton('Edit source').should('exist');
    };

    const checkForAdvancedToolbar = (ck5field: RichTextCKeditor5Field) => {
        // No menu bar but source editing
        ck5field.getMenuBar().should('not.exist');
        ck5field.getToolbarButton('Edit source').should('not.exist');
        ck5field.getToolbarButton('Bookmark').should('exist');
    };

    const checkForLightToolbar = (ck5field: RichTextCKeditor5Field) => {
        // No menu bar, no source editing but bookmark
        ck5field.getMenuBar().should('not.exist');
        ck5field.getToolbarButton('Edit source').should('not.exist');
        ck5field.getToolbarButton('Bookmark').should('exist');
    };

    const checkForMinimalToolbar = (ck5field: RichTextCKeditor5Field) => {
        // No menu bar, no source editing, no bookmark but italic
        ck5field.getMenuBar().should('not.exist');
        ck5field.getToolbarButton('Edit source').should('not.exist');
        ck5field.getToolbarButton('Bookmark').should('not.exist');
        ck5field.getToolbarButton('Italic').should('exist');
    };

    before(function () {
        createSite(siteKey);

        cy.loginAndStoreSession(); // Edit in chief

        cy.apollo({
            mutationFile: 'disableEnableCK5.graphql',
            variables: {isEnabled: 'true'}
        });

        // Health check: ensure DNS is resolving before calling enableModule.
        // Docker embedded DNS can degrade after sustained testing.
        cy.request({
            url: `${Cypress.env('JAHIA_URL') || Cypress.config('baseUrl')}/modules/api/provisioning`,
            method: 'GET',
            failOnStatusCode: false,
            timeout: 60000
        });

        enableModule('test-ckeditor5-config', siteKey);
    });

    after(function () {
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
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
    });

    afterEach(() => {
        clearConfig();
    });

    it('Shows complete config by default for root', function () {
        jcontent.createContent('jnt:bigText');
        const ckeditor5 = new Ckeditor5();
        const ck5field: RichTextCKeditor5Field = ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text');

        checkForCompleteToolbar(ck5field);
    });

    it('Shows advanced toolbar', function () {
        cy.apollo({
            mutation: gql`mutation {
                admin {
                    jahia {
                        configuration(pid: "org.jahia.modules.richtextCKEditor5") {
                            mutateList(name: "configs") {
                                addObject {
                                    value(name:"name", value:"advanced")
                                }
                            }
                        }
                    }
                }
            }`
        });

        jcontent.createContent('jnt:bigText');
        const ckeditor5 = new Ckeditor5();
        const ck5field: RichTextCKeditor5Field = ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text');

        checkForAdvancedToolbar(ck5field);
    });

    it('Shows light toolbar', function () {
        cy.apollo({
            mutation: gql`mutation {
                admin {
                    jahia {
                        configuration(pid: "org.jahia.modules.richtextCKEditor5") {
                            mutateList(name: "configs") {
                                addObject {
                                    value(name:"name", value:"light")
                                }
                            }
                        }
                    }
                }
            }`
        });

        jcontent.createContent('jnt:bigText');
        const ckeditor5 = new Ckeditor5();
        const ck5field: RichTextCKeditor5Field = ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text');

        checkForLightToolbar(ck5field);
    });

    it('Shows minimal toolbar', function () {
        cy.apollo({
            mutation: gql`mutation {
                admin {
                    jahia {
                        configuration(pid: "org.jahia.modules.richtextCKEditor5") {
                            mutateList(name: "configs") {
                                addObject {
                                    value(name:"name", value:"minimal")
                                }
                            }
                        }
                    }
                }
            }`
        });

        jcontent.createContent('jnt:bigText');
        const ckeditor5 = new Ckeditor5();
        const ck5field: RichTextCKeditor5Field = ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text');

        checkForMinimalToolbar(ck5field);
    });

    it('Handles default configuration with permission', function () {
        cy.apollo({
            mutation: gql`mutation {
                admin {
                    jahia {
                        configuration(pid: "org.jahia.modules.richtextCKEditor5") {
                            mutateList(name: "configs") {
                                addObject {
                                    n: value(name:"name", value:"minimal")
                                    p: value(name: "permission", value: "none")
                                }
                            }
                        }
                    }
                }
            }`
        });

        const ce = jcontent.createContent('jnt:bigText');
        let ckeditor5 = new Ckeditor5();
        let ck5field: RichTextCKeditor5Field = ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text');
        checkForCompleteToolbar(ck5field);
        ce.cancel();

        cy.apollo({
            mutation: gql`mutation {
                admin {
                    jahia {
                        configuration(pid: "org.jahia.modules.richtextCKEditor5") {
                            mutateList(name: "configs") {
                                addObject {
                                    n: value(name:"name", value:"minimal")
                                    p: value(name: "permission", value: "jcr:read")
                                }
                            }
                        }
                    }
                }
            }`
        });

        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        jcontent.createContent('jnt:bigText');
        ckeditor5 = new Ckeditor5();
        ck5field = ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text');
        checkForMinimalToolbar(ck5field);
    });

    it('Handles site specific configuration without permission', function () {
        cy.apollo({
            mutation: gql`mutation {
                admin {
                    jahia {
                        configuration(pid: "org.jahia.modules.richtextCKEditor5") {
                            mutateList(name: "configs") {
                                addObject {
                                    value(name:"name", value:"minimal")
                                    mutateList(name: "siteKeys"){
                                        addValue(value:"mysite")
                                    }
                                }
                            }
                        }
                    }
                }
            }`
        });

        const ce = jcontent.createContent('jnt:bigText');
        let ckeditor5 = new Ckeditor5();
        let ck5field: RichTextCKeditor5Field = ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text');
        checkForCompleteToolbar(ck5field);
        ce.cancel();

        clearConfig();

        cy.apollo({
            mutation: gql`mutation {
                admin {
                    jahia {
                        configuration(pid: "org.jahia.modules.richtextCKEditor5") {
                            mutateList(name: "configs") {
                                addObject {
                                    value(name:"name", value:"minimal")
                                    mutateList(name: "siteKeys"){
                                        a: addValue(value:"mysite")
                                        b: addValue(value: "${siteKey}")
                                    }
                                }
                            }
                        }
                    }
                }
            }`
        });

        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        jcontent.createContent('jnt:bigText');
        ckeditor5 = new Ckeditor5();
        ck5field = ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text');
        checkForMinimalToolbar(ck5field);
    });

    it('Handles site specific configuration with permission', function () {
        cy.apollo({
            mutation: gql`mutation {
                admin {
                    jahia {
                        configuration(pid: "org.jahia.modules.richtextCKEditor5") {
                            mutateList(name: "configs") {
                                addObject {
                                    n: value(name:"name", value:"minimal")
                                    p: value(name:"permission", value:"none")
                                    mutateList(name: "siteKeys"){
                                        a :addValue(value:"mysite")
                                        b: addValue(value:"${siteKey}")
                                    }
                                }
                            }
                        }
                    }
                }
            }`
        });

        const ce = jcontent.createContent('jnt:bigText');
        let ckeditor5 = new Ckeditor5();
        let ck5field: RichTextCKeditor5Field = ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text');
        checkForCompleteToolbar(ck5field);
        ce.cancel();

        clearConfig();

        cy.apollo({
            mutation: gql`mutation {
                admin {
                    jahia {
                        configuration(pid: "org.jahia.modules.richtextCKEditor5") {
                            mutateList(name: "configs") {
                                addObject {
                                    n: value(name:"name", value:"minimal")
                                    p: value(name:"permission", value:"jcr:read")
                                    mutateList(name: "siteKeys"){
                                        a: addValue(value:"mysite")
                                        b: addValue(value:"${siteKey}")
                                    }
                                }
                            }
                        }
                    }
                }
            }`
        });

        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        jcontent.createContent('jnt:bigText');
        ckeditor5 = new Ckeditor5();
        ck5field = ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text');
        checkForMinimalToolbar(ck5field);
    });

    it('Prioritizes config for site over default', function () {
        cy.apollo({
            mutation: gql`mutation {
                admin {
                    jahia {
                        configuration(pid: "org.jahia.modules.richtextCKEditor5") {
                            mutateList(name: "configs") {
                                a: addObject {
                                    a: value(name:"name", value:"advanced")
                                    b: value(name:"permission", value:"none")
                                }
                                b: addObject {
                                    value(name:"name", value:"advanced")
                                }
                                c: addObject {
                                    n: value(name:"name", value:"minimal")
                                    p: value(name:"permission", value:"jcr:read")
                                    mutateList(name: "siteKeys"){
                                        a: addValue(value:"mysite")
                                        b: addValue(value:"${siteKey}")
                                    }
                                }
                            }
                        }
                    }
                }
            }`
        });

        const ce = jcontent.createContent('jnt:bigText');
        const ckeditor5 = new Ckeditor5();
        const ck5field: RichTextCKeditor5Field = ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text');
        checkForMinimalToolbar(ck5field);
        ce.cancel();
    });

    it('Correctly handles list with permissions', function () {
        cy.apollo({
            mutation: gql`mutation {
                admin {
                    jahia {
                        configuration(pid: "org.jahia.modules.richtextCKEditor5") {
                            mutateList(name: "configs") {
                                a: addObject {
                                    a: value(name:"name", value:"advanced")
                                    b: value(name:"permission", value:"none")
                                }
                                b: addObject {
                                    a: value(name:"name", value:"light")
                                    b: value(name:"permission", value:"fake")
                                }
                                c: addObject {
                                    a: value(name:"name", value:"minimal")
                                    b: value(name:"permission", value:"jcr:read")
                                }
                                d: addObject {
                                    n: value(name:"name", value:"complete")
                                    p: value(name:"permission", value:"jcr:boo")
                                    mutateList(name: "siteKeys"){
                                        a: addValue(value:"mysite")
                                        b: addValue(value:"${siteKey}")
                                    }
                                }
                                e: addObject {
                                    n: value(name:"name", value:"minimal")
                                    p: value(name:"permission", value:"jcr:zoo")
                                    mutateList(name: "siteKeys"){
                                        a: addValue(value:"mysite")
                                        b: addValue(value:"${siteKey}")
                                    }
                                }
                            }
                        }
                    }
                }
            }`
        });

        const ce = jcontent.createContent('jnt:bigText');
        const ckeditor5 = new Ckeditor5();
        const ck5field: RichTextCKeditor5Field = ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text');
        checkForMinimalToolbar(ck5field);
        ce.cancel();
    });

    it('Loads extension config', function () {
        cy.apollo({
            mutation: gql`mutation {
                admin {
                    jahia {
                        configuration(pid: "org.jahia.modules.richtextCKEditor5") {
                            mutateList(name: "configs") {
                                addObject {
                                    value(name:"name", value:"testConfigCK5")
                                }
                            }
                        }
                    }
                }
            }`
        });

        jcontent.createContent('jnt:bigText');
        const ckeditor5 = new Ckeditor5();
        const ck5field: RichTextCKeditor5Field = ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text');
        ck5field.getMenuBar().should('not.exist');
        ck5field.getToolbarButton('Edit source').should('not.exist');
        ck5field.getToolbarButton('Bookmark').should('not.exist');
        ck5field.getToolbarButton('Remove Format').should('not.exist');
        ck5field.getToolbarButton('Bold').should('exist');
        ck5field.getToolbarButton('Italic').should('exist');
        ck5field.getToolbarButton('Underline').should('exist');
    });

    it('Loads cnd config', function () {
        jcontent.createContent('jnt:customArticle');
        const ckeditor5 = new Ckeditor5();
        const ck5field: RichTextCKeditor5Field = ckeditor5.getRichTextCKeditor5Field('jnt:customArticle_abstract');
        ck5field.getMenuBar().should('not.exist');
        ck5field.getToolbarButton('Edit source').should('not.exist');
        ck5field.getToolbarButton('Bookmark').should('not.exist');
        ck5field.getToolbarButton('Underline').should('not.exist');
        ck5field.getToolbarButton('Italic').should('not.exist');
        ck5field.getToolbarButton('Bold').should('exist');
    });

    it('Loads json override config', function () {
        jcontent.createContent('jnt:customArticleOverride');
        const ckeditor5 = new Ckeditor5();
        const ck5field: RichTextCKeditor5Field = ckeditor5.getRichTextCKeditor5Field('jnt:customArticleOverride_abstract');
        ck5field.getMenuBar().should('not.exist');
        ck5field.getToolbarButton('Edit source').should('not.exist');
        ck5field.getToolbarButton('Bookmark').should('not.exist');
        ck5field.getToolbarButton('Underline').should('not.exist');
        ck5field.getToolbarButton('Italic').should('not.exist');
        ck5field.getToolbarButton('Bold').should('exist');
    });
});
