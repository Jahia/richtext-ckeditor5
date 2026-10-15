import {Command} from 'ckeditor5';
import {EXTENDED_RICH_TEXT, MODEL_ELEMENT, REFUSED_TYPES, UUID_ATTRIBUTE, isValidUuid} from '../JahiaContentReference/contentReference.constants';
import {getSelectedReference} from '../JahiaContentReference/JahiaContentReferenceCommand';
import {richTextCreatableTypes} from './createContent.gql-queries';

// Restates the jContent defaults, which the excludedNodeTypes argument replaces.
export const CREATE_EXCLUDED_TYPES = ['jmix:studioOnly', 'jmix:hiddenType', 'jnt:contentFolder', 'jnt:contentList', EXTENDED_RICH_TEXT];

const PRUNED_TYPES = new Set([...REFUSED_TYPES, EXTENDED_RICH_TEXT]);

const key = k => `JahiaCreateContent:${k}`;

export const pruneTree = tree => tree
    .map(entry => {
        if (!entry.children?.length) {
            return PRUNED_TYPES.has(entry.name) ? null : entry;
        }

        const children = entry.children.filter(child => !PRUNED_TYPES.has(child.name));
        return children.length > 0 ? {...entry, children} : null;
    })
    .filter(Boolean);

export class JahiaCreateContentCommand extends Command {
    constructor(editor) {
        super(editor);
        this._mode = editor.config.get('jahiaCreateContent.mode');
        this._parentUuid = editor.config.get('jahiaCreateContent.parentUuid');
        this._busy = false;
    }

    refresh() {
        const model = this.editor.model;
        const selection = model.document.selection;
        const position = selection.getFirstPosition();

        this.isEnabled = this._canCreate() && !this._busy && (
            Boolean(getSelectedReference(selection)) || Boolean(position && model.schema.findAllowedParent(position, MODEL_ELEMENT))
        );
    }

    async execute() {
        const editor = this.editor;

        if (!this._canCreate()) {
            this._warn('saveFirst');
            return;
        }

        if (!window.CE_API?.create) {
            this._warn('unavailable');
            return;
        }

        const {client, lang, uilang} = editor.config.get('jahiaCreateContent');
        this._clearOverlays();
        this._setBusy(true);
        try {
            const {data} = await client.query({
                query: richTextCreatableTypes,
                fetchPolicy: 'network-only',
                variables: {uuid: this._parentUuid, uilang, excludedNodeTypes: CREATE_EXCLUDED_TYPES}
            });
            const tree = pruneTree(data?.forms?.contentTypesAsTree || []);
            if (tree.length === 0) {
                this._warn('noCreatableType');
                return;
            }

            await window.CE_API.create({
                uuid: this._parentUuid,
                lang,
                nodeTypesTree: tree,
                isFullscreen: false,
                createCallback: newNode => this._insertCreated(newNode)
            });
        } catch (e) {
            console.error(e);
            this._warn('error');
        } finally {
            this._setBusy(false);
        }
    }

    _canCreate() {
        return this._mode === 'edit' && Boolean(this._parentUuid);
    }

    _setBusy(busy) {
        this._busy = busy;
        if (this.editor.state !== 'destroyed') {
            this.refresh();
        }
    }

    _clearOverlays() {
        const editor = this.editor;

        if (editor.commands.get('toggleFullscreen')?.value) {
            editor.execute('toggleFullscreen');
        }

        editor.ui.view.menuBarView?.close();

        if (editor.plugins.has('Dialog') && editor.plugins.get('Dialog').isOpen) {
            editor.plugins.get('Dialog').hide();
        }

        document.activeElement?.blur?.();
    }

    _insertCreated(newNode) {
        const editor = this.editor;
        const uuid = String(newNode?.uuid || '').toLowerCase();
        if (editor.state === 'destroyed' || editor.isReadOnly || !isValidUuid(uuid)) {
            return;
        }

        const model = editor.model;
        const selected = getSelectedReference(model.document.selection);
        const selectable = selected ? model.createSelection(model.createPositionAfter(selected)) : null;
        model.change(writer => {
            const element = writer.createElement(MODEL_ELEMENT, {[UUID_ATTRIBUTE]: uuid});
            model.insertObject(element, selectable, null, {setSelection: 'after', findOptimalPosition: selected ? undefined : 'auto'});
        });
    }

    _warn(messageKey) {
        const t = this.editor.t;
        this.editor.plugins.get('Notification').showWarning(t(key(messageKey)), {
            title: t(key('label')),
            namespace: 'jahiaCreateContent'
        });
    }
}
