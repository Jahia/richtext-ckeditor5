import {ContentEditor} from '@jahia/jcontent-cypress/dist/page-object/contentEditor';
import {Field} from '@jahia/jcontent-cypress/dist/page-object/fields/field';
export class Ckeditor5 extends ContentEditor {
    getRichTextCKeditor5Field(fieldName: string): RichTextCKeditor5Field {
        return this.getField(RichTextCKeditor5Field, fieldName, false);
    }
}

export class RichTextCKeditor5Field extends Field {
    type(text: string) {
        this.get().find('.ck-editor__editable').then($myElement => {
            const ckeditorInstance = $myElement.prop('ckeditorInstance');
            ckeditorInstance.setData(text);
        });
    }
}