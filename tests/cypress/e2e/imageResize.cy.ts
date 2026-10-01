import {JContent} from '@jahia/jcontent-cypress/dist/page-object';
import {addNode, createSite, deleteSite, getComponent, getNodeByPath, setNodeProperty, uploadFile} from '@jahia/cypress';
import {Ckeditor5, RichTextCKeditor5Field} from '../page-object/ckeditor5';
import {ResizeImage} from '../page-object/resizeImage';

describe('Image resize URL tests', () => {
    const siteKey = 'imageResizeCKEditor5Site';
    const ckeditor5 = new Ckeditor5();
    const filesPath = `/files/{workspace}/sites/${siteKey}/files`;
    const externalSrc = 'https://www.example.com/image.jpg?t=signature&w=1000';
    const resizedText = `<p>Resized image text</p><figure class="image image_resized" style="height:auto;width:300px;"><img style="aspect-ratio:640/427;height:auto;width:300px;" src="${filesPath}/vacation.jpg?w=300" width="300" height="200"></figure>`;

    const texts = [
        {
            name: 'block-image',
            value: `<p>Block image text</p><figure class="image"><img src="${filesPath}/vacation.jpg" width="640" height="427"></figure>`
        },
        {
            name: 'resized-image',
            value: resizedText
        },
        {
            name: 'legacy-image',
            value: `<p>Legacy image text</p><figure class="image image_resized" style="width:300px;"><img style="aspect-ratio:640/427;height:auto;width:300px;" src="${filesPath}/vacation.jpg" width="640" height="427"></figure>`
        },
        {
            name: 'inline-image',
            value: `<p>Inline image text <img src="${filesPath}/placeholder.jpg" width="500" height="325"></p>`
        },
        {
            name: 'external-image',
            value: `<p>External image text</p><figure class="image image_resized" style="width:300px;"><img style="aspect-ratio:640/427;height:auto;width:300px;" src="${externalSrc.replace('&', '&amp;')}" width="640" height="427"></figure>`
        }
    ];

    before(() => {
        createSite(siteKey);
        uploadFile('vacation.jpg', `/sites/${siteKey}/files`, 'vacation.jpg', 'image/jpeg');
        uploadFile('placeholder.jpg', `/sites/${siteKey}/files`, 'placeholder.jpg', 'image/jpeg');
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
        return {jcontent, ce, ck5field};
    };

    const resizeImage = (ck5field: RichTextCKeditor5Field, width: number) => {
        ck5field.getEditArea().find('img').should('be.visible').click('center');
        ck5field.getBalloonToolbarButton('Custom image size').click();
        getComponent(ResizeImage).shouldBeVisible().setResizeWidth(width);
    };

    const resizeToOriginal = (ck5field: RichTextCKeditor5Field) => {
        ck5field.getEditArea().find('img').should('be.visible').click('center');
        ck5field.getBalloonToolbarButton('Resize image to the original size').click();
    };

    const getImage = (html: string) => Cypress.$('<div>').append(html).find('img');

    const getStoredText = (name: string): Cypress.Chainable<string> => {
        return getNodeByPath(`/sites/${siteKey}/home/area-main/${name}`, ['text'], 'en')
            .then(result => result.data.jcr.nodeByPath.properties.find(property => property.name === 'text').value);
    };

    const shouldHaveImage = (img: JQuery, src: string, width: string, height: string) => {
        expect(img.attr('src')).to.equal(src);
        expect(img.attr('width')).to.equal(width);
        expect(img.attr('height')).to.equal(height);
    };

    const shouldSaveResizedImage = (name: string, text: string) => {
        const {ce, ck5field} = editText(text);
        ck5field.appendText(' edited');
        ce.save();

        getStoredText(name).then(stored => {
            const img = getImage(stored);
            shouldHaveImage(img, `${filesPath}/vacation.jpg?w=300`, '300', '200');
            expect(img.attr('style')).to.contain('aspect-ratio:640/427');
        });
    };

    it('should add the resized width to the URL of a block image', () => {
        const {jcontent, ce, ck5field} = editText('Block image text');
        resizeImage(ck5field, 300);
        // The editor keeps displaying the original image
        ck5field.getEditArea().find(`img[src="${filesPath}/vacation.jpg"]`).should('exist');
        ce.save();

        getStoredText('block-image').then(text => {
            const img = getImage(text);
            shouldHaveImage(img, `${filesPath}/vacation.jpg?w=300`, '300', '200');
            expect(img.attr('style')).to.contain('aspect-ratio:640/427').and.contain('width:300px');
        });

        const pb = jcontent.switchToPageBuilder();
        pb.getModule(`/sites/${siteKey}/home/area-main/block-image`).get().find('img')
            .should('have.attr', 'src')
            .and('match', /\/files\/default\/sites\/.*\/vacation\.jpg\?w=300$/);
    });

    it('should not modify a resized image when reopening the editor', () => {
        const {ce, ck5field} = editText('Resized image text');
        ck5field.getEditArea().find(`img[src="${filesPath}/vacation.jpg"]`).should('be.visible');
        ck5field.getData().should('equal', resizedText);
        ck5field.type(resizedText);
        ck5field.getData().should('equal', resizedText);
        ce.checkButtonStatus('submitSave', false);
        ce.cancel();
    });

    it('should keep the size of a resized image when saving another change', () => {
        shouldSaveResizedImage('resized-image', 'Resized image text');
    });

    it('should add the resized width to the URL of an image resized by a previous version', () => {
        shouldSaveResizedImage('legacy-image', 'Legacy image text');
    });

    it('should remove the width from the URL when the image is reset to its original size', () => {
        const {ce, ck5field} = editText('Resized image text');
        resizeToOriginal(ck5field);
        ce.save();

        getStoredText('resized-image').then(text => {
            shouldHaveImage(getImage(text), `${filesPath}/vacation.jpg`, '640', '427');
        });
    });

    it('should add the resized width to the URL of an inline image', () => {
        let edit = editText('Inline image text');
        resizeImage(edit.ck5field, 200);
        edit.ce.save();

        getStoredText('inline-image').then(text => {
            shouldHaveImage(getImage(text), `${filesPath}/placeholder.jpg?w=200`, '200', '130');
        });

        edit = editText('Inline image text');
        resizeToOriginal(edit.ck5field);
        edit.ce.save();

        getStoredText('inline-image').then(text => {
            shouldHaveImage(getImage(text), `${filesPath}/placeholder.jpg`, '500', '325');
        });
    });

    it('should keep the sizes of an image that was not resized in the editor', () => {
        const {ce, ck5field} = editText('Block image text');
        // CKEditor converts width and height styles on a figure to the image size, not to a resized width
        ck5field.type(`<figure class="image" style="width:300px;height:200px;"><img src="${filesPath}/vacation.jpg?w=300"></figure>`);
        ck5field.getData().then(data => {
            expect(getImage(data).attr('src')).to.equal(`${filesPath}/vacation.jpg?w=300`);
        });

        ck5field.type(`<p>Inline <img class="image_resized" style="aspect-ratio:16/9;height:auto;width:300px;" src="${filesPath}/vacation.jpg?w=300"></p>`);
        resizeToOriginal(ck5field);
        ck5field.getEditArea().find('img').should('have.attr', 'width', '640');
        ce.cancelAndDiscard();
    });

    it('should not modify the URL of an external image', () => {
        const {ce, ck5field} = editText('External image text');
        ck5field.getData().then(data => {
            expect(getImage(data).attr('src')).to.equal(externalSrc);
        });
        ce.cancel();
    });
});
