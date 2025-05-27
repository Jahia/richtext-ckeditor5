import {JContent} from '@jahia/jcontent-cypress/dist/page-object';
import {addNode, createSite, deleteSite, getComponent, uploadFile} from '@jahia/cypress';
import {Ckeditor5, RichTextCKeditor5Field} from '../page-object/ckeditor5';
import {ResizeImage} from "../page-object/resizeImage";

describe('Image tests', () => {
    const siteKey = 'imageCKEditor5Site';
    const ckeditor5 = new Ckeditor5();
    const textName = 'test-image';

    before('setup', function setup() {
        createSite(siteKey);
        uploadFile('placeholder.jpg', `/sites/${siteKey}/files`, 'placeholder.jpg', 'image/jpg');
        const imageText = {
            name: textName,
            primaryNodeType: 'jnt:bigText',
            properties: [{
                name: 'text',
                language: 'en',
                value: `<figure><img src="/files/{workspace}/sites/${siteKey}/files/placeholder.jpg"></figure>`
            }]
        };

        addNode({
            parentPathOrId: `/sites/${siteKey}/home`,
            name: "area-main",
            primaryNodeType: "jnt:contentList",
            children: [imageText]
        });
        addNode({...imageText, parentPathOrId: `/sites/${siteKey}/contents`});
    });



    after('teardown', function teardown() {
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

    it('should be able to resize image and display in page builder', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home')
            .switchToStructuredView()
        const ce = jcontent.editComponentByText(textName);
        const ck5field: RichTextCKeditor5Field = ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text');

        // Trigger the balloon toolbar for images
        ck5field.getEditArea().click('center');
        ck5field.getBalloonToolbarButton('Custom image size').click();

        const resizeImage = getComponent(ResizeImage);
        resizeImage.shouldBeVisible().setResizeWidth(150);
        ck5field.getEditArea().find('img')
            .invoke('attr', 'style')
            .should('contain', 'height:auto')
            .and('contain', 'width:150px');
        ce.save();

        // Verify image is also resized in page builder
        const pb = jcontent.switchToPageBuilder();
        pb.getModule(`/sites/${siteKey}/home/area-main/${textName}`).get().find('img')
            .invoke('attr', 'style')
            .should('contain', 'height:auto')
            .and('contain', 'width:150px');
    });
});
