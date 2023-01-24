/**
 * @license Copyright (c) 2014-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
*/

import {Markdown} from '@ckeditor/ckeditor5-markdown-gfm';
import {JahiaClassicEditor} from '~/CKEditor/JahiaClassicEditor';

export class JahiaMarkdownEditor extends JahiaClassicEditor {
}

// Plugins to include in the build.
JahiaMarkdownEditor.builtinPlugins = [...JahiaClassicEditor.builtinPlugins, Markdown]

// Editor configuration.
JahiaMarkdownEditor.defaultConfig = {...JahiaClassicEditor.defaultConfig}
