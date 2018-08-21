/**
 * Defines the contract used to translate abstract map events into the corresponding events of the underlying
 * concrete implementation.
 */
export interface IMapEventLookup {
    click: string;
    dblclick: string;
    rightclick: string;
    resize: string;
    boundschanged: string;
    centerchanged: string;
    zoomchanged: string;
    mouseover: string;
    mouseout: string;
    mousemove: string;
    [key: string]: string;
}
