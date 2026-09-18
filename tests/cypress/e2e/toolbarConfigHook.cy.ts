import {JContent} from '@jahia/jcontent-cypress/dist/page-object';
import {Ckeditor5, RichTextCKeditor5Field} from '../page-object/ckeditor5';
import gql from 'graphql-tag';
import {
    clearConfig,
    setupToolbarConfig,
    teardownToolbarConfig,
    setupBeforeEach
} from './toolbarConfigHelpers';

/**
 * Covers the `window.jahiaCk5Init` hook: registering CK5 configurations from a plain
 * script, without a functional module federation setup (the situation of JavaScript
 * Modules). The hooks under test live in the `test-ckeditor5-config` test module, in
 * `javascript/apps/registerExtensions.js`.
 */
describe('Rich Text CKeditor 5 - Toolbar configuration tests (jahiaCk5Init hook)', () => {
    let jcontent: JContent;

    const applyConfig = (name: string) => {
        cy.apollo({
            mutation: gql`mutation {
                admin {
                    jahia {
                        configuration(pid: "org.jahia.modules.richtextCKEditor5") {
                            mutateList(name: "configs") {
                                addObject {
                                    value(name:"name", value:"${name}")
                                }
                            }
                        }
                    }
                }
            }`
        });
    };

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

    it('Loads a config registered through the hook', function () {
        applyConfig('hookConfigCK5');

        jcontent.createContent('jnt:bigText');
        const ck5field: RichTextCKeditor5Field = new Ckeditor5().getRichTextCKeditor5Field('jnt:bigText_text');

        // The hook inherits `minimal` and narrows the toolbar down to bold + its own button
        ck5field.getMenuBar().should('not.exist');
        ck5field.getToolbarButton('Edit source').should('not.exist');
        ck5field.getToolbarButton('Italic').should('not.exist');
        ck5field.getToolbarButton('Bold').should('exist');
        // The button comes from a plugin the hook built from the injected `ckeditor5` namespace
        ck5field.getToolbarButton('Test Marker').should('exist');
    });

    it('Runs a plugin registered through the hook', function () {
        applyConfig('hookConfigCK5');

        jcontent.createContent('jnt:bigText');
        const ck5field: RichTextCKeditor5Field = new Ckeditor5().getRichTextCKeditor5Field('jnt:bigText_text');

        ck5field.getEditArea().click(); // Focus the editor with a real click
        ck5field.getToolbarButton('Test Marker').click();

        // Proves the hook-provided plugin runs against the same CKEditor 5 instance
        ck5field.getData().should('include', 'hook-plugin-ran');
    });

    it('Keeps running the hooks that follow a faulty one', function () {
        // `hookConfigCK5AfterFailure` is registered by a hook declared after one that throws
        // and after a non-function entry: neither may prevent it from being reached.
        applyConfig('hookConfigCK5AfterFailure');

        jcontent.createContent('jnt:bigText');
        const ck5field: RichTextCKeditor5Field = new Ckeditor5().getRichTextCKeditor5Field('jnt:bigText_text');

        ck5field.getMenuBar().should('not.exist');
        ck5field.getToolbarButton('Bold').should('not.exist');
        ck5field.getToolbarButton('Italic').should('exist');
    });
});
