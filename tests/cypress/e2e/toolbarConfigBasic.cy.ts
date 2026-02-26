import {JContent} from '@jahia/jcontent-cypress/dist/page-object';
import {Ckeditor5, RichTextCKeditor5Field} from '../page-object/ckeditor5';
import gql from 'graphql-tag';
import {
    siteKey,
    clearConfig,
    checkForCompleteToolbar,
    checkForAdvancedToolbar,
    checkForLightToolbar,
    checkForMinimalToolbar,
    setupToolbarConfig,
    teardownToolbarConfig,
    setupBeforeEach
} from './toolbarConfigHelpers';

describe('Rich Text CKeditor 5 - Toolbar configuration tests (basic)', () => {
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
});
