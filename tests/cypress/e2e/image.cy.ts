import {JContent} from '@jahia/jcontent-cypress/dist/page-object';
import {addNode, createSite, deleteSite, getComponent, uploadFile} from '@jahia/cypress';
import {Ckeditor5, RichTextCKeditor5Field} from '../page-object/ckeditor5';
import {ResizeImage} from '../page-object/resizeImage';
import {EditLinkForm} from '../page-object/editLinkForm';

describe('Image tests', () => {
    const siteKey = 'imageCKEditor5Site';
    const ckeditor5 = new Ckeditor5();
    const textName = 'test-image';

    before(() => {
        createSite(siteKey);
        uploadFile('placeholder.jpg', `/sites/${siteKey}/files`, 'placeholder.jpg', 'image/jpeg');

        const textContent = `Lorem ipsum dolor sit amet. Aut eveniet voluptatem quo nulla itaque 
            sit fuga fugit aut consequatur nesciunt ea modi rerum. 
            Et provident deserunt ut nisi quidem aut velit Quis sed voluptas recusandae.`;
        const imageText = {
            name: textName,
            primaryNodeType: 'jnt:bigText',
            properties: [{
                name: 'text',
                language: 'en',
                value: `<img src="/files/{workspace}/sites/${siteKey}/files/placeholder.jpg"><p>${textContent}</p>`
            }]
        };

        addNode({
            parentPathOrId: `/sites/${siteKey}/home`,
            name: 'area-main',
            primaryNodeType: 'jnt:contentList',
            children: [imageText]
        });
        addNode({...imageText, parentPathOrId: `/sites/${siteKey}/contents`});
    });

    after(() => {
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
        // Ensure the image content is loaded before click
        ck5field.getEditArea().find('img').should('be.visible').click('center');
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

    it('should be able to add links to images', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home')
            .switchToListMode();
        const ce = jcontent.editComponentByText('Lorem ipsum');
        const ck5field: RichTextCKeditor5Field = ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text');

        // Trigger the balloon toolbar for images
        // Ensure the image content is loaded before click
        ck5field.getEditArea().find('img').should('be.visible').click('center');
        ck5field.getBalloonButton('Link image').should('be.visible').click();
        const linkForm = getComponent(EditLinkForm);
        const linkUrl = 'https://google.com';
        linkForm.setLinkUrl(linkUrl);
        ck5field.getEditArea().find('a').should('have.attr', 'href', linkUrl);
        ce.save();

        // // Verify image is also resized in page builder
        const pb = jcontent.switchToPageBuilder();
        pb.getModule(`/sites/${siteKey}/home/area-main/${textName}`)
            .get().find('a')
            .invoke('attr', 'href')
            .should('contain', linkUrl);
    });

    it('should be able to resize image and display in page builder', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home')
            .switchToListMode();
        const ce = jcontent.editComponentByText('Lorem ipsum');
        const ck5field: RichTextCKeditor5Field = ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text');

        // Trigger the balloon toolbar for images
        // Ensure the image content is loaded before click
        ck5field.getEditArea().find('img').should('be.visible').click('center');
        ck5field.getBalloonToolbarButton('Custom image size').click();

        const resizeImage = getComponent(ResizeImage);
        resizeImage.shouldBeVisible().setResizeWidth(150);
        ck5field.getEditArea().find('.image_resized img') // Verify classes added by ck5
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

    it('should be able to left align and display in page builder', () => {
        testAlign('Left');
    });

    it('should be able to right align and display in page builder', () => {
        // This also tests that align works when existing float styles are present
        testAlign('Right');
    });

    it('should be able to center align and display in page builder', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home')
            .switchToListMode();
        const ce = jcontent.editComponentByText('Lorem ipsum');
        const ck5field: RichTextCKeditor5Field = ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text');

        // Trigger the balloon toolbar for images
        // Ensure the image content is loaded before click
        ck5field.getEditArea().find('img').should('be.visible').click('center');
        ck5field.getBalloonToolbarButton('Centered image').click();

        ck5field.getEditArea().find('.image-style-align-center') // Verify classes added by ck5
            .invoke('attr', 'style')
            .should('contain', 'text-align:center');
        ce.save();

        // // Verify image is also resized in page builder
        const pb = jcontent.switchToPageBuilder();
        pb.getModule(`/sites/${siteKey}/home/area-main/${textName}`).get().find('.image-style-align-center')
            .invoke('attr', 'style')
            .should('contain', 'text-align:center');
    });

    function testAlign(alignment: 'Left' | 'Right') {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home')
            .switchToListMode();
        const ce = jcontent.editComponentByText('Lorem ipsum');
        const ck5field: RichTextCKeditor5Field = ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text');

        // Trigger the balloon toolbar for images
        // Ensure the image content is loaded before click
        ck5field.getEditArea().find('img').should('be.visible').click('center');
        ck5field.getBalloonToolbarButton('Wrap text').click();
        ck5field.getBalloonToolbarButton(`${alignment} aligned image`).click();

        ck5field.getEditArea().find(`.image-style-align-${alignment.toLowerCase()}`) // Verify classes added by ck5
            .invoke('attr', 'style')
            .should('contain', `float:${alignment.toLowerCase()}`);
        ce.save();

        // // Verify image is also resized in page builder
        const pb = jcontent.switchToPageBuilder();
        pb.getModule(`/sites/${siteKey}/home/area-main/${textName}`).get().find(`.image-style-align-${alignment.toLowerCase()}`)
            .invoke('attr', 'style')
            .should('contain', `float:${alignment.toLowerCase()}`);
    }
});
