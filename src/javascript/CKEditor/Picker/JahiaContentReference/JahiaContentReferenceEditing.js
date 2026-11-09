import {createElement} from 'react';
import {createRoot} from 'react-dom/client';
import {Notification, Plugin, Widget, toWidget, viewToModelPositionOutsideModelElement} from 'ckeditor5';
import {
    CARD_CLASS,
    DATA_REF,
    DATA_VIEW,
    MARKER_CLASS,
    MODEL_ELEMENT,
    UUID_ATTRIBUTE,
    VIEW_ATTRIBUTE,
    isValidUuid,
    isValidView
} from './contentReference.constants';
import {CardRepository} from './cardRepository';
import {ReferenceCard} from './ReferenceCard';
import {JahiaContentReferenceCommand} from './JahiaContentReferenceCommand';
import {JahiaContentReferenceViewCommand} from './JahiaContentReferenceViewCommand';

let cardCount = 0;

export class JahiaContentReferenceEditing extends Plugin {
    static get pluginName() {
        return 'JahiaContentReferenceEditing';
    }

    static get requires() {
        return [Widget, Notification];
    }

    init() {
        const editor = this.editor;
        this.repository = new CardRepository(editor);

        this._defineSchema();
        this._defineConverters();

        editor.editing.mapper.on(
            'viewToModelPosition',
            viewToModelPositionOutsideModelElement(editor.model, viewElement => viewElement.hasClass(CARD_CLASS))
        );

        this.listenTo(editor, 'change:isReadOnly', () => this.repository.refreshAll());
        this.listenTo(editor.editing.view, 'render', () => this.repository.sweep(), {priority: 'low'});

        editor.commands.add('jahiaContentReference', new JahiaContentReferenceCommand(editor));
        editor.commands.add('jahiaContentReferenceView', new JahiaContentReferenceViewCommand(editor));
    }

    destroy() {
        this.repository.destroy();
        super.destroy();
    }

    _defineSchema() {
        const schema = this.editor.model.schema;

        schema.register(MODEL_ELEMENT, {
            inheritAllFrom: '$blockObject',
            allowAttributes: [UUID_ATTRIBUTE, VIEW_ATTRIBUTE]
        });

        // Keeps attributes that other features allow on every block, such as GHS or alignment, off the reference.
        schema.addAttributeCheck((context, attributeName) => {
            if (context.endsWith(MODEL_ELEMENT) && attributeName !== UUID_ATTRIBUTE && attributeName !== VIEW_ATTRIBUTE) {
                return false;
            }
        });
    }

    _defineConverters() {
        const editor = this.editor;
        const conversion = editor.conversion;
        const repository = this.repository;
        const t = editor.t;

        conversion.for('upcast').add(dispatcher => {
            dispatcher.on('element:div', upcastReference, {priority: 'high'});
        });

        conversion.for('dataDowncast').elementToElement({
            model: {name: MODEL_ELEMENT, attributes: [UUID_ATTRIBUTE, VIEW_ATTRIBUTE]},
            view: (modelElement, {writer}) => {
                const attributes = {class: MARKER_CLASS, [DATA_REF]: modelElement.getAttribute(UUID_ATTRIBUTE)};
                const view = modelElement.getAttribute(VIEW_ATTRIBUTE);
                if (view) {
                    attributes[DATA_VIEW] = view;
                }

                return writer.createEmptyElement('div', attributes);
            }
        });

        conversion.for('editingDowncast').elementToElement({
            model: {name: MODEL_ELEMENT, attributes: [UUID_ATTRIBUTE, VIEW_ATTRIBUTE]},
            view: (modelElement, {writer}) => {
                const uuid = modelElement.getAttribute(UUID_ATTRIBUTE);
                const view = modelElement.getAttribute(VIEW_ATTRIBUTE);
                if (!repository.get(uuid)) {
                    repository.fetch(uuid);
                }

                const body = writer.createRawElement('div', {class: `${CARD_CLASS}__body`}, domElement => {
                    const id = `${CARD_CLASS}-${++cardCount}`;
                    const root = createRoot(domElement);
                    const paint = () => root.render(createElement(ReferenceCard, {
                        id,
                        uuid,
                        entry: repository.get(uuid),
                        view,
                        isReadOnly: editor.isReadOnly,
                        t
                    }));
                    repository.register(uuid, domElement, root, paint);
                    paint();
                });
                const card = writer.createContainerElement('div', {class: CARD_CLASS}, [body]);

                return toWidget(card, writer, {label: t('JahiaContentReference:aria')});
            }
        });
    }
}

function upcastReference(evt, data, conversionApi) {
    const viewItem = data.viewItem;
    if (!viewItem.hasClass(MARKER_CLASS)) {
        return;
    }

    const uuid = (viewItem.getAttribute(DATA_REF) || '').toLowerCase();
    if (!isValidUuid(uuid)) {
        return;
    }

    const consumedAttributes = [DATA_REF];
    if (viewItem.hasAttribute(DATA_VIEW)) {
        consumedAttributes.push(DATA_VIEW);
    }

    const consumable = {name: true, classes: MARKER_CLASS, attributes: consumedAttributes};
    if (!conversionApi.consumable.test(viewItem, consumable)) {
        return;
    }

    const attributes = {[UUID_ATTRIBUTE]: uuid};
    const view = viewItem.getAttribute(DATA_VIEW);
    if (isValidView(view)) {
        attributes[VIEW_ATTRIBUTE] = view;
    }

    const modelElement = conversionApi.writer.createElement(MODEL_ELEMENT, attributes);
    if (!conversionApi.safeInsert(modelElement, data.modelCursor)) {
        return;
    }

    conversionApi.consumable.consume(viewItem, consumable);
    conversionApi.updateConversionResult(modelElement, data);
}
