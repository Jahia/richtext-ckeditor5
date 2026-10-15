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

    execute(command: string) {
        this.getEditArea().then($myElement => {
            const ckeditorInstance = $myElement.prop('ckeditorInstance');
            ckeditorInstance.execute(command);
        });
    }

    // Inserts at the end of the first block through the model, so the selection does not move
    appendText(text: string) {
        this.getEditArea().then($myElement => {
            const ckeditorInstance = $myElement.prop('ckeditorInstance');
            const model = ckeditorInstance.model;
            model.change(writer => {
                writer.insertText(text, model.document.getRoot().getChild(0), 'end');
            });
        });
    }

    getCreateContentButton(): Cypress.Chainable<JQuery<HTMLElement>> {
        return this.getToolbarButton('Create new content');
    }

    // In CKEditor fullscreen, the toolbar moves out of the field into a container of the body
    getFullscreenToolbarButton(buttonName: string): Cypress.Chainable<JQuery<HTMLElement>> {
        return cy.get('.ck-fullscreen__main-wrapper .ck-toolbar__items').find(`button[data-cke-tooltip-text^="${buttonName}"]`);
    }

    getReferenceCards(): Cypress.Chainable<JQuery<HTMLElement>> {
        return this.getEditArea().find('.jahia-content-reference-card');
    }

    getReferenceCard(index: number): Cypress.Chainable<JQuery<HTMLElement>> {
        return this.getReferenceCards().eq(index);
    }

    // The view dropdown is the only dropdown of the reference toolbar, and its label names the current view.
    // It builds its list on each open, so the entry only exists after the click.
    getReferenceViewDropdown(): Cypress.Chainable<JQuery<HTMLElement>> {
        return this.get().get('.ck-balloon-panel > .ck-balloon-rotator')
            .should('be.visible')
            .find('.ck-dropdown > button.ck-dropdown__button');
    }

    selectReferenceView(label: string | RegExp) {
        this.getReferenceViewDropdown().click();
        cy.get('.ck-balloon-panel .ck-dropdown__panel-visible')
            .find('.ck-list__item button')
            .contains(label)
            .should('be.visible')
            .click();
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
            .should('exist')
            .closest('button');
    }

    getMenuBar(): Cypress.Chainable<JQuery<HTMLElement>> {
        return this.get().find('div.ck-menu-bar__menu_top-level > button.ck-menu-bar__menu__button');
    }

    getMenuItemByLabel(label: string): Cypress.Chainable<JQuery<HTMLElement>> {
        return this.getMenuBar()
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

    assertMenuBarDoesNotContain(parentMenuLabel: string, label: string): void {
        this.get().find('div.ck-menu-bar__menu_top-level > button.ck-menu-bar__menu__button').then($buttons => {
            const $parentBtn = $buttons.filter((_, el) => el.textContent?.trim() === parentMenuLabel);
            if ($parentBtn.length === 0) {
                // Parent menu is absent entirely — child item cannot be present
                return;
            }

            // Parent menu exists — open it and verify the label is not among its items
            cy.wrap($parentBtn).click();
            this.get()
                .find('.ck-menu-bar')
                .find('ul.ck-list li.ck-list__item button.ck-list-item-button')
                .should('not.contain', label, {timeout: 10000});
        });
    }

    selectHeading(heading: string) {
        this.get().find('.ck-heading-dropdown').find('.ck-list__item').contains(heading).click();
    }

    // The CK5 style feature renders as a text-label dropdown (`.ck-style-dropdown`) with no
    // tooltip, so it cannot be located through getToolbarButton (which matches data-cke-tooltip-text).
    getStyleDropdown(): Cypress.Chainable<JQuery<HTMLElement>> {
        return this.get().find('.ck-toolbar__items').find('.ck-style-dropdown');
    }

    selectStyle(name: string) {
        // Open the Style dropdown, then click the entry matching `name`. The styles grid is
        // created lazily on first open, so it only exists after the button is clicked.
        this.getStyleDropdown().find('button.ck-dropdown__button').click();
        cy.get('.ck-style-grid__button').contains(name).should('be.visible').click();
    }

    getMacrosSuggestion(id: string) {
        return this.get()
            .get('.ck-mentions')
            .should('be.visible')
            .find(`div[id="${id}"]`)
            .should('exist');
    }
}
