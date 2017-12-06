import { BingMapService } from '../../services/bing/bing-map.service';
import { BingConversions } from '../../services/bing/bing-conversions';
import { ILabelOptions } from '../../interfaces/ilabel-options';
import { MapLabel } from '../map-label';

let id: number = 0;

/**
 * Implements map a labled to be placed on the map.
 *
 * @export
 * @extends Microsoft.Maps.CustomOverlay
 * @extends MapLabel
 * @class BingMapLabel
 */
export class BingMapLabel extends MapLabel {

    /**
     * Returns the default label style for the platform
     *
     * @readonly
     * @abstract
     * @type {*}
     * @memberof BingMapLabel
     */
    public get DefaultLabelStyle(): ILabelOptions {
        return {
            fontSize: 12,
            fontFamily: 'sans-serif',
            fontColor: '#ffffff',
            strokeWeight: 2,
            strokeColor: '#000000'
        };
    }

    ///
    /// Constructor
    ///

    /**
     * Creates a new MapLabel
     * @extends Microsoft.Maps.CustomOverlay
     * @extends MapLabel
     * @param {{ [key: string]: any }} opt_options Optional properties to set.
     * @constructor
     * @public
     */
    constructor(options: { [key: string]: any }) {
        options.fontSize = options.fontSize || 12;
        options.fontColor = options.fontColor || '#ffffff';
        options.strokeWeight = options.strokeWeight || 2;
        options.strokeColor = options.strokeColor || '#000000';
        super(options);
        (<any>this)._options.beneathLabels = false;
    }

    ///
    /// Public methods
    ///

    /**
     * Gets the value of a setting.
     *
     * @param {string} key - Key specifying the setting.
     * @returns {*} - The value of the setting.
     * @memberof BingMapLabel
     * @public
     * @method
     */
    public Get(key: string): any {
        return (<any>this)[key];
    }

    /**
     * Gets the map associted with the label.
     *
     * @returns {Microsoft.Maps.Map}
     * @memberof BingMapLabel
     * @method
     * @public
     */
    public GetMap(): Microsoft.Maps.Map {
        return (<any>this).getMap();
    }

    /**
     * Set the value for a setting.
     *
     * @param {string} key - Key specifying the setting.
     * @param {*} val - The value to set.
     * @memberof BingMapLabel
     * @public
     * @method
     */
    public Set(key: string, val: any): void {
        if (key === 'position' && !val.hasOwnProperty('altitude') && val.hasOwnProperty('latitude') && val.hasOwnProperty('longitude')) {
            val = new Microsoft.Maps.Location(val.latitude, val.longitude);
        }
        if (this.Get(key) !== val) {
            (<any>this)[key] = val;
            this.Changed(key);
        }
    }

    /**
     * Sets the map for the label. Settings this to null remove the label from hte map.
     *
     * @param {Microsoft.Maps.Map} map - Map to associated with the label.
     * @memberof BingMapLabel
     * @method
     * @public
     */
    public SetMap(map: Microsoft.Maps.Map): void {
        const m: Microsoft.Maps.Map = this.GetMap();
        if (map === m) { return; }
        if (m) {
            m.layers.remove(this);
        }
        if (map != null) {
            map.layers.insert(this);
        }
    }

    /**
     * Applies settings to the object
     *
     * @param {{ [key: string]: any }} options - An object containing the settings key value pairs.
     * @memberof BingMapLabel
     * @public
     * @method
     */
    public SetValues(options: { [key: string]: any }): void {
        const p: Array<string> = new Array<string>();
        for (const key in options) {
            if (key !== '') {
                if (key === 'position' && !options[key].hasOwnProperty('altitude') &&
                    options[key].hasOwnProperty('latitude') && options[key].hasOwnProperty('longitude')) {
                    options[key] = new Microsoft.Maps.Location(options[key].latitude, options[key].longitude);
                }
                if (this.Get(key) !== options[key]) {
                    (<any>this)[key] = options[key];
                    p.push(key);
                }
            }
        }
        if (p.length > 0) { this.Changed(p); }
    }

    ///
    /// Protected methods
    ///

    /**
     * Draws the label on the map.
     * @memberof BingMapLabel
     * @method
     * @protected
     */
    protected Draw(): void {
        const visibility: string = this.GetVisible();
        const m: Microsoft.Maps.Map = this.GetMap();
        if (!this._canvas) { return; }
        if (!m) { return; }
        const style: CSSStyleDeclaration = this._canvas.style;
        if (visibility !== '') {
            // label is not visible, don't calculate positions etc.
            style['visibility'] = visibility;
            return;
        }

        let offset: Microsoft.Maps.Point = this.Get('offset');
        const latLng: Microsoft.Maps.Location = this.Get('position');
        if (!latLng) { return; }
        if (!offset) { offset = new Microsoft.Maps.Point(0, 0); }

        const pos: Microsoft.Maps.Point = <Microsoft.Maps.Point>m.tryLocationToPixel(
            latLng,
            Microsoft.Maps.PixelReference.control);
        style['top'] = (pos.y + offset.y) + 'px';
        style['left'] = (pos.x + offset.x) + 'px';
        style['visibility'] = visibility;
    }

    /**
     * Delegate called when the label is added to the map. Generates and configures
     * the canvas.
     *
     * @memberof BingMapLabel
     * @method
     * @protected
     */
    protected OnAdd() {
        this._canvas = document.createElement('canvas');
        this._canvas.id = `xMapLabel${id++}`;
        const style: CSSStyleDeclaration = this._canvas.style;
        style.position = 'absolute';

        const ctx: CanvasRenderingContext2D = this._canvas.getContext('2d');
        ctx.lineJoin = 'round';
        ctx.textBaseline = 'top';

        (<any>this).setHtmlElement(this._canvas);
    }

    ///
    /// Private methods
    ///

    /**
     * Delegate callled when the label is loaded
     * @memberof BingMapLabel
     * @method
     * @private
     */
    private OnLoad() {
        Microsoft.Maps.Events.addHandler(this.GetMap(), 'viewchange', () => {
            this.Changed('position');
        });
        this.DrawCanvas();
        this.Draw();
    }
}

/**
 * Helper function to extend the CustomOverlay into the MapLabel
 *
 * @export
 * @method
 */
export function MixinMapLabelWithOverlayView() {
    const x = BingMapLabel.prototype;
    BingMapLabel.prototype = <any> new Microsoft.Maps.CustomOverlay();
    for (const y in x) { if ((<any>x)[y] != null) { (<any>BingMapLabel.prototype)[y] = (<any>x)[y]; }}
    (<any>BingMapLabel.prototype)['onAdd'] = x['OnAdd'];
    (<any>BingMapLabel.prototype)['onLoad'] = x['OnLoad'];
    (<any>BingMapLabel.prototype)['onRemove'] = x['OnRemove'];
}
