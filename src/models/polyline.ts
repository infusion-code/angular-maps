import { ILatLong } from '../interfaces/ilatlong';
import { IPolylineOptions } from '../interfaces/ipolyline-options';

/**
 * Abstract class defining the contract for a polyline in the architecture specific implementation.
 *
 * @export
 * @abstract
 */
export abstract class Polyline {
    ///
    /// Field declarations
    ///
    protected _centroid: ILatLong;
    protected _center: ILatLong;

    ///
    /// Property definitions
    ///

    /**
     * Gets the polyline's center.
     * @readonly
     * @memberof Polyline
     */
    public get Center(): ILatLong {
        if (this._center == null) {
            this._center = this.GetBoundingCenter();
        }
        return this._center;
    }

    /**
     * Gets the polyline's centroid.
     * @readonly
     * @memberof Polyline
     */
    public get Centroid(): ILatLong {
        if (this._centroid == null) {
            this._centroid = this.GetPolylineCentroid();
        }
        return this._centroid;
    }

    /**
     * Gets the native primitve implementing the polyline.
     *
     * @readonly
     * @memberof Polyline
     */
    public abstract get NativePrimitve(): any;

    /**
     * Gets the polyline metadata.
     *
     * @readonly
     * @abstract
     * @memberof Polylin
     */
    public abstract get Metadata(): Map<string, any>;

    /**
     * Gets or sets whether to show the tooltip
     *
     * @abstract
     * @memberof Polyline
     * @property
     */
    public abstract get ShowTooltip(): boolean;
    public abstract set ShowTooltip(val: boolean);

    /**
     * Gets or sets the title off the polyline
     *
     * @abstract
     * @memberof Polyline
     * @property
     */
    public abstract get Title(): string;
    public abstract set Title(val: string);

    ///
    /// Public methods
    ///

    /**
     * Get the centroid of the polyline based on the a path.
     *
     * @param path - the path for which to generate the centroid
     * @returns - The centroid coordinates of the polyline.
     * @memberof Polyline
     * @method
     */
    public static GetPolylineCentroid(path: Array<ILatLong>): ILatLong {
        let c: ILatLong = {latitude: 0, longitude: 0};
        const off = path[0];
        if (off != null) {
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
            if (twicearea !== 0) {
                f = twicearea * 3;
                c.latitude = x / f + off.latitude;
                c.longitude = y / f + off.longitude;
            }
            else {
                c.latitude = off.latitude;
                c.longitude = off.longitude;
            }
        }
        else {
            c = null;
        }
        return c;
    }

    /**
     * Adds a delegate for an event.
     *
     * @abstract
     * @param eventType - String containing the event name.
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
     * @returns - True if the polyline is dragable, false otherwise.
     *
     * @memberof Polyline
     */
    public abstract GetDraggable(): boolean;

    /**
     * Gets whether the polyline path can be edited.
     *
     * @abstract
     * @returns - True if the path can be edited, false otherwise.
     *
     * @memberof Polyline
     */
    public abstract GetEditable(): boolean;

    /**
     * Gets the polyline path.
     *
     * @abstract
     * @returns - Array of ILatLong objects describing the polyline path.
     *
     * @memberof Polyline
     */
    public abstract GetPath(): Array<ILatLong>;

    /**
     * Gets whether the polyline is visible.
     *
     * @abstract
     * @returns - True if the polyline is visible, false otherwise.
     *
     * @memberof Polyline
     */
    public abstract GetVisible(): boolean;

    /**
     * Sets whether the polyline is dragable.
     *
     * @abstract
     * @param draggable - True to make the polyline dragable, false otherwise.
     *
     * @memberof Polyline
     */
    public abstract SetDraggable(draggable: boolean): void;

    /**
     * Sets wether the polyline path is editable.
     *
     * @abstract
     * @param editable - True to make polyline path editable, false otherwise.
     *
     * @memberof Polyline
     */
    public abstract SetEditable(editable: boolean): void;

    /**
     * Sets the polyline options
     *
     * @abstract
     * @param options - {@link ILatLong} object containing the options. The options are merged with hte ones
     * already on the underlying model.
     *
     * @memberof Polyline
     */
    public abstract SetOptions(options: IPolylineOptions): void;

    /**
     * Sets the polyline path.
     *
     * @abstract
     * @param path - An Array of {@link ILatLong} (or array of arrays) describing the polylines path.
     *
     * @memberof Polyline
     */
    public abstract SetPath(path: Array<ILatLong> | Array<ILatLong>): void;

    /**
     * Sets whether the polyline is visible.
     *
     * @abstract
     * @param visible - True to set the polyline visible, false otherwise.
     *
     * @memberof Polyline
     */
    public abstract SetVisible(visible: boolean): void;

    ///
    /// Protected methods
    ///

    /**
     * Gets the center of the polyline' bounding box.
     *
     * @returns - {@link ILatLong} object containing the center of the bounding box.
     * @memberof Polyline
     * @method
     * @protected
     */
    protected GetBoundingCenter(): ILatLong {
        let c: ILatLong = {latitude: 0, longitude: 0};
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
        else {
            c = null;
        }
        return c;
    }

    /**
     * Get the centroid of the polyline based on the polyline path.
     *
     * @returns - The centroid coordinates of the polyline.
     * @memberof Polyline
     * @method
     * @protected
     */
    protected GetPolylineCentroid(): ILatLong {
        const path: Array<ILatLong> = this.GetPath();
        const c: ILatLong  = Polyline.GetPolylineCentroid(path);
        return c;
    }

}
