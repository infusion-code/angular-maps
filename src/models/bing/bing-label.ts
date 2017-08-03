import { BingMapService } from './../../services/bing/bing-map.service';
import { BingConversions } from './../../services/bing/bing-conversions';

/**
 * Implements map a labled to be placed on the map.
 *
 * @export
 * @extends Microsoft.Maps.CustomOverlay
 * @class MapLabel
 */
export class MapLabel {
// export class MapLabel extends Microsoft.Maps.CustomOverlay {
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
     * @extends Microsoft.Maps.CustomOverlay
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
     * @param {string | Array<string>} prop - The property or properties that have changed.
     * @returns {void}
     * @memberof MapLabel
     * @method
     * @public
     */
    public Changed(prop: string | Array<string>): void {
        let shouldRunDrawCanvas = false;
        let shouldRunDraw = false;
        if (!Array.isArray(prop)) { prop = [prop]; }
        prop.forEach(p => {
            switch (p) {
                case 'fontFamily':
                case 'fontSize':
                case 'fontColor':
                case 'strokeWeight':
                case 'strokeColor':
                case 'align':
                case 'text':
                    shouldRunDrawCanvas = true;
                    break;
                case 'maxZoom':
                case 'minZoom':
                case 'offset':
                case 'hidden':
                case 'position':
                    shouldRunDraw = true;
                    break;
            }
        });
        if (shouldRunDrawCanvas) { this.DrawCanvas(); }
        if (shouldRunDraw) { this.Draw(); }
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
        return (<any>this)[key];
    }

    /**
     * Gets the map associted with the label.
     *
     * @returns {Microsoft.Maps.Map}
     * @memberof MapLabel
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
     * @memberof MapLabel
     * @public
     * @method
     */
    public Set(key: string, val: any): void {
        (<any>this)[key] = val;
        this.Changed(key);
    }

    /**
     * Sets the map for the label. Settings this to null remove the label from hte map.
     *
     * @param {Microsoft.Maps.Map} map - Map to associated with the label.
     * @memberof MapLabel
     * @method
     * @public
     */
    public SetMap(map: Microsoft.Maps.Map): void {
        const m: Microsoft.Maps.Map = this.GetMap();
        if (map === m) { return; }
        if (m) {
            m.layers.remove(this);
        }
        map.layers.insert(this);

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
        const p: Array<string> = new Array<string>();
        for (const key in options) {
            if (options[key]) {
                (<any>this)[key] = options[key];
                p.push(key);
            }
        }
        this.Changed(p);
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
        if (!this.GetMap()) { return ''; }

        const mapZoom: number = this.GetMap().getZoom();
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

        (<any>this).setHtmlElement(this._canvas);
    }

    /**
     * Delegate callled when the label is loaded
     * @memberof MapLabel
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
 * Helper function to extend the CustomOverlay into the MapLabel
 *
 * @export
 * @method
 */
export function ExtendMapLabelWithOverlayView() {
    const x = MapLabel.prototype;
    MapLabel.prototype = <any> new Microsoft.Maps.CustomOverlay();
    for (const y in x) { if ((<any>x)[y] != null) { (<any>MapLabel.prototype)[y] = (<any>x)[y]; }}
    (<any>MapLabel.prototype)['onAdd'] = x['OnAdd'];
    (<any>MapLabel.prototype)['onLoad'] = x['OnLoad'];
    (<any>MapLabel.prototype)['onRemove'] = x['OnRemove'];
}
