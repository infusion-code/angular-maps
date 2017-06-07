import { ILatLong } from '../../interfaces/ilatlong';
import { IPolygonOptions } from '../../interfaces/ipolygonoptions';
import { GoogleConversions } from '../../services/google/google-conversions';
import * as GoogleMapTypes from '../../services/google/google-map-types';
import { Polygon } from '../polygon';

declare var google: any;

/**
 * Concrete implementation for a polygon model for Google Maps.
 *
 * @export
 * @implements Polygon
 * @class Polygon
 */
export class GooglePolygon implements Polygon {

    ///
    /// Property declarations
    ///
    public get NativePrimitve(): any { return this._polygon; }

    ///
    /// constructor
    ///
    constructor(private _polygon: GoogleMapTypes.Polygon) { }

    /**
     * Adds a delegate for an event.
     *
     * @param {string} eventType - String containing the event name.
     * @param fn - Delegate function to execute when the event occurs.

     * @memberof Polygon
     */
    public AddListener(eventType: string, fn: Function): void {
        this._polygon.addListener(eventType, fn)
    }

    /**
     * Deleted the polygon.
     *
     *
     * @memberof Polygon
     */
    public Delete(): void {
        this._polygon.setMap(null);
    }

    /**
     * Gets whether the polygon is draggable.
     *
     * @returns {boolean} - True if the polygon is dragable, false otherwise.
     *
     * @memberof Polygon
     */
    public GetDraggable(): boolean {
        return this._polygon.getDraggable();
    }

    /**
     * Gets whether the polygon path can be edited.
     *
     * @returns {boolean} - True if the path can be edited, false otherwise.
     *
     * @memberof Polygon
     */
    public GetEditable(): boolean {
        return this._polygon.getEditable();
    }

    /**
     * Gets the polygon path.
     *
     * @returns {Array<ILatLong>} - Array of {@link ILatLong} objects describing the polygon path.
     *
     * @memberof Polygon
     */
    public GetPath(): Array<ILatLong> {
        const p: Array<GoogleMapTypes.LatLng> = this._polygon.getPath();
        const path: Array<ILatLong> = new Array<ILatLong>();
        p.forEach(x => path.push({ latitude: x.lat(), longitude: x.lng() }));
        return path;
    }

    /**
     * Gets the polygon paths.
     *
     * @returns {Array<Array<ILatLong>>} - Array of Array of {@link ILatLong} objects describing multiple polygon paths.
     *
     * @memberof Polygon
     */
    public GetPaths(): Array<Array<ILatLong>> {
        const p: Array<Array<GoogleMapTypes.LatLng>> = this._polygon.getPaths();
        const paths: Array<Array<ILatLong>> = new Array<Array<ILatLong>>();
        p.forEach(x => {
            const path: Array<ILatLong> = new Array<ILatLong>();
            x.forEach(y => path.push({ latitude: y.lat(), longitude: y.lng() }));
            paths.push(path);
        });
        return paths;
    }

    /**
     * Gets whether the polygon is visible.
     *
     * @returns {boolean} - True if the polygon is visible, false otherwise.
     *
     * @memberof Polygon
     */
    public GetVisible(): boolean {
        return this._polygon.getVisible();
    }

    /**
     * Sets whether the polygon is dragable.
     *
     * @param {boolean} draggable - True to make the polygon dragable, false otherwise.
     *
     * @memberof Polygon
     */
    public SetDraggable(draggable: boolean): void {
        this._polygon.setDraggable(draggable);
    }

    /**
     * Sets wether the polygon path is editable.
     *
     * @param {boolean} editable - True to make polygon path editable, false otherwise.
     *
     * @memberof Polygon
     */
    public SetEditable(editable: boolean): void {
        this._polygon.setEditable(editable);
    }

    /**
     * Sets the polygon options
     *
     * @param {IPolygonOptions} options - {@link ILatLong} object containing the options. The options are merged with hte ones
     * already on the underlying model.
     *
     * @memberof Polygon
     */
    public SetOptions(options: IPolygonOptions): void {
        const o: GoogleMapTypes.PolygonOptions = GoogleConversions.TranslatePolygonOptions(options);
        this._polygon.setOptions(o);
    }

    /**
     * Sets the polygon path.
     *
     * @param {Array<ILatLong>} path - An Array of {@link ILatLong} (or array of arrays) describing the polygons path.
     *
     * @memberof Polygon
     */
    public SetPath(path: Array<ILatLong>): void {
        const p: Array<GoogleMapTypes.LatLng> = new Array<GoogleMapTypes.LatLng>();
        path.forEach(x => p.push(new google.maps.LatLng(x.latitude, x.longitude)));
        this._polygon.setPath(p);
    }

    /**
     * Set the polygon path or paths.
     *
     * @param {(Array<Array<ILatLong>> | Array<ILatLong>)} paths An Array of {@link ILatLong} (or array of arrays) describing the polygons path(s).
     *
     * @memberof Polygon
     */
    public SetPaths(paths: Array<Array<ILatLong>> | Array<ILatLong>): void {
        if (paths == null) { return; }
        if (!Array.isArray(paths)) { return; }
        if (paths.length === 0) {
            this._polygon.setPaths(new Array<GoogleMapTypes.LatLng>());
            return;
        }
        if (Array.isArray(paths[0])) {
            // parameter is an array or arrays
            const p: Array<Array<GoogleMapTypes.LatLng>> = new Array<Array<GoogleMapTypes.LatLng>>();
            (<Array<Array<ILatLong>>>paths).forEach(path => {
                const _p: Array<GoogleMapTypes.LatLng> = new Array<GoogleMapTypes.LatLng>();
                path.forEach(x => _p.push(new google.maps.LatLng(x.latitude, x.longitude)));
                p.push(_p);
            });
            this._polygon.setPaths(p);
        } else {
            // parameter is a simple array....
            this.SetPath(<Array<ILatLong>>paths);
        }
    }

    /**
     * Sets whether the polygon is visible.
     *
     * @param {boolean} visible - True to set the polygon visible, false otherwise.
     *
     * @memberof Polygon
     */
    public SetVisible(visible: boolean): void {
        this._polygon.setVisible(visible);
    }

}
