import React from 'react';
import PropTypes from 'prop-types';
import {CardSelector, Chip, Loader} from '@jahia/moonstone';

const key = k => `JahiaContentReference:${k}`;

const addIconSuffix = icon => (icon.includes('.png') ? icon : icon + '.png');

const noop = () => {};

export const ReferenceCard = ({id, uuid, entry, view, isReadOnly, t}) => {
    const props = {id, isReadOnly, tabIndex: -1, onClick: noop};

    if (entry?.status === 'missing') {
        return (
            <CardSelector
                {...props}
                hasError
                errorMessage={`${t(key('missing'))} (${uuid})`}
                data-sel-field-picker="error"
            />
        );
    }

    if (entry?.status !== 'ok') {
        return (
            <CardSelector
                {...props}
                thumbnailType="icon"
                thumbnail={<Loader size="small"/>}
                displayName={t(key('loading'))}
                data-sel-field-picker="loading"
            />
        );
    }

    return (
        <CardSelector
            {...props}
            thumbnailType="icon"
            thumbnail={entry.icon && addIconSuffix(entry.icon)}
            displayName={entry.displayName}
            chips={entry.typeLabel && [<Chip key={entry.name} data-sel-referenceCard-type color="accent" label={entry.typeLabel}/>]}
            systemName={entry.name}
            information={`${t(key('view'))}: ${view || t(key('defaultView'))}`}
            data-sel-field-picker="filled"
        />
    );
};

ReferenceCard.propTypes = {
    id: PropTypes.string.isRequired,
    uuid: PropTypes.string.isRequired,
    entry: PropTypes.shape({
        status: PropTypes.oneOf(['loading', 'missing', 'ok']),
        displayName: PropTypes.string,
        name: PropTypes.string,
        icon: PropTypes.string,
        typeLabel: PropTypes.string
    }),
    view: PropTypes.string,
    isReadOnly: PropTypes.bool.isRequired,
    t: PropTypes.func.isRequired
};
