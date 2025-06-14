import {JContent} from '@jahia/jcontent-cypress/dist/page-object';
import {Picker} from '@jahia/jcontent-cypress/dist/page-object/picker';
import {createSite, deleteSite, getComponentByRole} from '@jahia/cypress';
import {Ckeditor5, RichTextCKeditor5Field} from '../page-object/ckeditor5';

describe('Toolbar tests', () => {
    const siteKey = 'richTextCKEditor5Site';
    let jcontent: JContent;

    before(function () {
        createSite(siteKey);
        cy.loginAndStoreSession(); // Edit in chief
    });

    after(function () {
        cy.logout();
        deleteSite(siteKey);
    });
    beforeEach(() => {
        cy.loginAndStoreSession();
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
    });

    it('should have buttons visible and clickable', () => {
        jcontent.createContent('jnt:bigText');
        const ckeditor5 = new Ckeditor5();
        const ck5field: RichTextCKeditor5Field = ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text');
        ck5field.type('this is my text');
        ck5field.getToolbarButton('Bold').click();
        ck5field.getToolbarButton('Italic').click();
        ck5field.getToolbarButton('Remove Format').click();
        ck5field.getToolbarButton('Heading').click().click();
        ck5field.getToolbarButton('Text alignment').click().click();
        ck5field.getToolbarButton('Insert image').click();
        const picker: Picker = getComponentByRole(Picker, 'picker-dialog');
        picker.cancel();
        ck5field.getToolbarButton('Link').click();
    });

    it('should have full toolbar visible', () => {
        jcontent.createContent('jnt:bigText');
        const ckeditor5 = new Ckeditor5();
        const ck5field: RichTextCKeditor5Field = ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text');
        ck5field.type('this is my text');

        const menuItems = new Map<string, string[]>();
        menuItems.set('Edit', ['Undo', 'Redo', 'Select all', 'Find and replace']);
        menuItems.set('View', [
            // 'Show source', // For basic version
            'Edit source', // For enhanced version
            'Show blocks',
            'Fullscreen mode'
        ]);
        menuItems.set('Insert', [
            'Image',
            'Table',
            'Link',
            'Bookmark',
            'Special characters',
            'Block quote',
            'Code block',
            'Horizontal line'
        ]);
        menuItems.set('Format', [
            'Text',
            'Font',
            'Heading',
            'Bulleted List',
            'Numbered List',
            'Text alignment',
            'Increase indent',
            'Decrease indent',
            'Case change',
            'Remove Format'
        ]);
        menuItems.set('Help', ['Accessibility']);

        cy.log('Validate full menu items');
        for (const [menuItem, subItems] of menuItems) {
            ck5field.clickMenuItemByLabel(menuItem);
            subItems.forEach(subItem => {
                ck5field.getMenuSubItemByLabel(subItem).should('be.visible');
            });
            ck5field.clickMenuItemByLabel(menuItem, false);
        }

        cy.log('Validate full toolbar items');
        [
            'Edit source', // For enhanced version
            // 'Source', // For basic version
            'Show blocks',
            'Heading',
            'Bold',
            'Italic',
            'Remove Format',
            'Text alignment',
            'Link',
            'Insert image',
            'Insert table',
            'Bulleted List',
            'Increase indent',
            'Decrease indent'
        ].forEach(item => ck5field.getToolbarButton(item).should('be.visible'));
    });

    it.skip('should have basic edit source working', () => {
        jcontent.createContent('jnt:bigText');
        const ckeditor5 = new Ckeditor5();
        const ck5field: RichTextCKeditor5Field = ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text');
        ck5field.type('this is my text');
        ck5field.getToolbarButton('Source').click();
        ck5field.getSourceEditingArea()
            .should('be.visible')
            .invoke('attr', 'data-value')
            .should('contain', '<p>\n    this is my text\n</p>');
    });

    // Enable when enhanced edit source is enabled in config
    it('should have enhanced edit source working', () => {
        jcontent.createContent('jnt:bigText');
        const ckeditor5 = new Ckeditor5();
        const ck5field: RichTextCKeditor5Field = ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text');
        ck5field.type('this is my text');
        ck5field.getToolbarButton('Edit source').click();
        ck5field.getEnhancedSourceEditingArea()
            .should('be.visible')
            .should('contain', 'this is my text')
            // Source is parsed; check if it at least contains the <p> tag
            .and('contain', 'p');
    });
});
