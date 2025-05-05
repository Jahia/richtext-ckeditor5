// Copy from Picker.utils.js

export const set = (target, path, value) => {
    const splitRes = path.split('.');
    const regex = /(\[\d+])$/;

    let key;
    let position;
    let match;
    let current = target;
    while ((splitRes.length > 1) && (key = splitRes.shift())) {
        // Case items[0].key = 'something'
        match = regex.exec(key);

        if (match) {
            key = key.replace(match[0], '');
            position = parseInt(match[0].replace(/[[\]]/g, ''), 10);
        }

        if (!current[key]) {
            if (match) {
                current[key] = [];
            } else {
                current[key] = {};
            }
        }

        if (Array.isArray(current[key])) {
            if (!current[key][position]) {
                current[key][position] = {};
            }

            current = current[key][position];
            match = null;
            position = null;
        } else {
            current = current[key];
        }
    }

    key = splitRes.shift();

    // Case items[0] = 'something'
    match = regex.exec(key);

    if (match) {
        key = key.replace(match[0], '');
        position = parseInt(match[0].replace(/[[\]]/g, ''), 10);

        if (!current[key]) {
            current[key] = [];
        }

        current[key][position] = value;
    } else {
        current[key] = value;
    }
};

export const isProductivityMode = () => {
    /**
     * CKEDITOR_PRODUCTIVITY_LICENSE is inserted as a literal string by webpack using define plugin.
     * We cannot use it directly in the return boolean logic code because it is optimized out by webpack before the insertion.
     * As workaround we call toString() function so that it is not optimized out.
     */
    // eslint-disable-next-line no-undef
    return window?.contextJsParameters?.valid && Boolean(CKEDITOR_PRODUCTIVITY_LICENSE?.toString());
};

/**
 * This is meant to be called from init() of a plugin. Documented way of loading translations via 'static get tranlsation()' does not work.
 *
 *
 * @param editor
 * @param ts
 */
export const loadTranslations = (editor, ts) => {
    for (const [key, value] of Object.entries(ts)) {
        if (editor.locale.translations[key]) {
            editor.locale.translations[key].dictionary = {...editor.locale.translations[key].dictionary, ...value};
        } else {
            editor.locale.translations[key] = {dictionary: value};
        }
    }
};
