import {JContent} from '@jahia/jcontent-cypress/dist/page-object';
import {addNode, createSite, deleteSite, getComponent, getNodeByPath, setNodeProperty, uploadFile} from '@jahia/cypress';
import {Ckeditor5, RichTextCKeditor5Field} from '../page-object/ckeditor5';
import {ResizeImage} from '../page-object/resizeImage';

describe('Resized image reload tests', () => {
    const siteKey = 'imageResizeReloadCKEditor5Site';
    const ckeditor5 = new Ckeditor5();
    const filesPath = `/files/{workspace}/sites/${siteKey}/files`;
    const externalSrc = 'https://www.example.com/image.jpg';
    // Saved after a resize: the img keeps its natural size and its other attributes
    const externalText = '<p>External image text <img class="image_resized inline-class" style="aspect-ratio:640/427;height:auto;width:200px;" src="' + externalSrc + '" width="640" height="427" title="Inline image"></p>' +
        '<figure class="image image_resized" style="width:300px;"><img class="block-class" style="aspect-ratio:640/427;height:auto;width:300px;" src="' + externalSrc + '" width="640" height="427" title="Block image" data-test="block"></figure>';

    const texts = [
        {
            name: 'external-image',
            value: externalText
        },
        {
            name: 'resized-image',
            value: `<p>Resized image text</p><figure class="image image_resized" style="width:300px;"><img style="aspect-ratio:640/427;height:auto;width:300px;" src="${filesPath}/vacation.jpg" width="640" height="427" title="Vacation"></figure>`
        },
        {
            name: 'block-image',
            value: `<p>Block image text</p><figure class="image"><img src="${filesPath}/vacation.jpg" width="640" height="427"></figure>`
        },
        {
            name: 'linked-image',
            value: `<p>Linked image text</p><figure class="image"><a href="https://www.example.com/"><img src="${filesPath}/vacation.jpg" width="640" height="427"></a></figure>`
        }
    ];

    before(() => {
        createSite(siteKey);
        uploadFile('vacation.jpg', `/sites/${siteKey}/files`, 'vacation.jpg', 'image/jpeg');
        addNode({
            parentPathOrId: `/sites/${siteKey}/home`,
            name: 'area-main',
            primaryNodeType: 'jnt:contentList',
            children: texts.map(({name}) => ({name, primaryNodeType: 'jnt:bigText'}))
        });
    });

    after(() => {
        cy.logout();
        deleteSite(siteKey);
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
        texts.forEach(({name, value}) => setNodeProperty(`/sites/${siteKey}/home/area-main/${name}`, 'text', value, 'en'));
    });

    const editText = (text: string) => {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home').switchToListMode();
        const ce = jcontent.editComponentByText(text);
        const ck5field: RichTextCKeditor5Field = ckeditor5.getRichTextCKeditor5Field('jnt:bigText_text');
        return {ce, ck5field};
    };

    const resizeImage = (ck5field: RichTextCKeditor5Field, width: number) => {
        ck5field.getEditArea().find('img').should('be.visible').click('center');
        ck5field.getBalloonToolbarButton('Custom image size').click();
        getComponent(ResizeImage).shouldBeVisible().setResizeWidth(width);
    };

    const getImage = (html: string) => Cypress.$('<div>').append(html).find('img');

    it('should not modify a resized image when reopening the editor', () => {
        const {ce, ck5field} = editText('External image text');
        ck5field.getData().should('equal', externalText);
        ce.checkButtonStatus('submitSave', false);
        ce.cancel();
    });

    it('should keep the size and attributes of a resized image when saving another change', () => {
        const {ce, ck5field} = editText('Resized image text');
        ck5field.appendText(' edited');
        ce.save();

        getNodeByPath(`/sites/${siteKey}/home/area-main/resized-image`, ['text'], 'en').then(result => {
            const text = result.data.jcr.nodeByPath.properties.find(property => property.name === 'text').value;
            const img = getImage(text);
            expect(img.closest('figure').attr('style')).to.equal('width:300px;');
            expect(img.attr('style')).to.contain('aspect-ratio:640/427').and.contain('width:300px');
            expect(img.attr('title')).to.equal('Vacation');
            expect(img.attr('width')).to.exist;
            expect(img.attr('height')).to.exist;
        });
    });

    it('should update the image width when resizing an image again', () => {
        const {ce, ck5field} = editText('Block image text');
        resizeImage(ck5field, 300);
        ck5field.getEditArea().find('.image_resized img').should('have.attr', 'style').and('contain', 'width:300px');
        resizeImage(ck5field, 200);
        ck5field.getEditArea().find('.image_resized img').invoke('attr', 'style')
            .should('contain', 'width:200px')
            .and('not.contain', 'width:300px');

        ck5field.getEditArea().find('img').click('center');
        ck5field.getBalloonToolbarButton('Resize image to the original size').click();
        ck5field.getEditArea().find('figure').should('not.have.class', 'image_resized');
        ck5field.getEditArea().find('img').invoke('attr', 'style').should('not.contain', 'width:');
        ce.cancelAndDiscard();
    });

    it('should embed the width of a resized linked image', () => {
        const {ce, ck5field} = editText('Linked image text');
        resizeImage(ck5field, 300);
        ck5field.getData().then(data => {
            const img = getImage(data);
            expect(img.parent().is('a')).to.be.true;
            expect(img.attr('style')).to.contain('height:auto').and.contain('width:300px');
        });
        ce.cancelAndDiscard();
    });
});
