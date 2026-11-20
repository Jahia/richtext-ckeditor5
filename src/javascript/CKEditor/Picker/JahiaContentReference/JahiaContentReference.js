import {Plugin} from 'ckeditor5';
import {loadTranslations} from '../../../RichTextCKEditor5/RichTextCKEditor5.utils';
import {JahiaContentReferenceEditing} from './JahiaContentReferenceEditing';
import {JahiaContentReferenceUI} from './JahiaContentReferenceUI';
import {JahiaContentReferenceToolbar} from './JahiaContentReferenceToolbar';
import './contentReference.css';

export class JahiaContentReference extends Plugin {
    static get pluginName() {
        return 'JahiaContentReference';
    }

    static get requires() {
        return [JahiaContentReferenceEditing, JahiaContentReferenceUI, JahiaContentReferenceToolbar];
    }

    static prefixedTranslationKey(key) {
        return `${JahiaContentReference.pluginName}:${key}`;
    }

    static get translations() {
        const k = JahiaContentReference.prefixedTranslationKey;

        return {
            fr: {
                [k('label')]: 'Référencer un contenu existant',
                [k('replace')]: 'Remplacer le contenu référencé',
                [k('view')]: 'Vue',
                [k('defaultView')]: 'Par défaut',
                [k('remove')]: 'Supprimer la référence',
                [k('loading')]: 'Chargement…',
                [k('missing')]: 'Contenu introuvable ou inaccessible',
                [k('aria')]: 'Contenu référencé',
                [k('unavailable')]: '(indisponible)',
                [k('pickerUnavailable')]: 'Le sélecteur de contenu n\'est pas disponible.',
                [k('refusedType')]: 'Ce type de contenu ne peut pas être référencé.',
                [k('selfReference')]: 'Un contenu ne peut pas se référencer lui-même.'
            },
            de: {
                [k('label')]: 'Vorhandenen Inhalt referenzieren',
                [k('replace')]: 'Referenzierten Inhalt ersetzen',
                [k('view')]: 'Ansicht',
                [k('defaultView')]: 'Standard',
                [k('remove')]: 'Referenz entfernen',
                [k('loading')]: 'Wird geladen…',
                [k('missing')]: 'Inhalt nicht gefunden oder nicht zugänglich',
                [k('aria')]: 'Referenzierter Inhalt',
                [k('unavailable')]: '(nicht verfügbar)',
                [k('pickerUnavailable')]: 'Die Inhaltsauswahl ist nicht verfügbar.',
                [k('refusedType')]: 'Dieser Inhaltstyp kann nicht referenziert werden.',
                [k('selfReference')]: 'Ein Inhalt kann sich nicht selbst referenzieren.'
            },
            en: {
                [k('label')]: 'Reference existing content',
                [k('replace')]: 'Replace referenced content',
                [k('view')]: 'View',
                [k('defaultView')]: 'Default',
                [k('remove')]: 'Remove reference',
                [k('loading')]: 'Loading…',
                [k('missing')]: 'Content not found or not accessible',
                [k('aria')]: 'Referenced content',
                [k('unavailable')]: '(unavailable)',
                [k('pickerUnavailable')]: 'The content picker is not available.',
                [k('refusedType')]: 'This type of content cannot be referenced.',
                [k('selfReference')]: 'A content cannot reference itself.'
            }
        };
    }

    init() {
        loadTranslations(this.editor, JahiaContentReference.translations);
    }
}
