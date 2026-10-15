import {Plugin} from 'ckeditor5';
import {JahiaContentReferenceEditing} from '../JahiaContentReference/JahiaContentReferenceEditing';
import {JahiaCreateContentCommand} from './JahiaCreateContentCommand';

export class JahiaCreateContentEditing extends Plugin {
    static get pluginName() {
        return 'JahiaCreateContentEditing';
    }

    static get requires() {
        return [JahiaContentReferenceEditing];
    }

    init() {
        this.editor.commands.add('jahiaCreateContent', new JahiaCreateContentCommand(this.editor));
    }
}
