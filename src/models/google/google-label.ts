import * as GoogleMapTypes from '../../services/google/google-map-types';
import { MapLabel } from '../map-label';
declare var google: any;

/**
 * Implements map a labled to be placed on the map.
 *
 * @export
 * @extends MapLabel
 * @extends google.maps.OverlayView
 * @class GoogleMapLabel
 */
export class GoogleMapLabel extends MapLabel {

    ///
    /// Constructor
    ///

    /**
     * Creates a new MapLabel
     * @extends google.maps.OverlayView
     * @extends MapLabel
     * @param {{ [key: string]: any }} opt_options Optional properties to set.
     * @constructor
     * @public
     */
    constructor(options: { [key: string]: any }) {
        super(options);
    }

    ///
    /// Public methods
    ///

    /**
     * Gets the value of a setting.
     *
     * @param {string} key - Key specifying the setting.
     * @returns {*} - The value of the setting.
     * @memberof MapLabel
     * @public
     * @method
     */
    public Get(key: string): any {
        return (<any>this).get(key);
    }

    /**
     * Gets the map associted with the label.
     *
     * @returns {GoogleMapTypes.GoogleMap}
     * @memberof GoogleMapLabel
     * @method
     * @public
     */
    public GetMap(): GoogleMapTypes.GoogleMap {
        return (<any>this).getMap();
    }

    /**
     * Set the value for a setting.
     *
     * @param {string} key - Key specifying the setting.
     * @param {*} val - The value to set.
     * @memberof MapLabel
     * @public
     * @method
     */
    public Set(key: string, val: any): void {
        (<any>this).set(key, val);
    }

    /**
     * Sets the map for the label. Settings this to null remove the label from hte map.
     *
     * @param {GoogleMapTypes.GoogleMap} map - Map to associated with the label.
     * @memberof GoogleMapLabel
     * @method
     * @public
     */
    public SetMap(map: GoogleMapTypes.GoogleMap): void {
        (<any>this).setMap(map);
    }

    /**
     * Applies settings to the object
     *
     * @param {{ [key: string]: any }} options - An object containing the settings key value pairs.
     * @memberof MapLabel
     * @public
     * @method
     */
    public SetValues(options: { [key: string]: any }): void {
        (<any>this).setValues(options);
    }

    ///
    /// Protected methods
    ///

    /**
     * Draws the label on the map.
     * @memberof GoogleMapLabel
     * @method
     * @protected
     */
    protected Draw(): void {
        const projection = (<any>this).getProjection();
        const visibility: string = this.GetVisible();
        if (!projection) {
            // The map projection is not ready yet so do nothing
            return;
        }
        if (!this._canvas) {
            // onAdd has not been called yet.
            return;
        }
        const style: CSSStyleDeclaration = this._canvas.style;
        if (visibility !== '') {
            // label is not visible, don't calculate positions etc.
            style['visibility'] = visibility;
            return;
        }

        let offset: GoogleMapTypes.Point = this.Get('offset');
        let latLng: GoogleMapTypes.LatLng|GoogleMapTypes.LatLngLiteral = this.Get('position');
        if (!latLng) { return; }
        if (!(latLng instanceof google.maps.LatLng)) { latLng = new google.maps.LatLng(latLng.lat, latLng.lng); }
        if (!offset) { offset = new google.maps.Point(0, 0); }

        const pos = projection.fromLatLngToDivPixel(latLng);
        style['top'] = (pos.y + offset.y) + 'px';
        style['left'] = (pos.x + offset.x) + 'px';
        style['visibility'] = visibility;
    };

    /**
     * Delegate called when the label is added to the map. Generates and configures
     * the canvas.
     *
     * @memberof GoogleMapLabel
     * @method
     * @protected
     */
    protected OnAdd() {
        this._canvas = document.createElement('canvas');
        const style: CSSStyleDeclaration = this._canvas.style;
        style.position = 'absolute';

        const ctx: CanvasRenderingContext2D = this._canvas.getContext('2d');
        ctx.lineJoin = 'round';
        ctx.textBaseline = 'top';

        this.DrawCanvas();
        const panes = (<any>this).getPanes();
        if (panes) {
            panes.overlayLayer.appendChild(this._canvas);
                // 4: floatPane (infowindow)
                // 3: overlayMouseTarget (mouse events)
                // 2: markerLayer (marker images)
                // 1: overlayLayer (polygons, polylines, ground overlays, tile layer overlays)
                // 0: mapPane (lowest pane above the map tiles)
        }
    }
}

/**
 * Helper function to extend the OverlayView into the MapLabel
 *
 * @export
 * @method
 */
export function ExtendMapLabelWithOverlayView() {
    const x = GoogleMapLabel.prototype;
    GoogleMapLabel.prototype = new google.maps.OverlayView;
    for (const y in x) { if ((<any>x)[y] != null) { (<any>GoogleMapLabel.prototype)[y] = (<any>x)[y]; }}
    (<any>GoogleMapLabel.prototype)['changed'] = x['Changed'];
    (<any>GoogleMapLabel.prototype)['onAdd'] = x['OnAdd'];
    (<any>GoogleMapLabel.prototype)['draw'] = x['Draw'];
    (<any>GoogleMapLabel.prototype)['onRemove'] = x['OnRemove'];
}
