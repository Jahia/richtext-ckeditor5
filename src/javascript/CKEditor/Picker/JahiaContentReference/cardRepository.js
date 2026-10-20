import {REFUSED_TYPES} from './contentReference.constants';
import {
    richTextContentReferenceCard,
    richTextContentReferenceCardByPath,
    richTextContentReferenceViews
} from './contentReference.gql-queries';

const toEntry = node => {
    if (!node?.uuid || node.refused) {
        return {status: 'missing'};
    }

    return {
        status: 'ok',
        displayName: node.displayName || node.name,
        name: node.name,
        typeName: node.primaryNodeType?.name,
        icon: node.primaryNodeType?.icon,
        typeLabel: node.primaryNodeType?.displayName || node.primaryNodeType?.name
    };
};

const unmount = root => Promise.resolve().then(() => root.unmount());

/**
 * Holds what the cards of one editor show, keyed by the uuid of the referenced node.
 */
export class CardRepository {
    constructor(editor) {
        this.editor = editor;
        this.entries = new Map();
        this.pending = new Map();
        this.views = new Map();
        this.cards = new Map();
        this.destroyed = false;
    }

    get(uuid) {
        return this.entries.get(uuid);
    }

    register(uuid, domElement, root, paint) {
        if (!this.cards.has(uuid)) {
            this.cards.set(uuid, new Map());
        }

        this.cards.get(uuid).set(domElement, {root, paint});
    }

    prime(uuid, node) {
        this.entries.set(uuid, toEntry({...node, uuid}));
        this.refresh(uuid);
    }

    fetch(uuid) {
        if (this.pending.has(uuid)) {
            return this.pending.get(uuid);
        }

        const picker = this.editor.config.get('picker');
        if (!picker?.client) {
            this.entries.set(uuid, {status: 'missing'});
            return Promise.resolve(this.entries.get(uuid));
        }

        this.entries.set(uuid, {status: 'loading'});
        const promise = this.findById(uuid)
            .then(toEntry)
            .then(entry => {
                this.pending.delete(uuid);
                if (!this.destroyed) {
                    this.entries.set(uuid, entry);
                    this.refresh(uuid);
                }

                return entry;
            });
        this.pending.set(uuid, promise);
        return promise;
    }

    findById(uuid) {
        const picker = this.editor.config.get('picker');
        return picker.client.query({
            query: richTextContentReferenceCard,
            variables: {uuid, language: picker.lang, uilang: picker.uilang, refusedTypes: REFUSED_TYPES},
            fetchPolicy: 'network-only',
            errorPolicy: 'all'
        })
            .then(({data}) => data?.jcr?.nodeById || null)
            .catch(() => null);
    }

    findByPath(path) {
        const picker = this.editor.config.get('picker');
        return picker.client.query({
            query: richTextContentReferenceCardByPath,
            variables: {path, language: picker.lang, uilang: picker.uilang, refusedTypes: REFUSED_TYPES},
            fetchPolicy: 'network-only',
            errorPolicy: 'all'
        })
            .then(({data}) => data?.jcr?.nodeByPath || null)
            .catch(() => null);
    }

    fetchViews(uuid) {
        const picker = this.editor.config.get('picker');
        const path = this.editor.config.get('jahiaContentReference')?.path;
        const typeName = this.entries.get(uuid)?.typeName;
        if (!picker?.client || !path) {
            return Promise.resolve([]);
        }

        const cacheKey = typeName ? `${typeName}|${path}` : `${uuid}|${path}`;
        if (!this.views.has(cacheKey)) {
            const promise = picker.client.query({
                query: richTextContentReferenceViews,
                variables: {uuid, path},
                fetchPolicy: 'network-only',
                errorPolicy: 'all'
            })
                .then(({data}) => data?.jcontent?.richtext?.referenceViews || [])
                .catch(() => {
                    this.views.delete(cacheKey);
                    return [];
                });
            this.views.set(cacheKey, promise);
        }

        return this.views.get(cacheKey);
    }

    refresh(uuid) {
        if (this.destroyed) {
            return;
        }

        const cards = this.cards.get(uuid);
        if (!cards) {
            return;
        }

        cards.forEach(({root, paint}, domElement) => {
            if (domElement.isConnected) {
                paint();
            } else {
                cards.delete(domElement);
                unmount(root);
            }
        });
    }

    refreshAll() {
        this.cards.forEach((cards, uuid) => this.refresh(uuid));
    }

    sweep() {
        this.cards.forEach(cards => cards.forEach(({root}, domElement) => {
            if (!domElement.isConnected) {
                cards.delete(domElement);
                unmount(root);
            }
        }));
    }

    destroy() {
        this.destroyed = true;
        this.cards.forEach(cards => cards.forEach(({root}) => unmount(root)));
        this.entries.clear();
        this.pending.clear();
        this.views.clear();
        this.cards.clear();
    }
}
