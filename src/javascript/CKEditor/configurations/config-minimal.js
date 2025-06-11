import {completeConfig} from './config-complete';

export const minimalConfig = {
    ...completeConfig,
    toolbar: {
        items: [
            'bold',
            'italic',
            'underline',
            'removeFormat',
            'alignment:left',
            'alignment:center',
            'alignment:right'
        ],
        // Set to true to wrap the toolbar items
        // Set to false if we want to group items
        shouldNotGroupWhenFull: true
    },
    menuBar: {
        isVisible: false
    }
};
