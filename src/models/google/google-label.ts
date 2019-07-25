import * as GoogleMapTypes from '../../services/google/google-map-types';
import { MapLabel } from '../map-label';
import { ILabelOptions } from '../../interfaces/ilabel-options';
declare var google: any;

/**
 * Implements map a labled to be placed on the map.
 *
 * @export
 */
export class GoogleMapLabel extends MapLabel {

    /**
     * Returns the default label style for the platform
     *
     * @readonly
     * @abstract
     * @memberof GoogleMapLabel
     */
    public get DefaultLabelStyle(): ILabelOptions {
        return {
            fontSize: 12,
            fontFamily: 'sans-serif',
            fontColor: '#ffffff',
            strokeWeight: 3,
            strokeColor: '#000000'
        };
    }

    ///
    /// Constructor
    ///

    /**
     * Creates a new MapLabel
     * @param options Optional properties to set.
     */
    constructor(options: { [key: string]: any }) {
        options.fontSize = options.fontSize || 12;
        options.fontColor = options.fontColor || '#ffffff';
        options.strokeWeight = options.strokeWeight || 3;
        options.strokeColor = options.strokeColor || '#000000';
        super(options);
    }

    ///
    /// Public methods
    ///

    /**
     * Gets the value of a setting.
     *
     * @param key - Key specifying the setting.
     * @returns - The value of the setting.
     * @memberof MapLabel
     * @method
     */
    public Get(key: string): any {
        return (<any>this).get(key);
    }

    /**
     * Gets the map associted with the label.
     *
     * @memberof GoogleMapLabel
     * @method
     */
    public GetMap(): GoogleMapTypes.GoogleMap {
        return (<any>this).getMap();
    }

    /**
     * Set the value for a setting.
     *
     * @param key - Key specifying the setting.
     * @param val - The value to set.
     * @memberof MapLabel
     * @method
     */
    public Set(key: string, val: any): void {
        if (key === 'position' && val.hasOwnProperty('latitude') && val.hasOwnProperty('longitude')) {
            val = new google.maps.LatLng(val.latitude, val.longitude);
        }
        if (this.Get(key) !== val) {
            (<any>this).set(key, val);
        }
    }

    /**
     * Sets the map for the label. Settings this to null remove the label from hte map.
     *
     * @param map - Map to associated with the label.
     * @memberof GoogleMapLabel
     * @method
     */
    public SetMap(map: GoogleMapTypes.GoogleMap): void {
        (<any>this).setMap(map);
    }

    /**
     * Applies settings to the object
     *
     * @param options - An object containing the settings key value pairs.
     * @memberof MapLabel
     * @method
     */
    public SetValues(options: { [key: string]: any }): void {
        for (const key in options) {
            if (key !== '') {
                if (key === 'position' &&  options[key].hasOwnProperty('latitude') &&  options[key].hasOwnProperty('longitude')) {
                    options[key] = new google.maps.LatLng( options[key].latitude,  options[key].longitude);
                }
                if (this.Get(key) === options[key]) { delete options[key]; }
            }
        }
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
    }

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
export function MixinMapLabelWithOverlayView() {
    const x = GoogleMapLabel.prototype;
    Object.defineProperty(GoogleMapLabel, "prototype", new google.maps.OverlayView);
    for (const y in x) { if ((<any>x)[y] != null) { (<any>GoogleMapLabel.prototype)[y] = (<any>x)[y]; }}
    (<any>GoogleMapLabel.prototype)['changed'] = x['Changed'];
    (<any>GoogleMapLabel.prototype)['onAdd'] = x['OnAdd'];
    (<any>GoogleMapLabel.prototype)['draw'] = x['Draw'];
    (<any>GoogleMapLabel.prototype)['onRemove'] = x['OnRemove'];
}
