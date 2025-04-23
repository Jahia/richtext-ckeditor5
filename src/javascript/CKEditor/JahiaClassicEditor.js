/**
 * @license Copyright (c) 2014-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
import {ClassicEditor} from 'ckeditor5';
import {isElement} from 'lodash-es';

import 'ckeditor5/ckeditor5.css';
import {isProductivityMode} from "../RichTextCKEditor5/RichTextCKEditor5.utils";

const productivityPluginsNameAndKey = {
    FormatPainter: true,
    formatPainter: true,
    ExportPdf: true,
    exportPdf: true,
    ExportWord: true,
    exportWord: true
};

export class JahiaClassicEditor extends ClassicEditor {
    static create(sourceElementOrData, config = {}) {
        config = {...JahiaClassicEditor.defaultConfig, ...config};

        // eslint-disable-next-line
        const isProductivityEnabled = isProductivityMode();
        // eslint-disable-next-line
        config.licenseKey = isProductivityEnabled ? window.CKEDITOR_PRODUCTIVITY_LICENSE : 'GPL';

        if (!isProductivityEnabled) {
            JahiaClassicEditor.builtinPlugins = JahiaClassicEditor.builtinPlugins.filter(p => !productivityPluginsNameAndKey[p.pluginName]);
            config.toolbar.items = config.toolbar.items.filter(i => !productivityPluginsNameAndKey[i]);
        }

        const editor = new this(sourceElementOrData, config);
        return editor.initPlugins().then(() => {
            editor.ui.init(isElement(sourceElementOrData) ? sourceElementOrData : null);
            editor.data.init(editor.config.get('initialData'));
            editor.fire('ready');
            return editor;
        });
    }
}
