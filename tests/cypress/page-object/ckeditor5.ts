import {ContentEditor} from '@jahia/jcontent-cypress/dist/page-object/contentEditor';
import {Field} from '@jahia/jcontent-cypress/dist/page-object/fields/field';
export class Ckeditor5 extends ContentEditor {
    getRichTextCKeditor5Field(fieldName: string): RichTextCKeditor5Field {
        return this.getField(RichTextCKeditor5Field, fieldName, false);
    }
}

export class RichTextCKeditor5Field extends Field {
    getEditArea() {
        return this.get().find('.ck-editor__editable');
    }

    type(text: string) {
        this.getEditArea().then($myElement => {
            const ckeditorInstance = $myElement.prop('ckeditorInstance');
            ckeditorInstance.setData(text);
        });
    }

    getData(): Cypress.Chainable<string> {
        return this.getEditArea().then($myElement => {
            const ckeditorInstance = $myElement.prop('ckeditorInstance');
            return ckeditorInstance.getData();
        });
    }

    getSourceEditingArea(): Cypress.Chainable<JQuery<HTMLElement>> {
        return this.get().find('.ck-source-editing-area');
    }

    getEnhancedSourceEditingArea(): Cypress.Chainable<JQuery<HTMLElement>> {
        return cy.get('.ck-dialog-overlay').find('.ck-source-editing-enhanced-dialog');
    }

    getToolbarButton(buttonName: string): Cypress.Chainable<JQuery<HTMLElement>> {
        return this.get().find('.ck-toolbar__items').find(`button[data-cke-tooltip-text^="${buttonName}"]`);
    }

    getBalloonToolbarButton(buttonName: string) {
        return this.get().get('.ck-balloon-panel > .ck-balloon-rotator')
            .should('be.visible')
            .find(`button.ck-button[data-cke-tooltip-text="${buttonName}"]`);
    }

    getBalloonToggleButton(label: string) {
        return this.get()
            .get('.ck-balloon-panel > .ck-balloon-rotator')
            .should('be.visible')
            .find('button.ck-switchbutton')
            .contains(label)
            .should('be.visible')
            .closest('button');
    }

    getBalloonButton(label: string) {
        return this.get()
            .get('.ck-balloon-panel > .ck-balloon-rotator')
            .should('be.visible')
            .find('button.ck-button')
            .contains(label)
            .should('be.visible')
            .closest('button');
    }

    getMenuItemByLabel(label: string): Cypress.Chainable<JQuery<HTMLElement>> {
        return this.get().find('div.ck-menu-bar__menu_top-level > button.ck-menu-bar__menu__button')
            .contains('button.ck-menu-bar__menu__button', label);
    }

    clickMenuItemByLabel(label: string, open: boolean = true) {
        const menuItem = this.getMenuItemByLabel(label);
        menuItem.should('be.visible');
        menuItem.click();
        menuItem.should('have.attr', 'aria-expanded', open.toString());
    }

    getMenuSubItemByLabel(label: string): Cypress.Chainable<JQuery<HTMLElement>> {
        return this.get().find('.ck-menu-bar').find('ul.ck-list li.ck-list__item button.ck-list-item-button').contains(label);
    }

    selectHeading(heading: string) {
        this.get().find('.ck-heading-dropdown').find('.ck-list__item').contains(heading).click();
    }
}
