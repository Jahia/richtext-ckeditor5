import {Command} from 'ckeditor5';
import {DEFAULT_VIEW, VIEW_ATTRIBUTE, isValidView} from './contentReference.constants';
import {getSelectedReference} from './JahiaContentReferenceCommand';

export class JahiaContentReferenceViewCommand extends Command {
    refresh() {
        const selected = getSelectedReference(this.editor.model.document.selection);

        this.isEnabled = Boolean(selected);
        this.value = selected ? selected.getAttribute(VIEW_ATTRIBUTE) || null : null;
    }

    execute({view} = {}) {
        const model = this.editor.model;
        const selected = getSelectedReference(model.document.selection);
        if (!selected) {
            return;
        }

        if (view === null || view === undefined || view === DEFAULT_VIEW) {
            model.change(writer => writer.removeAttribute(VIEW_ATTRIBUTE, selected));
        } else if (isValidView(view)) {
            model.change(writer => writer.setAttribute(VIEW_ATTRIBUTE, view, selected));
        }
    }
}
