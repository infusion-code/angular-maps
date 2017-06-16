import { IMapEventLookup } from '../../interfaces/Imapeventlookup';

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
