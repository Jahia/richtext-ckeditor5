import {ImageResizeEditing, ImageStyleEditing, Plugin, Image, DataFilter} from 'ckeditor5';

/**
 * Embeds the styles for the resized image.
 */
export class ImageResizeStyler extends Plugin {
    static get requires() {
        return [Image, DataFilter, ImageResizeEditing, ImageStyleEditing];
    }

    static get pluginName() {
        return 'ImageResizeStyler';
    }

    init() {
        const editor = this.editor;
        this.dataFilter = editor.plugins.get(DataFilter);

        // Parse any embedded float and width styling from a given element and convert it to ck5 model
        // We do this for block <figure> and inline <img> elements
        editor.conversion.for('upcast').add(dispatcher => {
            dispatcher.on('element:figure', upcastFloat.bind(this));
            dispatcher.on('element:img', upcastFloat.bind(this), {priority: 'low'});
            dispatcher.on('element:img', upcastWidth.bind(this), {priority: 'low'});
        });

        // Function handlers to embed styling when changed in the model
        editor.conversion.for('downcast').add(dispatcher => {
            dispatcher.on('attribute:resizedWidth', setResizeStyles);
            dispatcher.on('attribute:imageStyle', setAlignmentStyles);
        });
    }
}

function upcastFloat(evt, data, conversionApi) {
    const viewImage = data.viewItem;
    const float = viewImage.getStyle('float');

    if (!float || !conversionApi.consumable.consume(viewImage, {style: 'float'})) {
        return;
    }

    const modelElement = data.modelRange?.start.nodeAfter;
    if (modelElement && conversionApi.schema.checkAttribute(modelElement, 'imageStyle')) {
        this.dataFilter.processViewAttributes(viewImage, conversionApi);
        // Set the imageStyle attribute based on the float value
        const styleValues = {left: 'alignLeft', right: 'alignRight'};
        if (styleValues[float]) {
            conversionApi.writer.setAttribute('imageStyle', styleValues[float], modelElement);
        }
    }
}

function upcastWidth(evt, data, conversionApi) {
    const viewImage = data.viewItem;
    const width = viewImage.getStyle('width');

    if (!width || !conversionApi.consumable.consume(viewImage, {style: 'width'})) {
        return;
    }

    const modelElement = data.modelRange?.start.nodeAfter;
    if (modelElement && conversionApi.schema.checkAttribute(modelElement, 'resizedWidth')) {
        this.dataFilter.processViewAttributes(viewImage, conversionApi);
        conversionApi.writer.setAttribute('resizedHeight', 'auto', modelElement);
        conversionApi.writer.setAttribute('resizedWidth', width, modelElement);
    }
}

function setResizeStyles(evt, data, conversionApi) {
    const {viewImage, hasContainer} = getViewImage(data, conversionApi);
    if (!viewImage) {
        return;
    }

    if (data.attributeNewValue) {
        // Image has been resized; embed styling
        console.debug(`Applying width style '${data.attributeNewValue}' for ${viewImage.name}`);
        conversionApi.writer.setStyle('height', 'auto', viewImage);
        if (hasContainer && !viewImage.getStyle('width')) {
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

function setAlignmentStyles(evt, data, conversionApi) {
    const viewImage = conversionApi.mapper.toViewElement(data.item);
    if (!viewImage) {
        return;
    }

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

function getViewImage(data, conversionApi) {
    let viewImage = conversionApi.mapper.toViewElement(data.item);
    if (!viewImage) {
        return null;
    }

    // ViewImage can sometimes be a container element and not the img element (in the case of imageBlock),
    // so we need to find the img element within this container
    let hasContainer = !viewImage.is('element', 'img');
    let viewContainer = null;
    if (hasContainer) {
        viewContainer = viewImage;
        viewImage = [...viewImage.getChildren()].find(c => c.is('element', 'img'));
    }

    return {viewImage, viewContainer, hasContainer};
}
