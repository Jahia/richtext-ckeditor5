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

// eslint-disable-next-line no-undef
export const isProductivityMode = () => window?.contextJsParameters?.valid && Boolean(CKEDITOR_PRODUCTIVITY_LICENSE);
