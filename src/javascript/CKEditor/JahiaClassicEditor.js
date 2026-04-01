/**
 * @license Copyright (c) 2014-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
import {ClassicEditor} from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';
import 'ckeditor5-premium-features/ckeditor5-premium-features.css';
import {isProductivityMode} from '~/RichTextCKEditor5/RichTextCKEditor5.utils';
import {removePlugin, removeToolbarItems} from '~/CKEditor/config.utils';

export class JahiaClassicEditor extends ClassicEditor {
    static create(sourceElementOrData, config = {}) {
        if (isProductivityMode()) {
            // eslint-disable-next-line no-undef
            config.licenseKey = CKEDITOR_PRODUCTIVITY_LICENSE;
        } else {
            console.debug('Productivity mode not enabled');
            config.licenseKey = 'GPL';
        }

        // Remove Templates plugin, toolbar item if no definitions
        if (!config.template?.definitions) {
            console.debug('Removing Template plugin and toolbar item as no definitions are provided.');
            removePlugin(config, 'Template');
            removeToolbarItems(config, 'template');
        }

        // Remove Styles plugin, toolbar item if no definitions
        if (!config.style?.definitions) {
            console.debug('Removing Style plugin and toolbar item as no definitions are provided.');
            removePlugin(config, 'Style');
            removeToolbarItems(config, 'style');
        }

        return super.create(sourceElementOrData, config);
    }
}
