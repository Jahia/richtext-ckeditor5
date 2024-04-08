import {Alignment} from '@ckeditor/ckeditor5-alignment';
import {Autoformat} from '@ckeditor/ckeditor5-autoformat';
import {BlockQuote} from '@ckeditor/ckeditor5-block-quote';
import {Bold, Code, Italic, Strikethrough, Underline} from '@ckeditor/ckeditor5-basic-styles';
import {CloudServices} from '@ckeditor/ckeditor5-cloud-services';
import {List, ListProperties} from '@ckeditor/ckeditor5-list';
import {Essentials} from '@ckeditor/ckeditor5-essentials';
import {FindAndReplace} from '@ckeditor/ckeditor5-find-and-replace';
import {FontBackgroundColor, FontColor, FontFamily, FontSize} from '@ckeditor/ckeditor5-font';
import {GeneralHtmlSupport} from '@ckeditor/ckeditor5-html-support';
import {Heading} from '@ckeditor/ckeditor5-heading';
import {HorizontalLine} from '@ckeditor/ckeditor5-horizontal-line';
import {Image, ImageCaption, ImageResize, ImageStyle, ImageToolbar, ImageUpload} from '@ckeditor/ckeditor5-image';
import {Indent, IndentBlock} from '@ckeditor/ckeditor5-indent';
import {Link} from '@ckeditor/ckeditor5-link';
import {Paragraph} from '@ckeditor/ckeditor5-paragraph';
import {PasteFromOffice} from '@ckeditor/ckeditor5-paste-from-office';
import {RemoveFormat} from '@ckeditor/ckeditor5-remove-format';
// Import {SourceEditing} from '@ckeditor/ckeditor5-source-editing';
import {Style} from '@ckeditor/ckeditor5-style';
import {Table, TableCellProperties, TableColumnResize, TableProperties, TableToolbar} from '@ckeditor/ckeditor5-table';
import {TextTransformation} from '@ckeditor/ckeditor5-typing';
import {Picker} from '~/CKEditor/Picker/Picker';
import {FormatPainter} from '@ckeditor/ckeditor5-format-painter';

export const plugins = [
    Alignment,
    Autoformat,
    BlockQuote,
    Bold,
    CloudServices,
    Code,
    List,
    ListProperties,
    Essentials,
    FindAndReplace,
    FontBackgroundColor,
    FontColor,
    FontFamily,
    FontSize,
    FormatPainter,
    GeneralHtmlSupport,
    Heading,
    HorizontalLine,
    Image,
    ImageCaption,
    ImageResize,
    ImageStyle,
    ImageToolbar,
    ImageUpload,
    Indent,
    IndentBlock,
    Italic,
    Link,
    Paragraph,
    PasteFromOffice,
    RemoveFormat,
    // Temporary removal, issues to be fixed in later versions
    // SourceEditing,
    Strikethrough,
    Style,
    Table,
    TableCellProperties,
    TableColumnResize,
    TableProperties,
    TableToolbar,
    TextTransformation,
    Underline,
    Picker
];
