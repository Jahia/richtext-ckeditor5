import {JContent} from '@jahia/jcontent-cypress/dist/page-object';
import {Ckeditor5, RichTextCKeditor5Field} from '../page-object/ckeditor5';
import gql from 'graphql-tag';
import {
    clearConfig,
    setupToolbarConfig,
    teardownToolbarConfig,
    setupBeforeEach
} from './toolbarConfigHelpers';

describe('Rich Text CKeditor 5 - Toolbar exclusion configuration tests', () => {
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

    it('Excludes globally defined toolbar items', function () {
        cy.apollo({
            mutation: gql`mutation {
                admin {
                    jahia {
                        configuration(pid: "org.jahia.modules.richtextCKEditor5") {
                            mutateList(name: "excludeToolbarItems") {
                                a: addValue(value: "undo")
                                b: addValue(value: "redo")
                            }
                        }
                    }
                }
            }`
        });

        jcontent.createContent('jnt:bigText');
        const ckeditor5 = new Ckeditor5();
        const ck5field: RichTextCKeditor5Field = ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text');

        ck5field.getToolbarButton('Undo').should('not.exist');
        ck5field.getToolbarButton('Redo').should('not.exist');
    });

    it('Excludes specifically defined toolbar items', function () {
        cy.apollo({
            mutation: gql`mutation {
                admin {
                    jahia {
                        configuration(pid: "org.jahia.modules.richtextCKEditor5") {
                            a: mutateList(name: "excludeToolbarItems") {
                                a: addValue(value: "undo")
                                b: addValue(value: "redo")
                            }
                            b: mutateList(name: "configs") {
                                addObject {
                                    value(name:"name", value:"advanced")
                                    mutateList(name: "excludeToolbarItems") {
                                        b: addValue(value: "redo")
                                    }
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

        ck5field.getToolbarButton('Undo').should('exist');
        ck5field.getToolbarButton('Redo').should('not.exist');
    });
});
