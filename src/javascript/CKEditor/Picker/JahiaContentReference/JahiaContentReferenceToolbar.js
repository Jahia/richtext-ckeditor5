import {
    ButtonView,
    Collection,
    IconRemove,
    Plugin,
    UIModel,
    WidgetToolbarRepository,
    addListToDropdown,
    createDropdown,
    isWidget
} from 'ckeditor5';
import ContentReferenceIcon from './ContentReference.svg';
import {CARD_CLASS, UUID_ATTRIBUTE} from './contentReference.constants';
import {JahiaContentReferenceEditing} from './JahiaContentReferenceEditing';
import {getSelectedReference} from './JahiaContentReferenceCommand';

const key = k => `JahiaContentReference:${k}`;

const viewItem = (label, viewKey, isOn, isEnabled = true) => ({
    type: 'button',
    model: new UIModel({label, withText: true, isOn, isEnabled, viewKey})
});

export class JahiaContentReferenceToolbar extends Plugin {
    static get pluginName() {
        return 'JahiaContentReferenceToolbar';
    }

    static get requires() {
        return [WidgetToolbarRepository, JahiaContentReferenceEditing];
    }

    init() {
        const editor = this.editor;
        const t = editor.t;
        const factory = editor.ui.componentFactory;

        factory.add('jahiaContentReferenceReplace', locale => {
            const command = editor.commands.get('jahiaContentReference');
            const view = new ButtonView(locale);
            view.set({label: t(key('replace')), icon: ContentReferenceIcon, tooltip: true});
            view.bind('isEnabled').to(command);
            view.on('execute', () => editor.execute('jahiaContentReference'));
            return view;
        });

        factory.add('jahiaContentReferenceRemove', locale => {
            const command = editor.commands.get('jahiaContentReferenceView');
            const view = new ButtonView(locale);
            view.set({label: t(key('remove')), icon: IconRemove, tooltip: true});
            view.bind('isEnabled').to(command);
            view.on('execute', () => {
                editor.model.change(() => editor.model.deleteContent(editor.model.document.selection));
                editor.editing.view.focus();
            });
            return view;
        });

        factory.add('jahiaContentReferenceViewDropdown', locale => this._createViewDropdown(locale));
    }

    afterInit() {
        const editor = this.editor;

        editor.plugins.get(WidgetToolbarRepository).register('jahiaContentReference', {
            ariaLabel: editor.t(key('aria')),
            items: ['jahiaContentReferenceReplace', 'jahiaContentReferenceViewDropdown', '|', 'jahiaContentReferenceRemove'],
            getRelatedElement: selection => {
                const element = selection.getSelectedElement();
                return element && isWidget(element) && element.hasClass(CARD_CLASS) ? element : null;
            }
        });
    }

    _createViewDropdown(locale) {
        const editor = this.editor;
        const t = editor.t;
        const command = editor.commands.get('jahiaContentReferenceView');
        const repository = editor.plugins.get(JahiaContentReferenceEditing).repository;
        const items = new Collection();
        const dropdown = createDropdown(locale);

        dropdown.buttonView.set({withText: true, tooltip: true});
        dropdown.buttonView.bind('label').to(command, 'value', value => `${t(key('view'))}: ${value || t(key('defaultView'))}`);
        dropdown.bind('isEnabled').to(command);

        addListToDropdown(dropdown, items, {ariaLabel: t(key('view'))});

        dropdown.on('change:isOpen', (evt, name, isOpen) => {
            const selected = getSelectedReference(editor.model.document.selection);
            if (!isOpen || !selected) {
                return;
            }

            const uuid = selected.getAttribute(UUID_ATTRIBUTE);
            const current = command.value;
            items.clear();
            items.add(viewItem(t(key('loading')), null, false, false));

            repository.fetchViews(uuid).then(views => {
                if (!dropdown.isOpen || getSelectedReference(editor.model.document.selection) !== selected) {
                    return;
                }

                items.clear();
                items.add(viewItem(t(key('defaultView')), null, !current));
                views.forEach(view => items.add(viewItem(view.displayName || view.key, view.key, view.key === current)));
                if (current && !views.some(view => view.key === current)) {
                    items.add(viewItem(`${current} ${t(key('unavailable'))}`, current, true));
                }
            });
        });

        dropdown.on('execute', evt => {
            editor.execute('jahiaContentReferenceView', {view: evt.source.viewKey});
            editor.editing.view.focus();
        });

        return dropdown;
    }
}
