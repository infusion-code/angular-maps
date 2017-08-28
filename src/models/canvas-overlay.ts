import { ILatLong } from '../interfaces/ilatlong';

/**
 * Abstract base implementing a canvas overlay to be placed on the map.
 *
 * @export
 * @abstract
 * @class MapLabel
 */
export abstract class CanvasOverlay {

    ///
    /// field declarations
    ///
    protected _canvas: HTMLCanvasElement;
    protected _zoomStart: number;
    protected _centerStart: ILatLong;

    /**
    * A callback function that is triggered when the canvas is ready to be rendered for the current map view.
    * @type {HTMLCanvasElements => void}
    * @memberof CanvasOverlay
    * @private
    */
    private _drawCallback: (canvas: HTMLCanvasElement) => void;


    /**
     * Creates a new instance of the CanvasOverlay class.
     * @param  {HTMLCanvasElements => void} drawCallback A callback function that is triggered when the canvas is ready to be
     * rendered for the current map view.
     * @memberof CanvasOverlay
     * @constructor
     */
    constructor(drawCallback: (canvas: HTMLCanvasElement) => void) {
        this._drawCallback = drawCallback;
    }

    ///
    /// Public methods
    ///

    /**
     * Deletes the canvas overlay.
     *
     * @memberof CanvasOverlay
     */
    public Delete(): void {
        this.SetMap(null);
    }

    /**
     * Gets the map associted with the label.
     *
     * @returns {*} - A native map object for the underlying implementation. Implementing derivatives should return the
     * actual native object.
     * @memberof CanvasOverlay
     * @method
     * @abstract
     * @public
     */
    public abstract GetMap(): any;

    /**
     * CanvasOverlay added to map, load canvas.
     * @memberof CanvasOverlay
     * @method
     * @public
     * @memberof CanvasOverlay
     */
    public OnAdd(): void {
        this._canvas = document.createElement('canvas');
        this._canvas.style.position = 'absolute';
        this._canvas.style.left = '0px';
        this._canvas.style.top = '0px';

        // Add the canvas to the overlay.
        this.SetCanvasElement(this._canvas);
    };

    /**
     * CanvasOverlay loaded, attach map events for updating canvas.
     * @abstract
     * @method
     * @public
     * @memberof CanvasOverlay
     */
    public abstract OnLoad(): void;

    /**
     * When the CanvasLayer is removed from the map, release resources.
     * @memberof CanvasOverlay
     * @method
     * @public
     */
    public OnRemove(): void {
        this.SetCanvasElement(null);
        this.RemoveEventHandlers();
        this._canvas = null;
    }

    /**
     * Redraws the canvas for the current map view.
     * @memberof CanvasOverlay
     * @method
     * @public
     */
    public Redraw(): void {
        if (this._canvas == null) { return; }

        // Clear canvas by updating dimensions. This also ensures canvas stays the same size as the map.
        this.Resize();

        // Call the drawing callback function if specified.
        if (this._drawCallback) {
            this._drawCallback(this._canvas);
        }
    }

    /**
     * Sets the map for the label. Settings this to null remove the label from hte map.
     *
     * @param {*} map - A native map object for the underlying implementation. Implementing derivatives should return the
     * actual native object.
     * @memberof CanvasOverlay
     * @method
     * @public
     */
    public abstract SetMap(map: any): void;

    ///
    /// Protected methods
    ///

    /**
     * Attaches the canvas to the map.
     * @memberof CanvasOverlay
     * @method
     * @public
     */
    protected abstract SetCanvasElement(el: HTMLCanvasElement): void;

    /**
     * Remove the map event handlers.
     * @memberof CanvasOverlay
     * @method
     * @abstract
     * @protected
     */
    protected abstract RemoveEventHandlers(): void;

    /**
     * Updates the Canvas size based on the map size.
     * @memberof CanvasOverlay
     * @method
     * @abstract
     * @protected
     */
    protected abstract Resize(): void;

    /**
     * Updates the Canvas.
     * @memberof CanvasOverlay
     * @method
     * @protected
     */
    protected abstract UpdateCanvas(): void;

    /**
     * Simple function for updating the CSS position and dimensions of the canvas.
     * @param x The horizontal offset position of the canvas.
     * @param y The vertical offset position of the canvas.
     * @param w The width of the canvas.
     * @param h The height of the canvas.
     * @memberof CanvasOverlay
     * @method
     * @protected
     */
    protected UpdatePosition(x: number, y: number, w: number, h: number) {
        // Update CSS position.
        this._canvas.style.left = x + 'px';
        this._canvas.style.top = y + 'px';

        // Update CSS dimensions.
        this._canvas.style.width = w + 'px';
        this._canvas.style.height = h + 'px';
    }

}
