import {JContent} from '@jahia/jcontent-cypress/dist/page-object';
import {Picker} from '@jahia/jcontent-cypress/dist/page-object/picker';
import {createSite, deleteSite, getComponentByRole, uploadFile} from '@jahia/cypress';
import {Ckeditor5, RichTextCKeditor5Field} from '../page-object/ckeditor5';

describe('Insert image tests', () => {
    const siteKey = 'imageCKEditor5Site';
    const ckeditor5 = new Ckeditor5();

    before(function () {
        createSite(siteKey);
        uploadFile('vacation.jpg', `/sites/${siteKey}/files/bootstrap`, 'vacation', 'image/jpeg');
    });

    after(function () {
        cy.logout();
        deleteSite(siteKey);
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    it('should insert image from Jahia image picker', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        const contentEditor = jcontent.createContent('jnt:bigText');
        let ck5field: RichTextCKeditor5Field = ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text');

        // Workaround to trigger the balloon toolbar for links
        ck5field.getEditArea().type('{leftArrow}{leftArrow}{leftArrow}', {delay: 300});
        ck5field.clickMenuItemByLabel('Insert');
        ck5field.getMenuSubItemByLabel('Image').click();

        const picker = getComponentByRole(Picker, 'picker-dialog');

        picker.switchViewMode('List');
        picker.getTable().getRowByLabel('bootstrap').dblclick();
        picker.getTable().getRowByLabel('vacation').click();
        picker.select();

        contentEditor.createUnchecked();

        jcontent.getTable().getRowByLabel('rich-text').contextMenu().select('Edit');

        ck5field = ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text');
        ck5field.getEditArea().find(`img[src="/files/{workspace}/sites/${siteKey}/files/bootstrap/vacation"]`).should('exist');
    });
});
