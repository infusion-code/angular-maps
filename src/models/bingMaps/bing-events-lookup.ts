import { IMapEventLookup } from '../../interfaces/Imapeventlookup';

/**
 * This contstant translates the abstract map events into their corresponding bing map
 * equivalents.
 * @implements {IMapEventLookup}
 */
export const BingMapEventsLookup: IMapEventLookup = {
    click :         'click',
    dblclick :      'dblclick',
    rightclick :    'rightclick',
    resize :        'resize',
    boundschanged : 'viewchangeend',
    centerchanged : 'viewchangeend',
    zoomchanged :   'viewchangeend',
    mouseover:      'mouseover',
    mouseout :      'mouseout',
    mousemove :     'mousemove'
};
