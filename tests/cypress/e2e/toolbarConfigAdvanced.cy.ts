import {JContent} from '@jahia/jcontent-cypress/dist/page-object';
import {Ckeditor5, RichTextCKeditor5Field} from '../page-object/ckeditor5';
import gql from 'graphql-tag';
import {
    siteKey,
    clearConfig,
    checkForCompleteToolbar,
    checkForMinimalToolbar,
    setupToolbarConfig,
    teardownToolbarConfig,
    setupBeforeEach
} from './toolbarConfigHelpers';

describe('Rich Text CKeditor 5 - Toolbar configuration tests (advanced)', () => {
    let jcontent: JContent;

    before(function () {
        setupToolbarConfig();
    });

    after(function () {
        teardownToolbarConfig();
    });

    beforeEach(() => {
        jcontent = setupBeforeEach();
    });

    afterEach(() => {
        clearConfig();
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
