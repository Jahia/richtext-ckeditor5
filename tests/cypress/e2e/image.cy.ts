import {JContent} from '@jahia/jcontent-cypress/dist/page-object';
import {addNode, createSite, deleteSite, uploadFile} from '@jahia/cypress';
import {Ckeditor5, RichTextCKeditor5Field} from '../page-object/ckeditor5';

describe('Image tests', () => {
    const siteKey = 'imageCKEditor5Site';
    const ckeditor5 = new Ckeditor5();
    const textName = 'test-image';

    before(function () {
        createSite(siteKey);
        uploadFile('square.png', `/sites/${siteKey}/files`, 'square.png', 'image/png');
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: textName,
            primaryNodeType: 'jnt:bigText',
            properties: [{
                name: 'text',
                language: 'en',
                value: `<figure><img src="/files/{workspace}/sites/${siteKey}/files/square.png"></figure>`
            }]
        });
    });

    after(function () {
        cy.logout();
        deleteSite(siteKey);
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    it('should be able to display image properties balloon toolbar', () => {
        JContent.visit(siteKey, 'en', `content-folders/contents/${textName}`).editContent();
        const ck5field: RichTextCKeditor5Field = ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text');

        // Trigger the balloon toolbar for images
        ck5field.getEditArea().click('center');
        ck5field.getEditArea().type('{leftArrow}', {delay: 300});

        cy.log('Verify image properties toolbar buttons are visible');
        [
            'Toggle caption on',
            'Change image text alternative',
            'In line',
            'Centered image',
            'Wrap text: Left aligned image',
            'Resize image to the original size',
            'Custom image size'
        ].forEach(toolbarLabel => {
            ck5field.getBalloonToolbarButton(toolbarLabel).should('be.visible');
        });
    });
});
