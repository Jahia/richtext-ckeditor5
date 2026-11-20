import {Command} from 'ckeditor5';
import {MODEL_ELEMENT, UUID_ATTRIBUTE, VIEW_ATTRIBUTE, isValidUuid} from './contentReference.constants';

export const getSelectedReference = selection => {
    const element = selection.getSelectedElement();
    return element && element.is('element', MODEL_ELEMENT) ? element : null;
};

const key = k => `JahiaContentReference:${k}`;

export class JahiaContentReferenceCommand extends Command {
    refresh() {
        const model = this.editor.model;
        const selection = model.document.selection;
        const selected = getSelectedReference(selection);
        const position = selection.getFirstPosition();

        this.value = selected ? {
            uuid: selected.getAttribute(UUID_ATTRIBUTE),
            view: selected.getAttribute(VIEW_ATTRIBUTE) || null
        } : null;
        this.isEnabled = Boolean(selected) || Boolean(position && model.schema.findAllowedParent(position, MODEL_ELEMENT));
    }

    execute({uuid} = {}) {
        const editor = this.editor;

        if (uuid !== undefined) {
            const normalized = String(uuid).toLowerCase();
            if (isValidUuid(normalized)) {
                this._apply(normalized, null);
            }

            return;
        }

        if (!window.CE_API?.openPicker) {
            this._warn('pickerUnavailable');
            return;
        }

        window.CE_API.openPicker({
            type: 'droppableContent',
            value: this.value?.uuid || null,
            setValue: nodes => this._onPicked(nodes),
            ...editor.config.get('picker')
        });
    }

    _onPicked(nodes) {
        const node = nodes?.[0];
        if (!node) {
            return;
        }

        const repository = this.editor.plugins.get('JahiaContentReferenceEditing').repository;
        const pickedUuid = String(node.uuid || '').toLowerCase();
        let lookup;
        if (isValidUuid(pickedUuid)) {
            lookup = repository.findById(pickedUuid);
        } else if (node.path) {
            lookup = repository.findByPath(node.path);
        } else {
            return;
        }

        lookup.then(found => {
            if (found && !repository.destroyed) {
                this._insertPicked(found);
            }
        });
    }

    _insertPicked(node) {
        const repository = this.editor.plugins.get('JahiaContentReferenceEditing').repository;
        const uuid = String(node.uuid || '').toLowerCase();
        if (!isValidUuid(uuid)) {
            return;
        }

        if (node.refused) {
            this._warn('refusedType');
            return;
        }

        if (node.path && node.path === this.editor.config.get('jahiaContentReference')?.path) {
            this._warn('selfReference');
            return;
        }

        repository.prime(uuid, node);
        this._apply(uuid, node.primaryNodeType?.name);
    }

    _apply(uuid, typeName) {
        const editor = this.editor;
        const model = editor.model;
        const repository = editor.plugins.get('JahiaContentReferenceEditing').repository;
        const selected = getSelectedReference(model.document.selection);

        model.change(writer => {
            if (selected) {
                const previousType = repository.get(selected.getAttribute(UUID_ATTRIBUTE))?.typeName;
                writer.setAttribute(UUID_ATTRIBUTE, uuid, selected);
                if (!typeName || previousType !== typeName) {
                    writer.removeAttribute(VIEW_ATTRIBUTE, selected);
                }
            } else {
                const element = writer.createElement(MODEL_ELEMENT, {[UUID_ATTRIBUTE]: uuid});
                model.insertObject(element, null, null, {setSelection: 'on', findOptimalPosition: 'auto'});
            }
        });
    }

    _warn(messageKey) {
        const t = this.editor.t;
        this.editor.plugins.get('Notification').showWarning(t(key(messageKey)), {
            title: t(key('label')),
            namespace: 'jahiaContentReference'
        });
    }
}
