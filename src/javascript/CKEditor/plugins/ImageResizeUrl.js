import {Image, ImageResizeEditing, Plugin} from 'ckeditor5';

const URL_PATTERN = /^([^?#]*)(?:\?([^#]*))?(#.*)?$/s;
const IMAGE_TYPES = ['imageBlock', 'imageInline'];

/**
 * Adds the resized width of Jahia images to their URL (w parameter) in the saved data.
 */
export class ImageResizeUrl extends Plugin {
    static get requires() {
        return [Image, ImageResizeEditing];
    }

    static get pluginName() {
        return 'ImageResizeUrl';
    }

    init() {
        const editor = this.editor;
        const contextPath = (window.contextJsParameters && window.contextJsParameters.contextPath) || '';
        this.filesPrefix = `${contextPath}/files/`;
        this.imageUtils = editor.plugins.get('ImageUtils');
        this.fileWidths = new Map();

        // The fileWidth attribute holds the width of the file when it caps the resized width, so the data depends on the model only
        IMAGE_TYPES.forEach(imageType => editor.model.schema.extend(imageType, {allowAttributes: 'fileWidth'}));
        editor.model.document.registerPostFixer(writer => this.fixChangedFileWidths(writer));

        // The model width can come from the HTML width attribute, so the file is loaded to read its width before a resize
        editor.conversion.for('editingDowncast').add(dispatcher => {
            IMAGE_TYPES.forEach(imageType => {
                dispatcher.on(`attribute:src:${imageType}`, (evt, data) => this.loadFileWidth(data.attributeNewValue));
            });
        });

        // Restore the original URL and natural size in the model, once the resized width is converted
        editor.conversion.for('upcast').add(dispatcher => {
            dispatcher.on('element:img', upcastResizedImage.bind(this), {priority: 'lowest'});
            dispatcher.on('element:figure', upcastResizedImage.bind(this), {priority: 'lowest'});
        });

        // Reapplied after each attribute converter, as the src, srcset, width, height and GHS ones overwrite the img attributes.
        // The GHS converter has the low priority, so this one has the lowest.
        editor.conversion.for('dataDowncast').add(dispatcher => {
            IMAGE_TYPES.forEach(imageType => {
                ['src', 'srcset', 'width', 'height', 'resizedWidth', 'htmlImgAttributes'].forEach(attribute => {
                    dispatcher.on(`attribute:${attribute}:${imageType}`, downcastResizedImage.bind(this), {priority: 'lowest'});
                });
            });
        });
    }

    isJahiaFile(src) {
        return Boolean(src) && src.startsWith(this.filesPrefix);
    }

    // 0 or undefined until the file is loaded
    getFileWidth(src) {
        return this.fileWidths.get(setWidthParam(src, null));
    }

    loadFileWidth(src) {
        const fileUrl = this.isJahiaFile(src) && setWidthParam(src, null);
        if (!fileUrl || this.fileWidths.has(fileUrl)) {
            return;
        }

        this.fileWidths.set(fileUrl, 0);
        // Image is the CKEditor plugin in this module, not the DOM image
        const img = new window.Image();
        img.addEventListener('load', () => {
            this.fileWidths.set(fileUrl, img.naturalWidth);
            this.fixLoadedFileWidths(fileUrl);
        }, {once: true});
        img.src = fileUrl;
    }

    // The contributor did not make this change, so undo skips it
    fixLoadedFileWidths(fileUrl) {
        const model = this.editor.model;
        if (this.editor.state === 'destroyed') {
            return;
        }

        model.enqueueChange({isUndoable: false}, writer => {
            for (const root of model.document.getRoots()) {
                for (const item of model.createRangeIn(root).getItems()) {
                    if (this.imageUtils.isImage(item) && this.isJahiaFile(item.getAttribute('src')) && setWidthParam(item.getAttribute('src'), null) === fileUrl) {
                        this.fixFileWidth(writer, item);
                    }
                }
            }
        });
    }

    fixChangedFileWidths(writer) {
        const model = this.editor.model;
        let changed = false;
        for (const change of model.document.differ.getChanges()) {
            if (change.type === 'insert' && change.name !== '$text') {
                const range = model.createRange(change.position, change.position.getShiftedBy(change.length));
                for (const item of range.getItems()) {
                    changed = (this.imageUtils.isImage(item) && this.fixFileWidth(writer, item)) || changed;
                }
            } else if (change.type === 'attribute' && ['src', 'resizedWidth'].includes(change.attributeKey)) {
                const item = change.range.start.nodeAfter;
                changed = (this.imageUtils.isImage(item) && this.fixFileWidth(writer, item)) || changed;
            }
        }

        return changed;
    }

    fixFileWidth(writer, image) {
        const src = image.getAttribute('src');
        const resizedWidth = getPxValue(image.getAttribute('resizedWidth'));
        const fileWidth = this.isJahiaFile(src) ? this.getFileWidth(src) : 0;
        const cap = fileWidth > 0 && resizedWidth > fileWidth ? fileWidth : undefined;
        if (image.getAttribute('fileWidth') === cap) {
            return false;
        }

        if (cap) {
            writer.setAttribute('fileWidth', cap, image);
        } else {
            writer.removeAttribute('fileWidth', image);
        }

        return true;
    }
}

function upcastResizedImage(evt, data, conversionApi) {
    const modelElement = data.modelRange?.start.nodeAfter;
    if (!modelElement || !this.imageUtils.isImage(modelElement)) {
        return;
    }

    // The resized width of a block image comes from its figure, which is converted after its img
    const viewImage = this.imageUtils.findViewImgElement(data.viewItem);
    if (viewImage === data.viewItem && this.imageUtils.isBlockImage(modelElement) && viewImage.findAncestor(this.imageUtils.isBlockImageView)) {
        return;
    }

    const src = modelElement.getAttribute('src');
    if (!this.isJahiaFile(src) || !getPxValue(modelElement.getAttribute('resizedWidth'))) {
        return;
    }

    const hasWidth = hasWidthParam(src);
    if (hasWidth) {
        conversionApi.writer.setAttribute('src', setWidthParam(src, null), modelElement);
    }

    // The aspect-ratio style holds the natural size when the plugin wrote w, or when it matches the width and height attributes
    const [width, height] = (viewImage.getStyle('aspect-ratio') || '').split('/').map(value => value.trim());
    const isNaturalSize = hasWidth || (viewImage.getAttribute('width') === width && viewImage.getAttribute('height') === height);
    if (isNaturalSize && viewImage.hasAttribute('width') && viewImage.hasAttribute('height') && Number(width) > 0 && Number(height) > 0) {
        conversionApi.writer.setAttribute('width', width, modelElement);
        conversionApi.writer.setAttribute('height', height, modelElement);
    }
}

function downcastResizedImage(evt, data, conversionApi) {
    const modelElement = data.item;
    const src = modelElement.getAttribute('src');
    const resizedWidth = getPxValue(modelElement.getAttribute('resizedWidth'));
    const viewElement = conversionApi.mapper.toViewElement(modelElement);
    if (!resizedWidth || !this.isJahiaFile(src) || !viewElement) {
        return;
    }

    const viewImage = this.imageUtils.findViewImgElement(viewElement);
    const width = Math.round(resizedWidth);
    const naturalWidth = Number(modelElement.getAttribute('width'));
    const naturalHeight = Number(modelElement.getAttribute('height'));
    const fileWidth = modelElement.getAttribute('fileWidth');

    // A w above the width of the file would make a URL-based resizer enlarge the image
    conversionApi.writer.setAttribute('src', setWidthParam(src, fileWidth > 0 ? Math.min(width, fileWidth) : width), viewImage);

    // The browser loads a srcset candidate instead of the src, so the srcset would hide the sized src
    conversionApi.writer.removeAttribute('srcset', viewImage);
    conversionApi.writer.removeAttribute('sizes', viewImage);

    // The width and height attributes give the displayed size, the aspect-ratio style keeps the natural one
    if (naturalWidth > 0 && naturalHeight > 0) {
        conversionApi.writer.setAttribute('width', width, viewImage);
        conversionApi.writer.setAttribute('height', Math.round(width * naturalHeight / naturalWidth), viewImage);
    }
}

function getPxValue(size) {
    return size && size.endsWith('px') ? parseFloat(size) : null;
}

function isWidthParam(param) {
    return param.split('=')[0] === 'w';
}

function hasWidthParam(src) {
    const [, , query = ''] = URL_PATTERN.exec(src);
    return query.split('&').some(isWidthParam);
}

// The w parameter always goes last: the upcast removes it from the model src, so replacing it in place would not round-trip
function setWidthParam(src, width) {
    const [, path, query = '', fragment = ''] = URL_PATTERN.exec(src);
    const params = query.split('&').filter(param => param && !isWidthParam(param));
    if (width) {
        params.push(`w=${width}`);
    }

    return path + (params.length > 0 ? `?${params.join('&')}` : '') + fragment;
}
