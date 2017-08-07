import { ILatLong } from '../interfaces/ilatlong';
import { IPolygonOptions } from '../interfaces/ipolygon-options';

/**
 * Abstract class defining the contract for a polygon in the architecture specific implementation.
 *
 * @export
 * @abstract
 * @class Polygon
 */
export abstract class Polygon {

    ///
    /// Property definitions
    ///

    /**
     * Gets or sets the maximum zoom at which the label is displayed. Ignored or ShowLabel is false.
     *
     * @abstract
     * @type {number}
     * @memberof Polygon
     * @property
     * @public
     */
    public abstract get LabelMaxZoom(): number;
    public abstract set LabelMaxZoom(val: number);

    /**
     * Gets or sets the minimum zoom at which the label is displayed. Ignored or ShowLabel is false.
     *
     * @abstract
     * @type {number}
     * @memberof Polygon
     * @property
     * @public
     */
    public abstract get LabelMinZoom(): number;
    public abstract set LabelMinZoom(val: number);

    /**
     * Gets the native primitve implementing the polygon.
     *
     * @readonly
     * @type {*}
     * @memberof Polygon
     */
    public abstract get NativePrimitve(): any;

    /**
     * Gets or sets whether to show the label
     *
     * @abstract
     * @type {boolean}
     * @memberof Polygon
     * @property
     * @public
     */
    public abstract get ShowLabel(): boolean;
    public abstract set ShowLabel(val: boolean);

    /**
     * Gets or sets whether to show the tooltip
     *
     * @abstract
     * @type {boolean}
     * @memberof Polygon
     * @property
     * @public
     */
    public abstract get ShowTooltip(): boolean;
    public abstract set ShowTooltip(val: boolean);

    /**
     * Gets or sets the title off the polygon
     *
     * @abstract
     * @type {string}
     * @memberof Polygon
     * @property
     * @public
     */
    public abstract get Title(): string;
    public abstract set Title(val: string);

    ///
    /// Public methods
    ///

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

    ///
    /// Protected methods
    ///

    /**
     * Gets the center of the polygons' bounding box.
     *
     * @returns {ILatLong} - {@link ILatLong} object containing the center of the bounding box.
     * @memberof Polygon
     * @method
     * @protected
     */
    protected GetBoundingCenter(): ILatLong {
        const c: ILatLong = {latitude: 0, longitude: 0};
        let x1: number = 90, x2: number = -90, y1: number = 180, y2: number = -180;
        const path: Array<ILatLong> = this.GetPath();
        if (path) {
            path.forEach(p => {
                if (p.latitude < x1) { x1 = p.latitude; }
                if (p.latitude > x2) { x2 = p.latitude; }
                if (p.longitude < y1) { y1 = p.longitude; }
                if (p.longitude > y2) { y2 = p.longitude; }
            });
            c.latitude = x1 + (x2 - x1) / 2;
            c.longitude = y1 + (y2 - y1) / 2;
        }
        return c;
    }

    /**
     * Get the centroid of the polygon based on the polygon path.
     *
     * @return {ILatLong} - The centroid coordinates of the polygon.
     * @memberof Polygon
     * @method
     * @protected
     */
    protected GetPolygonCentroid(): ILatLong {
        const c: ILatLong = {latitude: 0, longitude: 0};
        const path: Array<ILatLong> = this.GetPath();
        const off = path[0];
        let twicearea: number = 0;
        let x: number = 0;
        let y: number = 0;
        let p1: ILatLong, p2: ILatLong;
        let f: number;
        for (let i = 0, j = path.length - 1; i < path.length; j = i++) {
            p1 = path[i];
            p2 = path[j];
            f = (p1.latitude - off.latitude) * (p2.longitude - off.longitude) -
                (p2.latitude - off.latitude) * (p1.longitude - off.longitude);
            twicearea += f;
            x += (p1.latitude + p2.latitude - 2 * off.latitude) * f;
            y += (p1.longitude + p2.longitude - 2 * off.longitude) * f;
        }
        f = twicearea * 3;
        c.latitude = x / f + off.latitude;
        c.longitude = y / f + off.longitude
        return c;
    }
}
