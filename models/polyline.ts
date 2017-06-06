import { ILatLong } from '../interfaces/ilatlong';
import { IPolylineOptions } from '../interfaces/ipolylineoptions';

/**
 * Abstract class defining the contract for a polyline in the architecture specific implementation.
 *
 * @export
 * @abstract
 * @class Polyline
 */
export abstract class Polyline {

    /**
     * Adds a delegate for an event.
     *
     * @abstract
     * @param {string} eventType - String containing the event name.
     * @param fn - Delegate function to execute when the event occurs.
     *
     * @memberof Polyline
     */
    public abstract AddListener(eventType: string, fn: Function): void;

    /**
     * Deleted the polyline.
     *
     * @abstract
     *
     * @memberof Polyline
     */
    public abstract Delete(): void;

    /**
     * Gets whether the polyline is draggable.
     *
     * @abstract
     * @returns {boolean} - True if the polyline is dragable, false otherwise.
     *
     * @memberof Polyline
     */
    public abstract GetDraggable(): boolean;

    /**
     * Gets whether the polyline path can be edited.
     *
     * @abstract
     * @returns {boolean} - True if the path can be edited, false otherwise.
     *
     * @memberof Polyline
     */
    public abstract GetEditable(): boolean;

    /**
     * Gets the polyline path.
     *
     * @abstract
     * @returns {Array<ILatLong>} - Array of {@link ILatLong} objects describing the polyline path.
     *
     * @memberof Polyline
     */
    public abstract GetPath(): Array<ILatLong>;

    /**
     * Gets the polyline path.
     *
     * @abstract
     * @returns {Array<Array<ILatLong>>} - Array of Array of {@link ILatLong} objects describing multiple polyline path.
     *
     * @memberof Polyline
     */
    public abstract GetPath(): Array<Array<ILatLong>>;

    /**
     * Gets whether the polyline is visible.
     *
     * @abstract
     * @returns {boolean} - True if the polyline is visible, false otherwise.
     *
     * @memberof Polyline
     */
    public abstract GetVisible(): boolean;

    /**
     * Sets whether the polyline is dragable.
     *
     * @abstract
     * @param {boolean} draggable - True to make the polyline dragable, false otherwise.
     *
     * @memberof Polyline
     */
    public abstract SetDraggable(draggable: boolean): void;

    /**
     * Sets wether the polyline path is editable.
     *
     * @abstract
     * @param {boolean} editable - True to make polyline path editable, false otherwise.
     *
     * @memberof Polyline
     */
    public abstract SetEditable(editable: boolean): void;

    /**
     * Sets the polyline options
     *
     * @abstract
     * @param {IPolylineOptions} options - {@link ILatLong} object containing the options. The options are merged with hte ones
     * already on the underlying model.
     *
     * @memberof Polyline
     */
    public abstract SetOptions(options: IPolylineOptions): void;

    /**
     * Sets the polyline path.
     *
     * @abstract
     * @param {Array<ILatLong>} path - An Array of {@link ILatLong} (or array of arrays) describing the polylines path.
     *
     * @memberof Polyline
     */
    public abstract SetPath(path: Array<ILatLong> | Array<ILatLong>): void;

    /**
     * Set the polyline path or paths.
     *
     * @abstract
     * @param {(Array<Array<ILatLong>> | Array<ILatLong>)} path An Array of {@link ILatLong}
     * (or array of arrays) describing the polylines path(s).
     *
     * @memberof Polyline
     */
    public abstract SetPath(path: Array<Array<ILatLong>> | Array<ILatLong>): void;

    /**
     * Sets whether the polyline is visible.
     *
     * @abstract
     * @param {boolean} visible - True to set the polyline visible, false otherwise.
     *
     * @memberof Polyline
     */
    public abstract SetVisible(visible: boolean): void;

}
