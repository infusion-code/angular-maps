import { ILabelOptions } from '../interfaces/ilabel-options';

/**
 * Abstract base implementing a label to be placed on the map.
 *
 * @export
 * @abstract
 * @class MapLabel
 */
export abstract class MapLabel {
// export class MapLabel extends Microsoft.Maps.CustomOverlay {
    ///
    /// Field declarations
    ///
    protected _canvas: HTMLCanvasElement;

    /**
     * Returns the default label style for the platform
     *
     * @readonly
     * @abstract
     * @type {ILabelOptions}
     * @memberof MapLabel
     */
    public abstract get DefaultLabelStyle(): ILabelOptions;

    ///
    /// Constructor
    ///

    /**
     * Creates a new MapLabel
     * @constructor
     * @param {{ [key: string]: any }} opt_options Optional properties to set.
     * @constructor
     * @public
     */
    constructor(options: { [key: string]: any }) {
        this.Set('fontFamily', 'sans-serif');
        this.Set('fontSize', 12);
        this.Set('fontColor', '#ffffff');
        this.Set('strokeWeight', 4);
        this.Set('strokeColor', '#000000');
        this.Set('align', 'center');
        this.SetValues(options);
    }

    ///
    /// Public methods
    ///

    /**
     * Deletes the label from the map. This method does not atually delete the label itself, so
     * it can be readded to map later.
     * @memberof MapLabel
     * @method
     * @public
     */
    public Delete(): void {
        this.SetMap(null);
    }

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
     * @abstract
     * @public
     * @method
     */
    public abstract Get(key: string): any;

    /**
     * Gets the map associted with the label.
     *
     * @returns {*} - A native map object for the underlying implementation. Implementing derivatives should return the
     * actual native object.
     * @memberof MapLabel
     * @method
     * @abstract
     * @public
     */
    public abstract GetMap(): any;

    /**
     * Set the value for a setting.
     *
     * @param {string} key - Key specifying the setting.
     * @param {*} val - The value to set.
     * @memberof MapLabel
     * @abstract
     * @public
     * @method
     */
    public abstract Set(key: string, val: any): void;

    /**
     * Sets the map for the label. Settings this to null remove the label from hte map.
     *
     * @param {*} map - A native map object for the underlying implementation. Implementing derivatives should return the
     * actual native object.
     * @memberof MapLabel
     * @method
     * @public
     */
    public abstract SetMap(map: any): void;

    /**
     * Applies settings to the object
     *
     * @param {{ [key: string]: any }} options - An object containing the settings key value pairs.
     * @memberof MapLabel
     * @abstract
     * @public
     * @method
     */
    public abstract SetValues(options: { [key: string]: any }): void;

    ///
    /// Protected methods
    ///

    /**
     * Get the visibility of the label. Visibility depends on Zoom settings.
     * @return {string} blank string if visible, 'hidden' if invisible.
     * @protected
     */
    protected GetVisible() {
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
     * @protected
     */
    protected abstract Draw(): void;

    /**
     * Draws the label to the canvas 2d context.
     * @memberof MapLabel
     * @method
     * @protected
     */
    protected DrawCanvas () {
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
        const textWidth: number = textMeasure.width;
        if (text && strokeWeight && strokeWeight > 0) {
                ctx.lineWidth = strokeWeight;
                ctx.strokeText(text, 4, 4);
        }
        if (backgroundColor && backgroundColor !== '') {
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, textWidth + 8, (parseInt(ctx.font, 10) * 2) - 2);
        }
        ctx.fillStyle = this.Get('fontColor');
        ctx.fillText(text, 4, 4);

        style.marginLeft = this.GetMarginLeft(textWidth) + 'px';
        style.marginTop = '-0.4em';
        style.pointerEvents = 'none';
            // Bring actual text top in line with desired latitude.
            // Cheaper than calculating height of text.
    }

    /**
     * Gets the appropriate margin-left for the canvas.
     * @param {number} textWidth  - The width of the text, in pixels.
     * @return {number} - The margin-left, in pixels.
     * @protected
     * @method
     * @memberof MapLabel
     */
    protected GetMarginLeft(textWidth: number): number {
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
     * @protected
     * @abstract
     */
    protected abstract OnAdd(): void;

    /**
     * Called when the label is removed from the map.
     * @method
     * @protected
     * @memberof MapLabel
     */
    protected OnRemove() {
        if (this._canvas && this._canvas.parentNode) {
            this._canvas.parentNode.removeChild(this._canvas);
        }
    };
}

