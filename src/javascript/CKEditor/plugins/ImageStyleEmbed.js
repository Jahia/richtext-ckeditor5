import {ImageResizeEditing, ImageStyleEditing, Plugin, Image} from 'ckeditor5';

/**
 * Embeds the styles for the resized image.
 */
export class ImageStyleEmbed extends Plugin {
    static get requires() {
        return [Image, ImageResizeEditing, ImageStyleEditing];
    }

    static get pluginName() {
        return 'ImageStyleEmbed';
    }

    init() {
        const editor = this.editor;
        this.imageUtils = editor.plugins.get('ImageUtils');

        // Parse any embedded float and width styling from a given element and convert it to ck5 model
        // We do this for block <figure> and inline <img> elements
        // Only the styles written back by the downcast are consumed: the other attributes go to the image and GHS converters
        editor.conversion.for('upcast').add(dispatcher => {
            dispatcher.on('element:figure', upcastFloat);
            dispatcher.on('element:figure', upcastAlignCenter);
            dispatcher.on('element:img', upcastFloat, {priority: 'low'});
            // Before the image resize converters, which would read the embedded height as a resized height
            dispatcher.on('element:img', upcastWidth);
        });

        // Function handlers to embed styling when changed in the model
        editor.conversion.for('downcast').add(dispatcher => {
            dispatcher.on('attribute:resizedWidth', setResizeStyles.bind(this));
            dispatcher.on('attribute:imageStyle', setFloatStyles);
            dispatcher.on('attribute:imageStyle', setAlignStyles);
        });
    }
}

function upcastAlignCenter(evt, data, conversionApi) {
    const viewFigure = data.viewItem;
    const modelElement = data.modelRange?.start.nodeAfter;
    if (viewFigure.getStyle('text-align') !== 'center' || !modelElement || !conversionApi.schema.checkAttribute(modelElement, 'imageStyle')) {
        return;
    }

    // The margin is written back with the alignment
    const styles = viewFigure.getStyle('margin') === 'auto' ? ['text-align', 'margin'] : ['text-align'];
    if (conversionApi.consumable.consume(viewFigure, {styles})) {
        conversionApi.writer.setAttribute('imageStyle', 'alignCenter', modelElement);
    }
}

function upcastFloat(evt, data, conversionApi) {
    const viewElement = data.viewItem;
    const imageStyle = {left: 'alignLeft', right: 'alignRight'}[viewElement.getStyle('float')];
    const modelElement = data.modelRange?.start.nodeAfter;
    if (!imageStyle || !modelElement || !conversionApi.schema.checkAttribute(modelElement, 'imageStyle')) {
        return;
    }

    if (conversionApi.consumable.consume(viewElement, {styles: ['float']})) {
        conversionApi.writer.setAttribute('imageStyle', imageStyle, modelElement);
    }
}

function upcastWidth(evt, data, conversionApi) {
    const viewImage = data.viewItem;
    const width = viewImage.getStyle('width');
    const modelElement = data.modelRange?.start.nodeAfter;
    if (!width || !modelElement || !conversionApi.schema.checkAttribute(modelElement, 'resizedWidth')) {
        return;
    }

    // The height is written back as auto
    const styles = viewImage.hasStyle('height') ? ['width', 'height'] : ['width'];
    if (conversionApi.consumable.consume(viewImage, {styles})) {
        conversionApi.writer.setAttribute('resizedWidth', width, modelElement);
    }
}

function setResizeStyles(evt, data, conversionApi) {
    const {viewImage, hasContainer} = getViewImage(data, conversionApi, this.imageUtils);
    if (!viewImage) {
        return;
    }

    if (data.attributeNewValue) {
        // Image has been resized; embed styling
        console.debug(`Applying width style '${data.attributeNewValue}' for ${viewImage.name}`);
        conversionApi.writer.setStyle('height', 'auto', viewImage);
        if (hasContainer) {
            conversionApi.writer.setStyle('width', data.attributeNewValue, viewImage);
        }
    } else {
        // Image has been restored to original values; remove styling
        conversionApi.writer.removeStyle('height', viewImage);
        if (hasContainer && viewImage.getStyle('width') === data.attributeOldValue) {
            conversionApi.writer.removeStyle('width', viewImage);
        }
    }
}

function setFloatStyles(evt, data, conversionApi) {
    const viewImage = conversionApi.mapper.toViewElement(data.item);
    if (!viewImage) {
        return;
    }

    console.debug(`Removing float style for ${viewImage.name}`);
    conversionApi.writer.setStyle('float', null, viewImage);
    conversionApi.writer.removeStyle('float', viewImage);

    if (data.attributeNewValue) {
        const floatStyles = Object.freeze({
            alignLeft: 'left',
            alignRight: 'right'
        });
        const floatDir = floatStyles[data.attributeNewValue];
        if (floatDir) {
            console.debug(`Applying alignment style 'float:${floatDir}' for ${viewImage.name}`);
            conversionApi.writer.setStyle('float', floatDir, viewImage);
        }
    }
}

function setAlignStyles(evt, data, conversionApi) {
    const viewImage = conversionApi.mapper.toViewElement(data.item);
    if (!viewImage) {
        return;
    }

    console.debug(`Removing alignment style 'text-align:center' for ${viewImage.name}`);
    conversionApi.writer.setStyle('text-align', null, viewImage);
    conversionApi.writer.removeStyle('text-align', viewImage);
    if (viewImage.getStyle('margin') === 'auto') {
        conversionApi.writer.removeStyle('margin', viewImage);
    }

    if (data.attributeNewValue === 'alignCenter') {
        console.debug(`Applying alignment style 'text-align:center' for ${viewImage.name}`);
        conversionApi.writer.setStyle('text-align', 'center', viewImage);
        conversionApi.writer.setStyle('margin', 'auto', viewImage);
    }
}

function getViewImage(data, conversionApi, imageUtils) {
    const viewElement = conversionApi.mapper.toViewElement(data.item);
    if (!viewElement) {
        return {};
    }

    // ViewElement can sometimes be a container element and not the img element (in the case of imageBlock),
    // so we need to find the img element within this container, possibly inside a link
    const viewImage = imageUtils.findViewImgElement(viewElement);
    return {viewImage, hasContainer: viewImage !== viewElement};
}
