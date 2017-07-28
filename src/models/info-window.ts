import { ILatLong } from '../interfaces/ilatlong';
import { IInfoWindowOptions } from '../interfaces/iinfo-window-options';

export abstract class InfoWindow {

    /**
     * Gets whether the info box is currently open.
     *
     * @readonly
     * @abstract
     * @type {boolean}
     * @memberof InfoWindow
     */
    public abstract get IsOpen(): boolean;

    /**
     * Get the underlying native primitive of the implementation.
     *
     * @readonly
     * @abstract
     * @type {*}
     * @memberof InfoWindow
     */
    public abstract get NativePrimitve(): any;

    /**
     * Adds an event listener to the info window.
     *
     * @abstract
     * @param {string} eventType - String containing the event for which to register the listener (e.g. "click")
     * @param {Function} fn - Delegate invoked when the event occurs.
     *
     * @memberof InfoWindow
     */
    public abstract AddListener(eventType: string, fn: Function): void;

    /**
     * Closes the info window.
     *
     * @abstract
     *
     * @memberof InfoWindow
     */
    public abstract Close(): void ;

    /**
     * Gets the position of the info window.
     *
     * @abstract
     * @returns {ILatLong} - Returns the geo coordinates of the info window.
     *
     * @memberof InfoWindow
     */
    public abstract GetPosition(): ILatLong;

    /**
     * Opens the info window.
     *
     * @abstract
     *
     * @memberof InfoWindow
     */
    public abstract Open(): void;

    /**
     * Sets the info window options.
     *
     * @abstract
     * @param {IInfoWindowOptions} options - Info window options to set. The options will be merged with any existing options.
     *
     * @memberof InfoWindow
     */
    public abstract SetOptions(options: IInfoWindowOptions): void;

    /**
     * Sets the info window position.
     *
     * @abstract
     * @param {ILatLong} position - Geo coordinates to move the anchor of the info window to.
     *
     * @memberof InfoWindow
     */
    public abstract SetPosition(position: ILatLong): void;
}
