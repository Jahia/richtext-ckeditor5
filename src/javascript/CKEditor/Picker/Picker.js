import {Plugin} from 'ckeditor5';

import {PickerUI} from './ui';
import {PickerUploadAdapter} from '~/CKEditor/Picker/uploadAdapter';

export class Picker extends Plugin {
    static get pluginName() {
        return 'Jahia Node Picker';
    }

    static get requires() {
        return [PickerUI, PickerUploadAdapter];
    }
}
