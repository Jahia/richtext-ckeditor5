import {ContentEditor, JContent} from '@jahia/jcontent-cypress/dist/page-object';
import {ContentTypeSelector} from '@jahia/jcontent-cypress/dist/page-object/createContent';
import {
    addMixins,
    addNode,
    createSite,
    deleteNode,
    deleteSite,
    enableModule,
    getComponent,
    publishAndWaitJobEnding,
    setNodeProperty
} from '@jahia/cypress';
import gql from 'graphql-tag';
import {Ckeditor5, RichTextCKeditor5Field} from '../page-object/ckeditor5';

describe('Create content in an extended rich text', () => {
    const siteKey = 'createContentCKEditor5Site';
    const ckeditor5 = new Ckeditor5();
    const contentsPath = `/sites/${siteKey}/contents`;
    const homePath = `/sites/${siteKey}/home`;
    const areaPath = `${homePath}/area-main`;
    const extendedPath = `${areaPath}/extended`;
    const previewUrl = `/cms/render/default/en/sites/${siteKey}/home.html`;
    const liveUrl = `/cms/render/live/en/sites/${siteKey}/home.html`;
    const fieldName = 'jnt:extendedRichText_text';
    const createLabel = 'Create new content';
    const saveFirstLabel = 'Save the rich text first to create content in it';
    const noCreatableType = 'No content type can be created here.';
    const storedReference = /data-jahia-ref="([0-9a-f-]{36})"/;

    const uuids: {[name: string]: string} = {};

    const reference = (uuid: string) => `<div class="jahia-content-reference" data-jahia-ref="${uuid}"></div>`;
    const referencedUuids = (data: string) => (data.match(new RegExp(storedReference.source, 'g')) || [])
        .map(attribute => attribute.match(storedReference)[1]);

    type ExtendedNode = {
        text: {value: string} | null;
        children: {nodes: {uuid: string, primaryNodeType: {name: string}, text: {value: string} | null}[]};
    };

    const getExtended = (language = 'en'): Cypress.Chainable<ExtendedNode> => cy.apollo({
        query: gql`query extendedRichText($path: String!, $language: String!) {
            jcr {
                nodeByPath(path: $path) {
                    text: property(name: "text", language: $language) { value }
                    children(typesFilter: {types: ["jnt:content"]}) {
                        nodes {
                            uuid
                            primaryNodeType { name }
                            text: property(name: "text", language: $language) { value }
                        }
                    }
                }
            }
        }`,
        variables: {path: extendedPath, language}
    }).its('data.jcr.nodeByPath');

    const resetExtended = () => {
        deleteNode(extendedPath);
        addNode({
            parentPathOrId: areaPath,
            name: 'extended',
            primaryNodeType: 'jnt:extendedRichText',
            properties: [
                {name: 'text', language: 'en', value: `<p>Extended intro</p>${reference(uuids.author)}`},
                {name: 'text', language: 'fr', value: '<p>Texte étendu</p>'}
            ]
        });
    };

    const editComponent = (text: string, field: string, language = 'en'): RichTextCKeditor5Field => {
        JContent.visit(siteKey, language, 'pages/home').switchToListMode().editComponentByText(text);
        const ck5field = ckeditor5.getRichTextCKeditor5Field(field);
        ck5field.getEditArea().should('contain', text);
        return ck5field;
    };

    const editExtended = (): RichTextCKeditor5Field => editComponent('Extended intro', fieldName);

    const nestedEditor = () => cy.get(ContentEditor.defaultSelector).last();

    const contentTypeSelector = () => getComponent(ContentTypeSelector);

    const fillAndCreateText = (text: string) => {
        new ContentEditor().getSmallTextField('jnt:text_text').addNewValue(text);
        new ContentEditor().createUnchecked();
    };

    const createTextChild = (text: string) => {
        contentTypeSelector().searchForContentType('jnt:text').selectContentType('jnt:text').create();
        fillAndCreateText(text);
        cy.get(ContentEditor.defaultSelector).should('have.length', 1);
    };

    const assertOnTop = (selector: string) => {
        cy.get(selector).last().should('be.visible').then($element => {
            const element = $element[0];
            const rect = element.getBoundingClientRect();
            const hit = element.ownerDocument.elementFromPoint(rect.left + (rect.width / 2), rect.top + (rect.height / 2));
            expect(element.contains(hit), `the centre of ${selector} is not covered`).to.be.true;
        });
    };

    const assertNoEditorOverlay = () => {
        cy.get('body').should($body => {
            expect($body.find('.ck-balloon-panel_visible:not(.ck-tooltip)'), 'visible balloon').to.have.length(0);
            expect($body.find('.ck-menu-bar__menu__panel:visible'), 'open menu').to.have.length(0);
            expect($body.find('.ck-fullscreen__main-wrapper'), 'CKEditor fullscreen').to.have.length(0);
        });
    };

    const assertSelectorOnTopThenCancel = () => {
        assertNoEditorOverlay();
        assertOnTop(ContentTypeSelector.defaultSelector);
        contentTypeSelector().cancel();
        cy.get(ContentTypeSelector.defaultSelector).should('not.exist');
    };

    before(() => {
        createSite(siteKey, {templateSet: 'dx-base-demo-templates', serverName: 'localhost', locale: 'en', languages: 'en,fr'});
        enableModule('test-ckeditor5-config', siteKey);

        addNode({
            parentPathOrId: contentsPath,
            name: 'author-bio',
            primaryNodeType: 'jnt:text',
            properties: [{name: 'text', language: 'en', value: 'Jane Doe bio'}]
        }).then(result => {
            uuids.author = result.data.jcr.addNode.uuid;
        });

        cy.then(() => addNode({
            parentPathOrId: homePath,
            name: 'area-main',
            primaryNodeType: 'jnt:contentList',
            children: [
                {
                    name: 'extended',
                    primaryNodeType: 'jnt:extendedRichText',
                    properties: [{name: 'text', language: 'en', value: '<p>Extended intro</p>'}]
                },
                {
                    name: 'plain',
                    primaryNodeType: 'jnt:bigText',
                    properties: [{name: 'text', language: 'en', value: '<p>Plain intro</p>'}]
                }
            ]
        }));
    });

    after(() => {
        cy.logout();
        deleteSite(siteKey);
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
        resetExtended();
    });

    it('should keep the unsaved text and insert the created content', () => {
        const ck5field = editExtended();
        ck5field.appendText(' typed before create');

        ck5field.getCreateContentButton().should('not.have.class', 'ck-disabled').click();
        createTextChild('Created child');

        ck5field.getData().then(data => {
            expect(data).to.contain('typed before create');
            const created = referencedUuids(data).filter(uuid => uuid !== uuids.author);
            expect(created, 'one new reference').to.have.length(1);
        });
        ck5field.getReferenceCards().should('have.length', 2);
        ck5field.getEditArea().find('.jahia-content-reference-card').should('contain', 'Created child');
    });

    it('should store the created content as a child of the rich text', () => {
        const ck5field = editExtended();
        ck5field.getCreateContentButton().click();
        createTextChild('Stored child');
        ckeditor5.save();

        getExtended().then(node => {
            const children = node.children.nodes;
            expect(children, 'one child').to.have.length(1);
            expect(children[0].primaryNodeType.name).to.eq('jnt:text');
            expect(children[0].text.value).to.eq('Stored child');
            expect(node.text.value).to.contain(`data-jahia-ref="${children[0].uuid}"`);
            expect(node.text.value).to.contain(`data-jahia-ref="${uuids.author}"`);
        });
    });

    describe('with the OSGi toolbar exclusion', () => {
        afterEach(() => {
            cy.apollo({
                mutation: gql`mutation {
                    admin {
                        jahia {
                            configuration(pid: "org.jahia.modules.richtextCKEditor5") {
                                remove(name: "excludeToolbarItems")
                            }
                        }
                    }
                }`
            });
        });

        it('should show the button only on a field with the createContent option', () => {
            cy.log('A jnt:bigText has no button and no menu entry');
            const plainField = editComponent('Plain intro', 'jnt:bigText_text');
            plainField.getToolbarButton('Reference existing content').should('exist');
            plainField.getCreateContentButton().should('not.exist');
            plainField.assertMenuBarDoesNotContain('Insert', createLabel);
            ckeditor5.cancel();

            cy.log('The Insert menu of the extended rich text holds the entry');
            const extendedField = editExtended();
            extendedField.clickMenuItemByLabel('Insert');
            extendedField.getMenuSubItemByLabel(createLabel).should('exist');
            ckeditor5.cancel();

            cy.log('excludeToolbarItems hides the button');
            cy.apollo({
                mutation: gql`mutation {
                    admin {
                        jahia {
                            configuration(pid: "org.jahia.modules.richtextCKEditor5") {
                                mutateList(name: "excludeToolbarItems") {
                                    addValue(value: "jahiaCreateContent")
                                }
                            }
                        }
                    }
                }`
            });
            const excludedField = editExtended();
            excludedField.getToolbarButton('Reference existing content').should('exist');
            excludedField.getCreateContentButton().should('not.exist');
            excludedField.assertMenuBarDoesNotContain('Insert', createLabel);
            ckeditor5.cancel();
        });
    });

    it('should show the selector and the nested editor above the editor overlays', () => {
        const ck5field = editExtended();

        cy.log('A selected reference: the widget toolbar is visible');
        ck5field.getReferenceCard(0).click();
        cy.get('.ck-balloon-panel_visible:not(.ck-tooltip)').should('exist');
        ck5field.getCreateContentButton().click();
        assertSelectorOnTopThenCancel();

        cy.log('The caret in a link: the link balloon is visible');
        ck5field.type('<p>Extended intro <a href="https://example.com">a link</a></p>');
        ck5field.getEditArea().contains('a link').click('center');
        ck5field.getEditArea().type('{leftArrow}{leftArrow}', {delay: 300});
        ck5field.clickMenuItemByLabel('Insert');
        ck5field.getMenuSubItemByLabel('Link').click();
        cy.get('.ck-balloon-panel_visible:not(.ck-tooltip)').should('exist');
        ck5field.getCreateContentButton().click();
        assertSelectorOnTopThenCancel();

        cy.log('The Insert menu is open');
        ck5field.clickMenuItemByLabel('Insert');
        ck5field.getCreateContentButton().click();
        assertSelectorOnTopThenCancel();

        cy.log('The entry of the Insert menu');
        ck5field.clickMenuItemByLabel('Insert');
        ck5field.getMenuSubItemByLabel(createLabel).click();
        assertSelectorOnTopThenCancel();

        cy.log('CKEditor fullscreen is on');
        ck5field.execute('toggleFullscreen');
        ck5field.getFullscreenToolbarButton(createLabel).click();
        assertNoEditorOverlay();
        assertOnTop(ContentTypeSelector.defaultSelector);

        cy.log('The nested editor is on top too');
        contentTypeSelector().searchForContentType('jnt:text').selectContentType('jnt:text').create();
        new ContentEditor().getSmallTextField('jnt:text_text').should('exist');
        cy.get(ContentEditor.defaultSelector).should('have.length', 2);
        assertNoEditorOverlay();
        assertOnTop(ContentEditor.defaultSelector);
        nestedEditor().find('[data-sel-role="backButton"]').click();
        cy.get(ContentEditor.defaultSelector).should('have.length', 1);
    });

    it('should show the nested editor above a fullscreen parent editor', () => {
        ContentEditor.visit(extendedPath, siteKey, 'en', 'pages/home');
        const ck5field = ckeditor5.getRichTextCKeditor5Field(fieldName);
        ck5field.getEditArea().should('contain', 'Extended intro');

        ck5field.getCreateContentButton().click();
        assertOnTop(ContentTypeSelector.defaultSelector);
        contentTypeSelector().searchForContentType('jnt:text').selectContentType('jnt:text').create();
        new ContentEditor().getSmallTextField('jnt:text_text').should('exist');
        assertOnTop(ContentEditor.defaultSelector);

        fillAndCreateText('Fullscreen child');
        cy.get(ContentEditor.defaultSelector).should('have.length', 1);
        ck5field.getEditArea().find('.jahia-content-reference-card').should('contain', 'Fullscreen child');
        ckeditor5.cancelAndDiscard();
    });

    it('should leave no state behind when a dialog is cancelled', () => {
        const ck5field = editExtended();
        ck5field.getData().as('initialData');

        cy.log('Cancel the selector');
        ck5field.getCreateContentButton().click();
        contentTypeSelector().cancel();
        cy.get(ContentTypeSelector.defaultSelector).should('not.exist');
        cy.get('@initialData').then(initialData => {
            ck5field.getData().should('eq', initialData);
        });

        cy.log('Cancel the nested editor');
        ck5field.getCreateContentButton().should('not.have.class', 'ck-disabled').click();
        contentTypeSelector().searchForContentType('jnt:text').selectContentType('jnt:text').create();
        new ContentEditor().getSmallTextField('jnt:text_text').should('exist');
        nestedEditor().find('[data-sel-role="backButton"]').click();
        cy.get(ContentEditor.defaultSelector).should('have.length', 1);
        cy.get('@initialData').then(initialData => {
            ck5field.getData().should('eq', initialData);
        });
        getExtended().its('children.nodes').should('have.length', 0);

        cy.log('Create, then discard the rich text: the child stays, unreferenced');
        ck5field.getCreateContentButton().click();
        createTextChild('Orphan child');
        ckeditor5.cancelAndDiscard();
        getExtended().then(node => {
            expect(node.children.nodes, 'the child stays').to.have.length(1);
            expect(node.text.value, 'the stored text is unchanged').to.not.contain(node.children.nodes[0].uuid);
        });
    });

    it('should insert each content of "Create another" in order, after a selected reference', () => {
        const ck5field = editExtended();
        ck5field.getReferenceCard(0).click();
        ck5field.getCreateContentButton().click();
        contentTypeSelector().searchForContentType('jnt:text').selectContentType('jnt:text').create();

        const nested = new ContentEditor();
        nested.addAnotherContent();
        fillAndCreateText('Child one');
        // The nested editor resets its form for the next content
        new ContentEditor().getSmallTextField('jnt:text_text').get().find('input[type="text"]').should('have.value', '');
        nested.removeAnotherContent();
        fillAndCreateText('Child two');
        cy.get(ContentEditor.defaultSelector).should('have.length', 1);

        ck5field.getReferenceCards().should('have.length', 3);
        ck5field.getReferenceCard(0).should('contain', 'author-bio');
        ck5field.getReferenceCard(1).should('contain', 'Child one');
        ck5field.getReferenceCard(2).should('contain', 'Child two');
        ck5field.getData().then(data => {
            const refs = referencedUuids(data);
            expect(refs, 'the selected reference is kept').to.have.length(3);
            expect(refs[0]).to.eq(uuids.author);
        });
    });

    it('should open Content Editor directly for a single type, and warn for none', () => {
        addMixins(extendedPath, ['jmix:contributeMode']);
        setNodeProperty(extendedPath, 'j:contributeTypes', ['jnt:text'], 'en');

        cy.log('A single creatable type opens Content Editor with no selector');
        const ck5field = editExtended();
        ck5field.getCreateContentButton().click();
        new ContentEditor().getSmallTextField('jnt:text_text').should('exist');
        cy.get(ContentTypeSelector.defaultSelector).should('not.exist');
        nestedEditor().find('[data-sel-role="backButton"]').click();
        cy.get(ContentEditor.defaultSelector).should('have.length', 1);
        ckeditor5.cancel();

        cy.log('No creatable type shows a warning and opens nothing');
        setNodeProperty(extendedPath, 'j:contributeTypes', ['jnt:contentList'], 'en');
        const alert = cy.stub().as('alert');
        cy.on('window:alert', alert);
        const field = editExtended();
        field.getCreateContentButton().click();
        cy.get('@alert').should('have.been.calledWithMatch', noCreatableType);
        cy.get(ContentTypeSelector.defaultSelector).should('not.exist');
        cy.get(ContentEditor.defaultSelector).should('have.length', 1);
    });

    it('should disable the button while the rich text is created', () => {
        JContent.visit(siteKey, 'en', 'content-folders/contents');
        cy.window().then(win => {
            (win as unknown as {CE_API: {create: (config: object) => void}}).CE_API.create({
                path: contentsPath,
                lang: 'en',
                nodeTypesTree: [{name: 'jnt:extendedRichText', label: 'Extended rich text', children: []}]
            });
        });

        const ck5field = ckeditor5.getRichTextCKeditor5Field(fieldName);
        ck5field.getEditArea().should('exist');
        ck5field.getToolbarButton(saveFirstLabel).should('have.class', 'ck-disabled');
        ck5field.getCreateContentButton().should('not.exist');
    });

    it('should create the content in the language of the editor', () => {
        const ck5field = editComponent('Texte étendu', fieldName, 'fr');
        ck5field.getCreateContentButton().click();
        createTextChild('Enfant créé');
        ckeditor5.save();

        getExtended('fr').then(node => {
            const child = node.children.nodes[0];
            expect(child.text.value, 'the child holds the French value').to.eq('Enfant créé');
            expect(node.text.value).to.contain(`data-jahia-ref="${child.uuid}"`);

            getExtended('en').then(enNode => {
                expect(enNode.text.value, 'the English text has no new reference').to.not.contain(child.uuid);
                expect(enNode.children.nodes[0].text, 'the child has no English value').to.be.null;
            });
        });
    });

    // Runs last: it publishes the page
    it('should render the created content in preview and in live', () => {
        const ck5field = editExtended();
        ck5field.getCreateContentButton().click();
        createTextChild('Rendered child');
        ckeditor5.save();

        cy.visit(previewUrl);
        cy.get('.jahia-content-reference-rendered').should('contain', 'Rendered child');

        cy.log('Publishing the page publishes the child with the rich text');
        publishAndWaitJobEnding(homePath);
        cy.visit(liveUrl);
        cy.repeatUntil('.jahia-content-reference-rendered:contains("Rendered child")');
    });
});
