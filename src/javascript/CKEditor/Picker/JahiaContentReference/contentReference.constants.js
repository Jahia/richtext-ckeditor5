export const MODEL_ELEMENT = 'jahiaContentReference';
export const UUID_ATTRIBUTE = 'jahiaRefUuid';
export const VIEW_ATTRIBUTE = 'jahiaRefView';

export const MARKER_CLASS = 'jahia-content-reference';
export const CARD_CLASS = 'jahia-content-reference-card';
export const DATA_REF = 'data-jahia-ref';
export const DATA_VIEW = 'data-jahia-view';

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
export const VIEW_RE = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$/;
export const DEFAULT_VIEW = 'default';

export const REFUSED_TYPES = ['jnt:page', 'jnt:contentFolder', 'jnt:folder', 'jnt:virtualsite', 'jnt:contentList'];

export const isValidUuid = uuid => typeof uuid === 'string' && UUID_RE.test(uuid);

export const isValidView = view => typeof view === 'string' && view !== DEFAULT_VIEW && VIEW_RE.test(view);
