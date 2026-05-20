import {JContent} from '@jahia/jcontent-cypress/dist/page-object';
import {Ckeditor5, RichTextCKeditor5Field} from '../page-object/ckeditor5';
import gql from 'graphql-tag';
import {createSite, deleteSite} from '@jahia/cypress';

describe('Rich Text CKEditor 5 - richtextMaxHeight config', () => {
    const siteKey = 'richtextMaxHeightTestSite';

    before(function () {
        createSite(siteKey);
    });

    after(function () {
        cy.logout();
        deleteSite(siteKey);
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    afterEach(() => {
        removeRichtextMaxHeight();
    });

    it('Applies the configured max-height to the editable area', function () {
        const MAX_HEIGHT_PX = 500;
        setRichtextMaxHeight(String(MAX_HEIGHT_PX));

        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        jcontent.createContent('jnt:bigText');
        const ckeditor5 = new Ckeditor5();
        const ck5field: RichTextCKeditor5Field = ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text');

        /**
         * The editable root ([contenteditable="true"]) is the element that receives the
         * `styles.wrapper` CSS class, which reads the --ck-editor-max-height CSS variable
         * set by the React component.
         *
         * We check the CSS max-height property directly (not the rendered height), so the
         * value will always be exactly `${MAX_HEIGHT_PX}px` with no sub-pixel variance.
         */
        ck5field.getEditArea()
            .invoke('css', 'max-height')
            .should('eq', `${MAX_HEIGHT_PX}px`);
    });

    it('Does not apply max-height when richtextMaxHeight is not configured', function () {
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        jcontent.createContent('jnt:bigText');
        const ckeditor5 = new Ckeditor5();
        const ck5field: RichTextCKeditor5Field = ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text');

        ck5field.getEditArea()
            .invoke('css', 'max-height')
            .should('eq', 'none');
    });

    // Helper methods

    const setRichtextMaxHeight = (value: string) => {

        cy.apollo({
            mutation: gql`
                mutation SetRichtextMaxHeight($value: String!) {
                    admin {
                        jahia {
                            configuration(pid: "org.jahia.modules.richtextCKEditor5") {
                                value(name: "richtextMaxHeight", value: $value)
                            }
                        }
                    }
                }
            `,
            variables: {value}
        });
    };

    const removeRichtextMaxHeight = () => {
        cy.apollo({
            mutation: gql`
                mutation {
                    admin {
                        jahia {
                            configuration(pid: "org.jahia.modules.richtextCKEditor5") {
                                remove(name: "richtextMaxHeight")
                            }
                        }
                    }
                }
            `,
        })
    }
});
