import { ILatLong } from '../interfaces/ilatlong';
import { IPolygonOptions } from '../interfaces/ipolygonoptions';

/**
 * Abstract class defining the contract for a polygon in the architecture specific implementation.
 *
 * @export
 * @abstract
 * @class Polygon
 */
export abstract class Polygon {

    /**
     * Adds a delegate for an event.
     *
     * @abstract
     * @param {string} eventType - String containing the event name.
     * @param fn - Delegate function to execute when the event occurs.
     * @memberof Polygon
     */
    public abstract AddListener(eventType: string, fn: Function): void;

    /**
     * Deleted the polygon.
     *
     * @abstract
     *
     * @memberof Polygon
     */
    public abstract Delete(): void;

    /**
     * Gets whether the polygon is draggable.
     *
     * @abstract
     * @returns {boolean} - True if the polygon is dragable, false otherwise.
     *
     * @memberof Polygon
     */
    public abstract GetDraggable(): boolean;

    /**
     * Gets whether the polygon path can be edited.
     *
     * @abstract
     * @returns {boolean} - True if the path can be edited, false otherwise.
     *
     * @memberof Polygon
     */
    public abstract GetEditable(): boolean;

    /**
     * Gets the polygon path.
     *
     * @abstract
     * @returns {Array<ILatLong>} - Array of {@link ILatLong} objects describing the polygon path.
     *
     * @memberof Polygon
     */
    public abstract GetPath(): Array<ILatLong>;

    /**
     * Gets the polygon paths.
     *
     * @abstract
     * @returns {Array<Array<ILatLong>>} - Array of Array of {@link ILatLong} objects describing multiple polygon paths.
     *
     * @memberof Polygon
     */
    public abstract GetPaths(): Array<Array<ILatLong>>;

    /**
     * Gets whether the polygon is visible.
     *
     * @abstract
     * @returns {boolean} - True if the polygon is visible, false otherwise.
     *
     * @memberof Polygon
     */
    public abstract GetVisible(): boolean;

    /**
     * Sets whether the polygon is dragable.
     *
     * @abstract
     * @param {boolean} draggable - True to make the polygon dragable, false otherwise.
     *
     * @memberof Polygon
     */
    public abstract SetDraggable(draggable: boolean): void;

    /**
     * Sets wether the polygon path is editable.
     *
     * @abstract
     * @param {boolean} editable - True to make polygon path editable, false otherwise.
     *
     * @memberof Polygon
     */
    public abstract SetEditable(editable: boolean): void;

    /**
     * Sets the polygon options
     *
     * @abstract
     * @param {IPolygonOptions} options - {@link ILatLong} object containing the options. The options are merged with hte ones
     * already on the underlying model.
     *
     * @memberof Polygon
     */
    public abstract SetOptions(options: IPolygonOptions): void;

    /**
     * Sets the polygon path.
     *
     * @abstract
     * @param {Array<ILatLong>} path - An Array of {@link ILatLong} (or array of arrays) describing the polygons path.
     *
     * @memberof Polygon
     */
    public abstract SetPath(path: Array<ILatLong> | Array<ILatLong>): void;

    /**
     * Set the polygon path or paths.
     *
     * @abstract
     * @param {(Array<Array<ILatLong>> | Array<ILatLong>)} paths An Array of {@link ILatLong}
     * (or array of arrays) describing the polygons path(s).
     *
     * @memberof Polygon
     */
    public abstract SetPaths(paths: Array<Array<ILatLong>> | Array<ILatLong>): void;

    /**
     * Sets whether the polygon is visible.
     *
     * @abstract
     * @param {boolean} visible - True to set the polygon visible, false otherwise.
     *
     * @memberof Polygon
     */
    public abstract SetVisible(visible: boolean): void;

}