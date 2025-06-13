import {Plugin} from 'ckeditor5';

import {PickerUI} from './ui';

export class Picker extends Plugin {
    static get pluginName() {
        return 'Jahia Node Picker';
    }

    static get requires() {
        return [PickerUI];
    }
}
