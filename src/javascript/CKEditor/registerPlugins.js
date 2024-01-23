import {registry} from '@jahia/ui-extender';
import {JahiaClassicEditor} from '~/CKEditor/JahiaClassicEditor';
import {JahiaBalloonEditor} from '~/CKEditor/JahiaBalloonEditor';
import {Alignment} from '@ckeditor/ckeditor5-alignment';
import {Autoformat} from '@ckeditor/ckeditor5-autoformat';
import {BlockQuote} from '@ckeditor/ckeditor5-block-quote';
import {Bold, Code, Italic, Strikethrough, Underline} from '@ckeditor/ckeditor5-basic-styles';
import {CKBox} from '@ckeditor/ckeditor5-ckbox';
import {CloudServices} from '@ckeditor/ckeditor5-cloud-services';
import {DocumentList, DocumentListProperties} from '@ckeditor/ckeditor5-list';
import {Essentials} from '@ckeditor/ckeditor5-essentials';
import {ExportPdf} from '@ckeditor/ckeditor5-export-pdf';
import {FindAndReplace} from '@ckeditor/ckeditor5-find-and-replace';
import {FontBackgroundColor, FontColor, FontFamily, FontSize} from '@ckeditor/ckeditor5-font';
import {GeneralHtmlSupport} from '@ckeditor/ckeditor5-html-support';
import {Heading} from '@ckeditor/ckeditor5-heading';
import {HorizontalLine} from '@ckeditor/ckeditor5-horizontal-line';
import {HtmlEmbed} from '@ckeditor/ckeditor5-html-embed';
import {Image, ImageCaption, ImageResize, ImageStyle, ImageToolbar, ImageUpload, PictureEditing} from '@ckeditor/ckeditor5-image';
import {Indent, IndentBlock} from '@ckeditor/ckeditor5-indent';
import {Link} from '@ckeditor/ckeditor5-link';
import {List} from '@ckeditor/ckeditor5-list';
import {MediaEmbed} from '@ckeditor/ckeditor5-media-embed';
import {Paragraph} from '@ckeditor/ckeditor5-paragraph';
import {PasteFromOffice} from '@ckeditor/ckeditor5-paste-from-office';
import {RemoveFormat} from '@ckeditor/ckeditor5-remove-format';
import {SourceEditing} from '@ckeditor/ckeditor5-source-editing';
import {SpecialCharacters, SpecialCharactersEssentials} from '@ckeditor/ckeditor5-special-characters';
import {Style} from '@ckeditor/ckeditor5-style';
import {Table, TableCellProperties, TableColumnResize, TableProperties, TableToolbar} from '@ckeditor/ckeditor5-table';
import {TextTransformation} from '@ckeditor/ckeditor5-typing';
import {Picker} from '~/CKEditor/Picker/Picker';

export const registerPlugins = () => {
    registry.addOrReplace('ckeditor-plugin', 'Alignment', {targets: ['classic'], plugin: Alignment});
    registry.addOrReplace('ckeditor-plugin', 'Autoformat', {targets: ['classic', 'balloon'], plugin: Autoformat});
    registry.addOrReplace('ckeditor-plugin', 'BlockQuote', {targets: ['classic', 'balloon'], plugin: BlockQuote});
    registry.addOrReplace('ckeditor-plugin', 'Bold', {targets: ['classic', 'balloon'], plugin: Bold});
    registry.addOrReplace('ckeditor-plugin', 'CKBox', {targets: ['balloon'], plugin: CKBox});
    registry.addOrReplace('ckeditor-plugin', 'CloudServices', {targets: ['classic', 'balloon'], plugin: CloudServices});
    registry.addOrReplace('ckeditor-plugin', 'Code', {targets: ['classic'], plugin: Code});
    registry.addOrReplace('ckeditor-plugin', 'DocumentList', {targets: ['classic'], plugin: DocumentList});
    registry.addOrReplace('ckeditor-plugin', 'DocumentListProperties', {
        targets: ['classic'],
        plugin: DocumentListProperties
    });
    registry.addOrReplace('ckeditor-plugin', 'Essentials', {targets: ['classic', 'balloon'], plugin: Essentials});
    registry.addOrReplace('ckeditor-plugin', 'ExportPdf', {targets: ['classic'], plugin: ExportPdf});
    registry.addOrReplace('ckeditor-plugin', 'FindAndReplace', {targets: ['classic'], plugin: FindAndReplace});
    registry.addOrReplace('ckeditor-plugin', 'FontBackgroundColor', {targets: ['classic'], plugin: FontBackgroundColor});
    registry.addOrReplace('ckeditor-plugin', 'FontColor', {targets: ['classic'], plugin: FontColor});
    registry.addOrReplace('ckeditor-plugin', 'FontFamily', {targets: ['classic'], plugin: FontFamily});
    registry.addOrReplace('ckeditor-plugin', 'FontSize', {targets: ['classic'], plugin: FontSize});
    registry.addOrReplace('ckeditor-plugin', 'GeneralHtmlSupport', {targets: ['classic', 'balloon'], plugin: GeneralHtmlSupport});
    registry.addOrReplace('ckeditor-plugin', 'Heading', {targets: ['classic', 'balloon'], plugin: Heading});
    registry.addOrReplace('ckeditor-plugin', 'HorizontalLine', {targets: ['classic'], plugin: HorizontalLine});
    registry.addOrReplace('ckeditor-plugin', 'HtmlEmbed', {targets: ['classic'], plugin: HtmlEmbed});
    registry.addOrReplace('ckeditor-plugin', 'Image', {targets: ['classic', 'balloon'], plugin: Image});
    registry.addOrReplace('ckeditor-plugin', 'ImageCaption', {targets: ['classic', 'balloon'], plugin: ImageCaption});
    registry.addOrReplace('ckeditor-plugin', 'ImageResize', {targets: ['classic'], plugin: ImageResize});
    registry.addOrReplace('ckeditor-plugin', 'ImageStyle', {targets: ['classic', 'balloon'], plugin: ImageStyle});
    registry.addOrReplace('ckeditor-plugin', 'ImageToolbar', {targets: ['classic', 'balloon'], plugin: ImageToolbar});
    registry.addOrReplace('ckeditor-plugin', 'ImageUpload', {targets: ['classic', 'balloon'], plugin: ImageUpload});
    registry.addOrReplace('ckeditor-plugin', 'Indent', {targets: ['classic', 'balloon'], plugin: Indent});
    registry.addOrReplace('ckeditor-plugin', 'IndentBlock', {targets: ['classic'], plugin: IndentBlock});
    registry.addOrReplace('ckeditor-plugin', 'Italic', {targets: ['classic', 'balloon'], plugin: Italic});
    registry.addOrReplace('ckeditor-plugin', 'Link', {targets: ['classic', 'balloon'], plugin: Link});
    registry.addOrReplace('ckeditor-plugin', 'List', {targets: ['balloon'], plugin: List});
    registry.addOrReplace('ckeditor-plugin', 'MediaEmbed', {targets: ['classic', 'balloon'], plugin: MediaEmbed});
    registry.addOrReplace('ckeditor-plugin', 'Paragraph', {targets: ['classic', 'balloon'], plugin: Paragraph});
    registry.addOrReplace('ckeditor-plugin', 'PasteFromOffice', {targets: ['classic', 'balloon'], plugin: PasteFromOffice});
    registry.addOrReplace('ckeditor-plugin', 'PictureEditing', {targets: ['balloon'], plugin: PictureEditing});
    registry.addOrReplace('ckeditor-plugin', 'RemoveFormat', {targets: ['classic'], plugin: RemoveFormat});
    registry.addOrReplace('ckeditor-plugin', 'SourceEditing', {targets: ['classic'], plugin: SourceEditing});
    registry.addOrReplace('ckeditor-plugin', 'SpecialCharacters', {targets: ['classic'], plugin: SpecialCharacters});
    registry.addOrReplace('ckeditor-plugin', 'SpecialCharactersEssentials', {
        targets: ['classic'],
        plugin: SpecialCharactersEssentials
    });
    registry.addOrReplace('ckeditor-plugin', 'Strikethrough', {targets: ['classic'], plugin: Strikethrough});
    registry.addOrReplace('ckeditor-plugin', 'Style', {targets: ['classic'], plugin: Style});
    registry.addOrReplace('ckeditor-plugin', 'Table', {targets: ['classic', 'balloon'], plugin: Table});
    registry.addOrReplace('ckeditor-plugin', 'TableCellProperties', {targets: ['classic'], plugin: TableCellProperties});
    registry.addOrReplace('ckeditor-plugin', 'TableColumnResize', {targets: ['classic'], plugin: TableColumnResize});
    registry.addOrReplace('ckeditor-plugin', 'TableProperties', {targets: ['classic'], plugin: TableProperties});
    registry.addOrReplace('ckeditor-plugin', 'TableToolbar', {targets: ['classic', 'balloon'], plugin: TableToolbar});
    registry.addOrReplace('ckeditor-plugin', 'TextTransformation', {targets: ['classic', 'balloon'], plugin: TextTransformation});
    registry.addOrReplace('ckeditor-plugin', 'Underline', {targets: ['classic'], plugin: Underline});
    registry.addOrReplace('ckeditor-plugin', 'Picker', {targets: ['classic'], plugin: Picker});

    JahiaClassicEditor.builtinPlugins = registry.find({type: 'ckeditor-plugin', target: 'classic'}).map(m => m.plugin);
    JahiaBalloonEditor.builtinPlugins = registry.find({type: 'ckeditor-plugin', target: 'balloon'}).map(m => m.plugin);
};
