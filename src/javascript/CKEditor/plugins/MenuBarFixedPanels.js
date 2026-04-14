import {Plugin} from 'ckeditor5';

const NESTED_PANEL_HORIZONTAL_OFFSET = 5;

/**
 * Fixes CKEditor 5 menu bar dropdown panels being clipped by ancestors with
 * overflow: hidden
 */
export class MenuBarFixedPanels extends Plugin {
    static get pluginName() {
        return 'MenuBarFixedPanels';
    }

    afterInit() {
        const view = this.editor.ui.view;
        const menuBarView = view && view.menuBarView;
        if (!menuBarView) {
            return;
        }

        // Sub-menus are created lazily the first time their parent menu opens,
        // so we patch registerMenu to catch them as they appear.
        const originalRegisterMenu = menuBarView.registerMenu.bind(menuBarView);
        menuBarView.registerMenu = (menuView, parentMenuView) => {
            originalRegisterMenu(menuView, parentMenuView);
            this._observeMenu(menuView);
        };

        for (const menuView of menuBarView.menus) {
            this._observeMenu(menuView);
        }
    }

    _observeMenu(menuView) {
        if (menuView._fixedPanelObserved) {
            return;
        }

        menuView._fixedPanelObserved = true;

        menuView.on('change:isOpen', (evt, name, isOpen) => {
            if (!isOpen) {
                return;
            }

            this._applyFixedPosition(menuView, menuView.panelView.element);
        });

        menuView.panelView.on('change:position', () => {
            if (menuView.isOpen) {
                this._applyFixedPosition(menuView, menuView.panelView.element);
            }
        });
    }

    _applyFixedPosition(menuView, panelEl) {
        const buttonRect = menuView.buttonView.element.getBoundingClientRect();
        const positionName = menuView.panelView.position;

        panelEl.style.position = 'fixed';
        panelEl.style.zIndex = '10000';

        panelEl.style.top = 'auto';
        panelEl.style.bottom = 'auto';
        panelEl.style.left = 'auto';
        panelEl.style.right = 'auto';

        const panelRect = panelEl.getBoundingClientRect();

        let top;
        let left;

        switch (positionName) {
            case 'se':
                top = buttonRect.bottom;
                left = buttonRect.left;
                break;
            case 'sw':
                top = buttonRect.bottom;
                left = buttonRect.right - panelRect.width;
                break;
            case 'ne':
                top = buttonRect.top - panelRect.height;
                left = buttonRect.left;
                break;
            case 'nw':
                top = buttonRect.top - panelRect.height;
                left = buttonRect.right - panelRect.width;
                break;
            case 'es':
                top = buttonRect.top;
                left = buttonRect.right - NESTED_PANEL_HORIZONTAL_OFFSET;
                break;
            case 'en':
                top = buttonRect.bottom - panelRect.height;
                left = buttonRect.right - NESTED_PANEL_HORIZONTAL_OFFSET;
                break;
            case 'ws':
                top = buttonRect.top;
                left = buttonRect.left - panelRect.width + NESTED_PANEL_HORIZONTAL_OFFSET;
                break;
            case 'wn':
                top = buttonRect.bottom - panelRect.height;
                left = buttonRect.left - panelRect.width + NESTED_PANEL_HORIZONTAL_OFFSET;
                break;
            default:
                top = buttonRect.bottom;
                left = buttonRect.left;
        }

        panelEl.style.top = `${top}px`;
        panelEl.style.left = `${left}px`;
    }

}
