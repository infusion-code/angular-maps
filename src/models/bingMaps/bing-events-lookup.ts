import { IMapEventLookup } from '../../interfaces/Imapeventlookup';

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
