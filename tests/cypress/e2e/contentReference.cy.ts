import {JContent} from '@jahia/jcontent-cypress/dist/page-object';
import {Picker} from '@jahia/jcontent-cypress/dist/page-object/picker';
import {
    addNode,
    createSite,
    deleteSite,
    enableModule,
    getComponentByRole,
    publishAndWaitJobEnding,
    setNodeProperty
} from '@jahia/cypress';
import {Ckeditor5, RichTextCKeditor5Field} from '../page-object/ckeditor5';

describe('Content reference tests', () => {
    const siteKey = 'contentReferenceCKEditor5Site';
    const ckeditor5 = new Ckeditor5();
    const contentsPath = `/sites/${siteKey}/contents`;
    const homePath = `/sites/${siteKey}/home`;
    const areaPath = `${homePath}/area-main`;
    const authorPath = `${contentsPath}/author-bio`;
    const articlePath = `${areaPath}/article`;
    const articleBPath = `${areaPath}/article-b`;
    const previewUrl = `/cms/render/default/en/sites/${siteKey}/home.html`;
    const liveUrl = `/cms/render/live/en/sites/${siteKey}/home.html`;
    const missingUuid = '0f3c2a51-7d7e-4c0b-9a51-2f1e3b9c8d10';
    const hostileTitle = '<img src=x onerror="window.__refTitleXss=1">';
    const storedReference = /<div class="jahia-content-reference" data-jahia-ref="([0-9a-f-]{36})"><\/div>/;

    const fanNames = ['fan-a', 'fan-b', 'fan-c', 'fan-d'];

    const uuids: {[name: string]: string} = {};

    const reference = (uuid: string, view?: string) => (view ?
        `<div class="jahia-content-reference" data-jahia-ref="${uuid}" data-jahia-view="${view}"></div>` :
        `<div class="jahia-content-reference" data-jahia-ref="${uuid}"></div>`);

    const bigText = (name: string, intro: string) => ({
        name,
        primaryNodeType: 'jnt:bigText',
        properties: [{name: 'text', language: 'en', value: `<p>${intro}</p>`}]
    });

    const resetArticle = () => {
        setNodeProperty(articlePath, 'text', '<p>Article A intro</p>', 'en');
    };

    const editArticle = (): {jcontent: JContent, ck5field: RichTextCKeditor5Field} => {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home').switchToListMode();
        jcontent.editComponentByText('Article A intro');
        const ck5field = ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text');
        ck5field.getEditArea().should('contain', 'Article A intro');
        return {jcontent, ck5field};
    };

    before(() => {
        createSite(siteKey);
        enableModule('test-ckeditor5-config', siteKey);

        addNode({
            parentPathOrId: contentsPath,
            name: 'author-bio',
            primaryNodeType: 'jnt:text',
            properties: [{name: 'text', language: 'en', value: 'Jane Doe bio'}]
        }).then(result => {
            uuids.author = result.data.jcr.addNode.uuid;
        });
        addNode({
            parentPathOrId: contentsPath,
            name: 'other-bio',
            primaryNodeType: 'jnt:text',
            properties: [{name: 'text', language: 'en', value: 'John Roe bio'}]
        }).then(result => {
            uuids.other = result.data.jcr.addNode.uuid;
        });
        addNode({
            parentPathOrId: contentsPath,
            name: 'hostile-title',
            primaryNodeType: 'jnt:text',
            mixins: ['mix:title'],
            properties: [
                {name: 'jcr:title', language: 'en', value: hostileTitle},
                {name: 'text', language: 'en', value: 'Hostile title bio'}
            ]
        }).then(result => {
            uuids.hostile = result.data.jcr.addNode.uuid;
        });
        addNode({
            parentPathOrId: contentsPath,
            name: 'sub-list',
            primaryNodeType: 'jnt:referenceTestList',
            children: [{
                name: 'sub-list-item',
                primaryNodeType: 'jnt:text',
                properties: [{name: 'text', language: 'en', value: 'Sub list item'}]
            }]
        }).then(result => {
            uuids.subList = result.data.jcr.addNode.uuid;
        });

        // Each text references the next one 20 times
        fanNames.forEach(name => {
            addNode({parentPathOrId: contentsPath, ...bigText(name, `${name} intro`)}).then(result => {
                uuids[name] = result.data.jcr.addNode.uuid;
            });
        });
        cy.then(() => {
            fanNames.slice(0, -1).forEach((name, i) => {
                setNodeProperty(`${contentsPath}/${name}`, 'text', `<p>${name} intro</p>${reference(uuids[fanNames[i + 1]]).repeat(20)}`, 'en');
            });
        });

        addNode({
            parentPathOrId: homePath,
            name: 'area-main',
            primaryNodeType: 'jnt:contentList',
            children: [
                bigText('article', 'Article A intro'),
                bigText('article-b', 'Article B intro'),
                bigText('loop-a', 'Loop A intro'),
                bigText('loop-b', 'Loop B intro')
            ]
        }).then(result => {
            const [, , loopA, loopB] = result.data.jcr.addNode.addChildrenBatch.map(child => child.uuid);
            setNodeProperty(`${areaPath}/loop-a`, 'text', `<p>Loop A intro</p>${reference(loopB)}`, 'en');
            setNodeProperty(`${areaPath}/loop-b`, 'text', `<p>Loop B intro</p>${reference(loopA)}`, 'en');
        });

        // The rich text of a custom type: the render filter expands references in any node, not only jnt:bigText
        cy.then(() => addNode({
            parentPathOrId: areaPath,
            name: 'custom-article',
            primaryNodeType: 'jnt:customArticle',
            properties: [{name: 'abstract', value: `<p>Custom abstract</p>${reference(uuids.author, 'refcard')}`}]
        }));
    });

    after(() => {
        cy.logout();
        deleteSite(siteKey);
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    it('should insert a reference to the content picked in the picker', () => {
        resetArticle();
        const {ck5field} = editArticle();

        ck5field.getToolbarButton('Reference existing content').click();
        const picker = getComponentByRole(Picker, 'picker-dialog');
        picker.getAccordionItem('picker-content-folders').click();
        picker.getTable().getRowByName('author-bio').get().click();
        picker.select();

        ck5field.getReferenceCards().should('have.length', 1);
        ck5field.getReferenceCard(0)
            .should('contain', 'author-bio')
            .and('contain', 'View: Default');
        ck5field.getReferenceCard(0).find('[data-sel-referenceCard-type]').invoke('text').should('not.be.empty');

        ck5field.getData().then(data => {
            const match = data.match(storedReference);
            expect(match, 'the stored form of the reference').to.not.be.null;
            expect(match[1]).to.eq(uuids.author);
            expect(data, 'no rendered content in the stored form').to.not.contain('Jane Doe bio');
            expect(data, 'no filler in the stored form').to.not.contain('&nbsp;</div>');
        });
    });

    it('should keep the stored form stable through setData and getData', () => {
        resetArticle();
        const {ck5field} = editArticle();

        cy.log('The stored form round-trips unchanged');
        ck5field.type(reference(uuids.author, 'refcard'));
        ck5field.getReferenceCards().should('have.length', 1);
        ck5field.getData().should('eq', reference(uuids.author, 'refcard'));

        cy.log('Children of the placeholder are dropped');
        ck5field.type(`<div class="jahia-content-reference" data-jahia-ref="${uuids.author}"><p>stale child</p></div>`);
        ck5field.getReferenceCards().should('have.length', 1);
        ck5field.getData().should('eq', reference(uuids.author));

        cy.log('A stray non-breaking space gives a single widget and no extra paragraph');
        ck5field.type(`<div class="jahia-content-reference" data-jahia-ref="${uuids.author}">&nbsp;</div>`);
        ck5field.getReferenceCards().should('have.length', 1);
        ck5field.getData().should('eq', reference(uuids.author));

        cy.log('The identifier is stored in lower case');
        ck5field.type(reference(uuids.author.toUpperCase()));
        ck5field.getData().should('eq', reference(uuids.author));

        cy.log('An invalid view is dropped');
        ck5field.type(`<div class="jahia-content-reference" data-jahia-ref="${uuids.author}" data-jahia-view="x&quot;&gt;&lt;script&gt;"></div>`);
        ck5field.getReferenceCard(0).should('contain', 'View: Default');
        ck5field.getData().should('eq', reference(uuids.author));

        cy.log('A malformed identifier is not a reference, and the general HTML support keeps the element');
        ck5field.type('<div class="jahia-content-reference" data-jahia-ref="not-a-uuid"></div>');
        ck5field.getData().should('contain', 'data-jahia-ref="not-a-uuid"');
        ck5field.getReferenceCards().should('have.length', 0);
    });

    it('should change the view from the balloon toolbar, and undo it', () => {
        resetArticle();
        const {ck5field} = editArticle();
        ck5field.type(`<p>Article A intro</p>${reference(uuids.author)}`);

        ck5field.getReferenceCard(0).should('contain', 'author-bio').click();
        ck5field.selectReferenceView(/refcard/i);

        ck5field.getData().should('contain', 'data-jahia-view="refcard"');
        ck5field.getReferenceCard(0).should('contain', 'View: refcard');
        ck5field.getReferenceViewDropdown().should('contain', 'refcard');

        ck5field.execute('undo');
        ck5field.getData()
            .should('contain', `data-jahia-ref="${uuids.author}"`)
            .and('not.contain', 'data-jahia-view');
        ck5field.getReferenceCard(0).should('contain', 'View: Default');
    });

    it('should replace and remove a reference, and undo the removal', () => {
        resetArticle();
        const {ck5field} = editArticle();
        ck5field.type(`<p>Article A intro</p>${reference(uuids.author)}`);

        cy.log('Replace opens the picker on the current content');
        ck5field.getReferenceCard(0).should('contain', 'author-bio').click();
        ck5field.getBalloonToolbarButton('Replace referenced content').click();
        const picker = getComponentByRole(Picker, 'picker-dialog');
        picker.getTable().getRowByName('author-bio').get().should('have.class', 'moonstone-TableRow-highlighted');
        picker.getTable().getRowByName('other-bio').get().click();
        picker.select();

        ck5field.getReferenceCards().should('have.length', 1);
        ck5field.getReferenceCard(0).should('contain', 'other-bio');
        ck5field.getData()
            .should('contain', `data-jahia-ref="${uuids.other}"`)
            .and('not.contain', uuids.author);

        cy.log('Remove deletes the reference');
        ck5field.getReferenceCard(0).click();
        ck5field.getBalloonToolbarButton('Remove reference').click();
        ck5field.getData()
            .should('contain', 'Article A intro')
            .and('not.contain', 'jahia-content-reference');
        ck5field.getReferenceCards().should('have.length', 0);

        cy.log('Undo restores it');
        ck5field.execute('undo');
        ck5field.getReferenceCards().should('have.length', 1);
        ck5field.getReferenceCard(0).should('contain', 'other-bio');
    });

    it('should show a missing card for content that does not exist', () => {
        resetArticle();
        const {ck5field} = editArticle();
        ck5field.type(reference(missingUuid));

        ck5field.getReferenceCards().should('have.length', 1);
        ck5field.getReferenceCard(0)
            .should('contain', 'Content not found or not accessible')
            .and('contain', missingUuid);
        ck5field.getData().should('eq', reference(missingUuid));
    });

    it('should show a hostile display name as text in the card', () => {
        resetArticle();
        const {ck5field} = editArticle();
        ck5field.type(reference(uuids.hostile));

        // The display name may reach the card stripped of its markup, so the name line proves the card loaded
        ck5field.getReferenceCard(0).should('contain', 'hostile-title');
        ck5field.getReferenceCard(0).find('img[onerror]').should('not.exist');
        cy.window().then(win => {
            expect((win as unknown as {__refTitleXss?: number}).__refTitleXss).to.be.undefined;
        });
    });

    it('should render the referenced content as part of the text in page builder', () => {
        resetArticle();
        const {jcontent, ck5field} = editArticle();
        ck5field.type(`<p>Article A intro</p>${reference(uuids.author, 'refcard')}`);
        ckeditor5.save();

        const pb = jcontent.switchToPageBuilder();
        pb.getModule(articlePath).get()
            .find('.jahia-content-reference-rendered .test-refcard')
            .should('contain', 'Jane Doe bio');
        pb.getModule(articlePath).get()
            .find('.jahia-content-reference-rendered [jahiatype="module"]')
            .should('not.exist');
        pb.getModule(articlePath).get()
            .find('[data-jahia-ref]')
            .should('not.exist');
    });

    it('should render the referenced content in preview', () => {
        setNodeProperty(articlePath, 'text', `<p>Article A intro</p>${reference(uuids.author, 'refcard')}`, 'en');
        cy.visit(previewUrl);
        cy.contains('Article A intro').should('exist');
        cy.get('.jahia-content-reference-rendered .test-refcard').should('contain', 'Jane Doe bio');
    });

    it('should render a reference held by the rich text of a custom type', () => {
        cy.visit(previewUrl);
        cy.get('.test-custom-article').should('contain', 'Custom abstract');
        cy.get('.test-custom-article .jahia-content-reference-rendered .test-refcard').should('contain', 'Jane Doe bio');
    });

    it('should stop a reference loop with a notice', () => {
        const pb = JContent.visit(siteKey, 'en', 'pages/home').switchToPageBuilder();
        const loopA = `${areaPath}/loop-a`;
        pb.getModule(loopA).get().should('contain', 'Loop A intro');
        pb.getModule(loopA).get()
            .find('.jahia-content-reference-rendered')
            .should('contain', 'Loop B intro');
        pb.getModule(loopA).get()
            .find('.jahia-content-reference-rendered .jahia-content-reference-missing')
            .should('exist');
    });

    it('should refuse a type that derives from a refused type', () => {
        resetArticle();
        const {ck5field} = editArticle();
        ck5field.type(reference(uuids.subList));
        ck5field.getReferenceCard(0).should('contain', 'Content not found or not accessible');

        setNodeProperty(articleBPath, 'text', `<p>Article B intro</p>${reference(uuids.subList)}`, 'en');
        cy.request(previewUrl).its('body').then(body => {
            expect(body).to.contain('Article B intro');
            expect(body).to.contain('jahia-content-reference-missing');
            expect(body).to.not.contain('Sub list item');
        });
    });

    it('should render repeated references once per text', () => {
        setNodeProperty(articleBPath, 'text', `<p>Article B intro</p>${reference(uuids['fan-a']).repeat(20)}`, 'en');
        cy.request(previewUrl).its('body').then(body => {
            expect(body).to.contain('Article B intro');
            expect(body).to.contain('fan-d intro');
        });
    });

    it('should render an invalid view with the default view and no script', () => {
        const hostileView = 'x&quot;&gt;&lt;script&gt;window.__refViewXss=1&lt;/script&gt;';
        const text = `<p>Article B intro</p><div class="jahia-content-reference" data-jahia-ref="${uuids.author}" data-jahia-view="${hostileView}"></div>`;
        setNodeProperty(articleBPath, 'text', text, 'en');

        cy.request(previewUrl).its('body').then(body => {
            expect(body).to.contain('Article B intro');
            expect(body).to.not.contain('<script>window.__refViewXss');
        });

        const pb = JContent.visit(siteKey, 'en', 'pages/home').switchToPageBuilder();
        pb.getModule(articleBPath).get()
            .find('.jahia-content-reference-rendered')
            .should('contain', 'Jane Doe bio');
        pb.getModule(articleBPath).get()
            .find('.jahia-content-reference-rendered .test-refcard')
            .should('not.exist');
    });

    // Runs last: it publishes the site and changes the referenced content
    it('should render in live once the referenced content is published, and follow its updates', () => {
        setNodeProperty(articlePath, 'text', `<p>Article A intro</p>${reference(uuids.author, 'refcard')}`, 'en');
        publishAndWaitJobEnding(homePath);

        cy.log('The referenced content is not published yet: nothing, and no notice');
        cy.visit(liveUrl);
        cy.contains('Article A intro').should('exist');
        cy.get('.test-refcard').should('not.exist');
        cy.get('.jahia-content-reference-missing').should('not.exist');

        cy.log('Publishing the referenced content flushes the text with no manual flush');
        publishAndWaitJobEnding(authorPath);
        cy.visit(liveUrl);
        cy.repeatUntil('.jahia-content-reference-rendered .test-refcard:contains("Jane Doe bio")');

        cy.log('A republished update of the referenced content reaches live');
        setNodeProperty(authorPath, 'text', 'Jane Doe updated bio', 'en');
        publishAndWaitJobEnding(authorPath);
        cy.visit(liveUrl);
        cy.repeatUntil('.jahia-content-reference-rendered .test-refcard:contains("Jane Doe updated bio")');
    });
});
