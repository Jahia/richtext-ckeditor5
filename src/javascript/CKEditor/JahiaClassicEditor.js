/**
 * @license Copyright (c) 2014-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
import {DecoupledEditor} from '@ckeditor/ckeditor5-editor-decoupled';
import {isElement} from 'lodash-es';

export class JahiaClassicEditor extends DecoupledEditor {
    static create(sourceElementOrData, config = {}) {
        return new Promise(resolve => {
            const editor = new this(sourceElementOrData, config);
            resolve(editor.initPlugins()
                .then(() => editor.ui.init(isElement(sourceElementOrData) ? sourceElementOrData : null))
                .then(() => editor.data.init(editor.config.get('initialData')))
                .then(() => editor.fire('ready'))
                .then(() => editor));
        });
    }
}
