import { IMapEventLookup } from '../../interfaces/Imapeventlookup';

/**
 * This contstant translates the abstract map events into their corresponding google map
 * equivalents.
 * @implements {IMapEventLookup}
 */
export const GoogleMapEventsLookup: IMapEventLookup = {
    click :         'click',
    dblclick :      'dblclick',
    rightclick :    'rightclick',
    resize :        'resize',
    boundschanged : 'bounds_changed',
    centerchanged : 'center_changed',
    zoomchanged :   'zoom_changed',
    mouseover:      'mouseover',
    mouseout :      'mouseout',
    mousemove :     'mousemove'
};
