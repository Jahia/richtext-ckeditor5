import {BaseComponent} from '@jahia/cypress';

export class EditLinkForm extends BaseComponent {
    static readonly defaultSelector = 'form.ck-link-form';

    shouldBeVisible(): this {
        this.get().should('be.visible')
            .find('h2').should('have.text', 'Link');
        return this;
    }

    setLinkUrl(linkUrl: string) {
        this.shouldBeVisible();
        const linkUrlInput = this.get().contains('Link URL').closest('div').find('input');
        linkUrlInput.should('be.visible')
            .clear()
            .type(`${linkUrl}{enter}`, {delay: 500});
    }
}
