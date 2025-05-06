import {JContent} from '@jahia/jcontent-cypress/dist/page-object';
import {Picker} from '@jahia/jcontent-cypress/dist/page-object/picker';
import {addNode, createSite, deleteSite, getComponentByAttr} from '@jahia/cypress';
import {Ckeditor5, RichTextCKeditor5Field} from '../page-object/ckeditor5';

describe('Link tests', () => {
    const siteKey = 'linkCKEditor5Site';
    const ckeditor5 = new Ckeditor5();
    const textName = 'test-link2';
    const linkTargetName = 'test-link-target';

    before(function () {
        createSite(siteKey);
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: textName,
            primaryNodeType: 'jnt:bigText',
            properties: [{name: 'text', language: 'en', value: '<p>this is <a href="https://google.com">my text</a> here</p>'}]
        });
        addNode({
            name: linkTargetName,
            parentPathOrId: `/sites/${siteKey}/home`,
            primaryNodeType: 'jnt:page',
            properties: [
                {name: 'jcr:title', value: 'link to me', language: 'en'},
                {name: 'j:templateName', value: '2-column'}
            ]
        });
    });

    after(function () {
        cy.logout();
        deleteSite(siteKey);
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    it('should be able to toggle "Open in new tab" link property', () => {
        JContent.visit(siteKey, 'en', `content-folders/contents/${textName}`).editContent();
        const ck5field: RichTextCKeditor5Field = ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text');
        ck5field.getEditArea().contains('my text').click('center');

        // Workaround to trigger the balloon toolbar for links
        ck5field.getEditArea().type('{leftArrow}{leftArrow}{leftArrow}', {delay: 300});
        ck5field.clickMenuItemByLabel('Insert');
        ck5field.getMenuSubItemByLabel('Link').click();
        ck5field.getBalloonToolbarButton('Back').click();

        ck5field.getBalloonToolbarButton('Link properties').should('be.visible').click();

        cy.log('Toggle open in new tab button');
        const openNewTabToggle = ck5field.getBalloonToggleButton('Open in a new tab');
        openNewTabToggle
            .should('be.visible')
            .and('have.class', 'ck-off')
            .click();
        openNewTabToggle.should('have.class', 'ck-on');

        cy.log('Verify link contains target="_blank"');
        ck5field.getToolbarButton('Source').click();
        ck5field.getSourceEditingArea()
            .should('be.visible')
            .invoke('attr', 'data-value')
            .should('contain', 'target="_blank"');
    });

    it('should open jahia link picker', () => {
        JContent.visit(siteKey, 'en', `content-folders/contents/${textName}`).editContent();
        const ck5field: RichTextCKeditor5Field = ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text');
        ck5field.getEditArea().contains('my text').click('center');

        // Workaround to trigger the balloon toolbar for links
        ck5field.getEditArea().type('{leftArrow}{leftArrow}{leftArrow}', {delay: 300});
        ck5field.clickMenuItemByLabel('Insert');
        ck5field.getMenuSubItemByLabel('Link').click();
        ck5field.getBalloonToolbarButton('Back').click();

        ck5field.getBalloonToolbarButton('Edit link').should('be.visible').click();
        ck5field.getBalloonButton('Jahia internal links').should('be.visible').click();

        const picker = getComponentByAttr(Picker, 'data-sel-role', 'picker-dialog');
        picker.getTable().getRowByName(linkTargetName).get().click();
        picker.select();
    });
});
