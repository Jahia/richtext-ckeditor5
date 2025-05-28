import {BaseComponent} from '@jahia/cypress';

export class ResizeImage extends BaseComponent {
    static readonly defaultSelector = 'form.ck-image-custom-resize-form';

    shouldBeVisible(): this {
        this.get().should('be.visible')
            .find('h2').should('have.text', 'Image Resize');
        return this;
    }

    setResizeWidth(width: number): this {
        this.get().find('input').type(`${width}{enter}`, {force: true});
        return this;
    }
}
