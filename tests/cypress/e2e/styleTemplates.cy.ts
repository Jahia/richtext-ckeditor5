import {JContent} from '@jahia/jcontent-cypress/dist/page-object';
import {createSite, deleteSite} from '@jahia/cypress';
import {Ckeditor5, RichTextCKeditor5Field} from '../page-object/ckeditor5';
import gql from 'graphql-tag';

const STYLE_MARKER = 'red-paragraph';
const STYLESHEET_PATH = '/modules/test-ckeditor5-templates/css/templates.css';

const clearConfig = () => {
    cy.apollo({
        mutation: gql`mutation {
            admin {
                jahia {
                    configuration(pid: "org.jahia.modules.richtextCKEditor5") {
                        a: remove(name: "excludeToolbarItems")
                        b: remove(name: "configs")
                    }
                }
            }
        }`
    });
};

const styleTagSelector = `style[data-jahia-ck5-styles="${STYLESHEET_PATH}"]`;

describe('Rich Text CKeditor 5 - Style templates', () => {
    const siteWithTemplates = 'ck5StyleTemplatesSite';
    const siteWithoutTemplates = 'ck5StyleTemplatesNoSite';
    let jcontent: JContent;

    before(() => {
        createSite(siteWithTemplates, {
            templateSet: 'test-ckeditor5-templates',
            serverName: 'localhost',
            locale: 'en'
        });
        createSite(siteWithoutTemplates, {
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en'
        });
        cy.loginAndStoreSession();
    });

    after(() => {
        cy.logout();
        deleteSite(siteWithTemplates);
        deleteSite(siteWithoutTemplates);
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
        clearConfig();
        jcontent = JContent.visit(siteWithTemplates, 'en', 'content-folders/contents');
    });

    afterEach(() => {
        clearConfig();
    });

    it('Loads the scoped stylesheet and shows the Styles dropdown', function () {
        const ce = jcontent.createContent('jnt:bigText');
        const ckeditor5 = new Ckeditor5();
        const ck5field: RichTextCKeditor5Field = ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text');

        // Stylesheet is fetched, scope-css-rewritten, and injected into the document head.
        cy.get(styleTagSelector, {timeout: 10000})
            .should('exist')
            .invoke('text')
            .should('include', STYLE_MARKER)
            .and('include', '.ck-content');

        ck5field.getStyleDropdown().should('exist');
        ce.cancel();
    });

    it('Applies a template class to the selected element', function () {
        const ce = jcontent.createContent('jnt:bigText');
        const ckeditor5 = new Ckeditor5();
        const ck5field: RichTextCKeditor5Field = ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text');

        ck5field.type('Hello world');
        // Place caret in the paragraph so the style can be applied to it.
        ck5field.getEditArea().find('p').first().click();
        ck5field.selectStyle('Red Paragraph');

        ck5field.getData().should('include', 'class="red-paragraph"');
        ce.cancel();
    });

    it('Keeps the stylesheet loaded when the style toolbar item is excluded', function () {
        cy.apollo({
            mutation: gql`mutation {
                admin {
                    jahia {
                        configuration(pid: "org.jahia.modules.richtextCKEditor5") {
                            mutateList(name: "excludeToolbarItems") {
                                addValue(value: "style")
                            }
                        }
                    }
                }
            }`
        });

        jcontent = JContent.visit(siteWithTemplates, 'en', 'content-folders/contents');
        const ce = jcontent.createContent('jnt:bigText');
        const ckeditor5 = new Ckeditor5();
        const ck5field: RichTextCKeditor5Field = ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text');

        ck5field.getStyleDropdown().should('not.exist');
        cy.get(styleTagSelector, {timeout: 10000})
            .should('exist')
            .invoke('text')
            .should('include', 'always-on');
        ce.cancel();
    });

    it('Does not inject a stylesheet for sites without the templates module', function () {
        jcontent = JContent.visit(siteWithoutTemplates, 'en', 'content-folders/contents');
        const ce = jcontent.createContent('jnt:bigText');
        const ckeditor5 = new Ckeditor5();
        const ck5field: RichTextCKeditor5Field = ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text');

        ck5field.getEditArea().should('be.visible');
        ck5field.getStyleDropdown().should('not.exist');
        cy.get(styleTagSelector).should('not.exist');
        ce.cancel();
    });

    it('Cleans up the injected style element when the editor unmounts', function () {
        let ce = jcontent.createContent('jnt:bigText');
        cy.get(styleTagSelector, {timeout: 10000}).should('exist');
        ce.cancel();
        cy.get(styleTagSelector).should('not.exist');

        // Reopening should re-inject exactly one element.
        jcontent = JContent.visit(siteWithTemplates, 'en', 'content-folders/contents');
        ce = jcontent.createContent('jnt:bigText');
        cy.get(styleTagSelector, {timeout: 10000}).should('have.length', 1);
        ce.cancel();
    });
});
