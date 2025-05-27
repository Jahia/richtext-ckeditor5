import {ImageResizeEditing, Plugin} from 'ckeditor5';

/**
 * Embeds the styles for the resized image.
 */
export class ImageResizeStyler extends Plugin {
    static get requires() {
        return [ ImageResizeEditing ];
    }

    static get pluginName() {
        return 'ImageResizeStyler';
    }

    init() {
        const editor = this.editor;

        editor.conversion.for('downcast').add((dispatcher) => {
            dispatcher.on('attribute:resizedWidth:imageBlock', setStyles);
            dispatcher.on('attribute:resizedWidth:imageInline', setStyles);
        });

        function setStyles(evt, data, conversionApi) {
            let viewImage = conversionApi.mapper.toViewElement(data.item);
            if (!viewImage) {
                return;
            }

            // viewImage can sometimes be a container element and not the img element (in the case of imageBlock),
            // so we need to find the img element within this container
            let hasContainer = !viewImage.is('element', 'img');
            if (hasContainer) {
                viewImage = [...viewImage.getChildren()].find(c => c.is('element', 'img'));
                if (!viewImage) {
                    return;
                }
            }

            if (data.attributeNewValue) {
                // Image has been resized; embed styling
                conversionApi.writer.setStyle('height', 'auto', viewImage);
                if (hasContainer && !viewImage.getStyle('width')) {
                    conversionApi.writer.setStyle('width', data.attributeNewValue, viewImage);
                }
            } else {
                // Image has been restored to original values; remove styling
                conversionApi.writer.removeStyle('height', viewImage);
                if (hasContainer && viewImage.getStyle('width') === data.attributeOldValue) {
                    conversionApi.writer.removeStyle('width',viewImage);
                }
            }
        }
    }
}
