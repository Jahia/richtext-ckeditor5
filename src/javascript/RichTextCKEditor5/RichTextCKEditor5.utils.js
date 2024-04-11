// Copy from Picker.utils.js

import ParseInt from "lodash-es/parseInt";

export const set = (target, path, value) => {
    const splitRes = path.split('.');
    const regex = /(\[\d+])$/;

    let key;
    let position;
    let match;
    let current = target;
    while ((splitRes.length > 1) && (key = splitRes.shift())) {
        // case items[0].key = 'something'
        match = regex.exec(key);

        if (match) {
            key = key.replace(match[0], '');
            position = ParseInt(match[0].replace(/[\[\]]/g, ''));
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

    // case items[0] = 'something'
    match = regex.exec(key);

    if (match) {
        key = key.replace(match[0], '');
        position = ParseInt(match[0].replace(/[\[\]]/g, ''));

        if (!current[key]) {
            current[key] = [];
        }

        current[key][position] = value;
    } else {
        current[key] = value;
    }
};

export const isObject = item => {
    return (item && typeof item === 'object' && !Array.isArray(item));
};

export const mergeDeep = (target, ...sources) => {
    if (!sources.length) {
        return target;
    }

    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) {
                    Object.assign(target, {[key]: {}});
                }

                mergeDeep(target[key], source[key]);
            } else {
                Object.assign(target, {[key]: source[key]});
            }
        }
    }

    return mergeDeep(target, ...sources);
};

export const arrayValue = value => {
    return (typeof value === 'string') ? value.split(',') : value;
};

export const booleanValue = v => typeof v === 'string' ? v === 'true' : Boolean(v);

export const toArray = value => (Array.isArray(value) ? value : [value]);
