import {plugins} from './plugins-complete';
import {completeConfig} from './config-complete';

export const lightConfig = {
    plugins,
    ...completeConfig,
    toolbar: {
        items: [
            'undo',
            'redo',
            'heading',
            'bold',
            'italic',
            'removeFormat',
            '|',
            'alignment',
            '|',
            'insertJahiaImage',
            'link',
            'insertTable',
            '|',
            'bulletedList',
            'numberedList',
            'indent',
            'outdent'
        ],
        // Set to true to wrap the toolbar items
        // Set to false if we want to group items
        shouldNotGroupWhenFull: true
    },
    menuBar: {
        isVisible: false
    }
};
