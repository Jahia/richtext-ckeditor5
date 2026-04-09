import {Plugin, clickOutsideHandler} from 'ckeditor5';

/**
 * Moves CKEditor 5 menu bar dropdown panels into document.body when they open.
 * Without this, panels are clipped by ancestors of the editor.
 */
export class MenuBarBodyPanels extends Plugin {
    static get pluginName() {
        return 'MenuBarBodyPanels';
    }

    constructor(editor) {
        super(editor);
        this._wrappers = new Set();
    }

    afterInit() {
        const view = this.editor.ui.view;
        const menuBarView = view && view.menuBarView;
        if (!menuBarView) {
            return;
        }

        menuBarView.stopListening(document, 'mousedown');
        clickOutsideHandler({
            emitter: menuBarView,
            activator: () => menuBarView.isOpen,
            callback: () => menuBarView.close(),
            contextElements: () => [
                ...menuBarView.children.map(child => child.element),
                ...this._wrappers
            ]
        });

        // Sub-menus are created lazily the first time their parent menu opens,
        // registerMenu to catch them as they appear.
        const originalRegisterMenu = menuBarView.registerMenu.bind(menuBarView);
        menuBarView.registerMenu = (menuView, parentMenuView) => {
            originalRegisterMenu(menuView, parentMenuView);
            this._observeMenu(menuView);
        };

        for (const menuView of menuBarView.menus) {
            this._observeMenu(menuView);
        }
    }

    destroy() {
        for (const wrapper of this._wrappers) {
            if (wrapper.parentNode) {
                wrapper.parentNode.removeChild(wrapper);
            }
        }

        this._wrappers.clear();
        super.destroy();
    }

    _observeMenu(menuView) {
        if (menuView._bodyPanelObserved) {
            return;
        }

        menuView._bodyPanelObserved = true;

        let wrapper = null;

        menuView.on('change:isOpen', (evt, name, isOpen) => {
            if (!isOpen) {
                return;
            }

            if (!wrapper) {
                wrapper = document.createElement('div');
                wrapper.className = 'ck ck-reset_all ck-menu-bar__menu';
                wrapper.dir = menuView.locale.uiLanguageDirection;
                wrapper.style.position = 'fixed';
                wrapper.style.zIndex = '10000';
                wrapper.style.pointerEvents = 'none';
                document.body.appendChild(wrapper);
                this._wrappers.add(wrapper);
            }

            const panelEl = menuView.panelView.element;
            if (panelEl.parentNode !== wrapper) {
                wrapper.appendChild(panelEl);
            }

            this._positionWrapper(menuView, wrapper);
        });

        // CKEditor re-evaluates the optimal position name when the menu opens;
        // re-run positioning whenever it changes.
        menuView.panelView.on('change:position', () => {
            if (menuView.isOpen && wrapper) {
                this._positionWrapper(menuView, wrapper);
            }
        });
    }

    _positionWrapper(menuView, wrapper) {
        const buttonRect = menuView.buttonView.element.getBoundingClientRect();
        wrapper.style.top = `${buttonRect.top}px`;
        wrapper.style.left = `${buttonRect.left}px`;
        wrapper.style.width = `${buttonRect.width}px`;
        wrapper.style.height = `${buttonRect.height}px`;
    }
}
