import { Injectable } from '@angular/core';

/**
 * Abstract implementation. USed for defintion only and as a base to implement your
 * own provider.
 *
 * @export
 * @abstract
 * @class MapAPILoader
 */
@Injectable()
export abstract class MapAPILoader {

    /**
     * Loads the necessary resources for a given map architecture.
     *
     * @abstract
     * @returns {Promise<void>} - Promise fullfilled when the resources have been loaded.
     *
     * @memberof MapAPILoader
     */
    abstract Load(): Promise<void>;

}

/**
 * Document Reference service to assist with abstracting the availability of document. Needed for AOT and
 * Server Side rendering
 *
 * @export
 * @class DocumentRef
 */
@Injectable()
export class DocumentRef {

    /**
     * Gets whether a document implementation is available. Generally will be true in the browser and false otherwise, unless there
     * there is a browser-less implementation in the current non-browser environment.
     *
     * @readonly
     * @type {boolean}
     * @memberof DocumentRef
     */
    public get IsAvailable(): boolean {
        return !(typeof (document) === 'undefined');
    }

    /**
     * Returns the document object of the current environment.
     *
     * @returns {*} - The document object.
     *
     * @memberof DocumentRef
     */
    public GetNativeDocument(): any {
        if (typeof (document) === 'undefined') {
            return null;
        }
        return document;
    }
}

/**
 * Window Reference service to assist with abstracting the availability of window. Needed for AOT and
 * Server Side rendering
 *
 * @export
 * @class WindowRef
 */
@Injectable()
export class WindowRef {

    /**
     * Gets whether a window implementation is available. Generally will be true in the browser and false otherwise, unless there
     * there is a browser-less implementation in the current non-browser environment.
     *
     * @readonly
     * @type {boolean}
     * @memberof WindowRef
     */
    public get IsAvailable(): boolean {
        return !(typeof (window) === 'undefined');
    }

    /**
     * Returns the window object of the current environment.
     *
     * @returns {*} - The window object.
     *
     * @memberof WindowRef
     */
    public GetNativeWindow(): any {
        if (typeof (window) === 'undefined') {
            return null;
        }
        return window;
    }
}

