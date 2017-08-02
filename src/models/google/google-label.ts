import * as GoogleMapTypes from '../../services/google/google-map-types';
declare var google: any;

/**
 * Implements map a labled to be placed on the map.
 *
 * @export
 * @extends google.maps.OverlayView
 * @class MapLabel
 */
export class MapLabel {

    ///
    /// Field declarations
    ///
    private _canvas: HTMLCanvasElement;

    ///
    /// Constructor
    ///

    /**
     * Creates a new MapLabel
     * @constructor
     * @extends google.maps.OverlayView
     * @param {{ [key: string]: any }} opt_options Optional properties to set.
     */
    constructor(options: { [key: string]: any }) {
        this.Set('fontFamily', 'sans-serif');
        this.Set('fontSize', 12);
        this.Set('fontColor', '#000000');
        this.Set('strokeWeight', 4);
        this.Set('strokeColor', '#ffffff');
        this.Set('align', 'center');
        this.SetValues(options);
    }

    ///
    /// Public methods
    ///

    /**
     * Delegate called when underlying properties change.
     *
     * @param {string} prop - The property that has changed.
     * @returns {void}
     * @memberof MapLabel
     * @method
     * @public
     */
    public Changed(prop: string): void {
        switch (prop) {
            case 'fontFamily':
            case 'fontSize':
            case 'fontColor':
            case 'strokeWeight':
            case 'strokeColor':
            case 'align':
            case 'text':
                return this.DrawCanvas();
            case 'maxZoom':
            case 'minZoom':
            case 'offset':
            case 'hidden':
            case 'position':
                return this.Draw();
        }
    }

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
     * @memberof MapLabel
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
     * @memberof MapLabel
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
    /// Private methods
    ///

    /**
     * Get the visibility of the label. Visibility depends on Zoom settings.
     * @return {string} blank string if visible, 'hidden' if invisible.
     * @private
     */
    private GetVisible() {
        const minZoom: number = this.Get('minZoom');
        const maxZoom: number = this.Get('maxZoom');
        const hidden: boolean = this.Get('hidden');

        if (hidden) {return 'hidden'; }
        if (minZoom === undefined && maxZoom === undefined) { return ''; }
        const map: GoogleMapTypes.GoogleMap = (<any>this).getMap();
        if (!map) { return ''; }

        const mapZoom: number = map.getZoom();
        if (mapZoom < minZoom || mapZoom > maxZoom) { return 'hidden'; }
        return '';
    };

    /**
     * Draws the label on the map.
     * @memberof MapLabel
     * @method
     * @private
     */
    private Draw(): void {
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
     * Draws the label to the canvas 2d context.
     * @memberof MapLabel
     * @method
     * @private
     */
    private DrawCanvas () {
        if (!this._canvas) { return; }

        const style: CSSStyleDeclaration = this._canvas.style;
        style.zIndex = this.Get('zIndex');

        const ctx: CanvasRenderingContext2D = this._canvas.getContext('2d');
        ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        ctx.strokeStyle = this.Get('strokeColor');
        ctx.font = this.Get('fontSize') + 'px ' + this.Get('fontFamily');

        const backgroundColor: string = this.Get('backgroundColor');
        const strokeWeight: number = Number(this.Get('strokeWeight'));
        const text: string = this.Get('text');
        const textMeasure: TextMetrics = ctx.measureText(text);
        const textWidth: number = textMeasure.width + strokeWeight;
        if (text && strokeWeight && strokeWeight > 0) {
                ctx.lineWidth = strokeWeight;
                ctx.strokeText(text, strokeWeight, strokeWeight);
        }
        if (backgroundColor && backgroundColor !== '') {
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, textWidth + 5, (parseInt(ctx.font, 10) * 2) - 2);
        }
        ctx.fillStyle = this.Get('fontColor');
        ctx.fillText(text, strokeWeight, strokeWeight);

        style.marginLeft = this.GetMarginLeft(textWidth) + 'px';
        style.marginTop = '-0.4em';
            // Bring actual text top in line with desired latitude.
            // Cheaper than calculating height of text.
    }

    /**
     * Gets the appropriate margin-left for the canvas.
     * @param {number} textWidth  - The width of the text, in pixels.
     * @return {number} - The margin-left, in pixels.
     * @private
     * @method
     * @memberof MapLabel
     */
    private GetMarginLeft(textWidth: number): number {
        switch (this.Get('align')) {
            case 'left':    return 0;
            case 'right':   return -textWidth;
        }
        return textWidth / -2;
    };

    /**
     * Delegate called when the label is added to the map. Generates and configures
     * the canvas.
     *
     * @memberof MapLabel
     * @method
     * @private
     */
    private OnAdd() {
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

    /**
     * Called when the label is removed from the map.
     * @method
     * @private
     * @memberof MapLabel
     */
    private OnRemove() {
        if (this._canvas && this._canvas.parentNode) {
            this._canvas.parentNode.removeChild(this._canvas);
        }
    };
}

/**
 * Helper function to extend the OverlayView into the MapLabel
 *
 * @export
 * @method
 */
export function ExtendMapLabelWithOverlayView() {
    const x = MapLabel.prototype;
    MapLabel.prototype = new google.maps.OverlayView;
    for (const y in x) { if ((<any>x)[y] != null) { (<any>MapLabel.prototype)[y] = (<any>x)[y]; }}
    (<any>MapLabel.prototype)['changed'] = x['Changed'];
    (<any>MapLabel.prototype)['onAdd'] = x['OnAdd'];
    (<any>MapLabel.prototype)['draw'] = x['Draw'];
    (<any>MapLabel.prototype)['onRemove'] = x['OnRemove'];
}
