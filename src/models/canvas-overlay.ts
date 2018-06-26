import { ILatLong } from '../interfaces/ilatlong';
import { MapLabel } from './map-label';

let id: number = 0;

/**
 * Abstract base implementing a canvas overlay to be placed on the map.
 *
 * @export
 * @abstract
 */
export abstract class CanvasOverlay {

    ///
    /// field declarations
    ///
    protected _readyResolver: (val: boolean) => void;
    protected _canvas: HTMLCanvasElement;
    protected _zoomStart: number;
    protected _centerStart: ILatLong;
    public _canvasReady: Promise<boolean> = new Promise<boolean>((resolve, reject) => { this._readyResolver = resolve; });

    /**
     * Returns a promise that gets resolved when the canvas overlay is ready for interaction.
     */
    public get CanvasReady(): Promise<boolean> { return this._canvasReady; }

    /**
    * A callback function that is triggered when the canvas is ready to be rendered for the current map view.
    */
    private _drawCallback: (canvas: HTMLCanvasElement) => void;


    /**
     * Creates a new instance of the CanvasOverlay class.
     */
    constructor(drawCallback: (canvas: HTMLCanvasElement) => void) {
        this._drawCallback = drawCallback;
        id++;
    }

    ///
    /// Public methods
    ///

    /**
     * Deletes the canvas overlay.
     */
    public Delete(): void {
        this.SetMap(null);
    }

    /**
     * Obtains geo coordinates for the click location
     */
    public abstract GetCoordinatesFromClick(e: any): ILatLong;


    /**
     * Gets the map associted with the label.
     */
    public abstract GetMap(): any;

    /**
     * Returns a MapLabel instance for the current platform that can be used as a tooltip.
     * This method only generates the map label. Content and placement is the responsibility
     * of the caller.
     */
    public abstract GetToolTipOverlay(): MapLabel;

    /**
     * CanvasOverlay added to map, load canvas.
     */
    public OnAdd(): void {
        this._canvas = document.createElement('canvas');
        this._canvas.style.position = 'absolute';
        this._canvas.style.left = '0px';
        this._canvas.style.top = '0px';
        this._canvas.id = `xMapOverlay${id}`;

        // Add the canvas to the overlay.
        this.SetCanvasElement(this._canvas);
    }

    /**
     * CanvasOverlay loaded, attach map events for updating canvas.
     * @abstract
     * @method
     * @memberof CanvasOverlay
     */
    public abstract OnLoad(): void;

    /**
     * When the CanvasLayer is removed from the map, release resources.
     * @memberof CanvasOverlay
     * @method
     */
    public OnRemove(): void {
        this.SetCanvasElement(null);
        this.RemoveEventHandlers();
        this._canvas = null;
    }

    /**
     * Redraws the canvas for the current map view.
     * @param clear - True to clear the canvas before drawing.
     * @memberof CanvasOverlay
     * @method
     */
    public Redraw(clear: boolean): void {
        if (this._canvas == null) { return; }

        // Clear canvas by updating dimensions. This also ensures canvas stays the same size as the map.
        if (clear) { this.Resize(); }

        // Call the drawing callback function if specified.
        if (this._drawCallback) {
            this._drawCallback(this._canvas);
        }
    }

    /**
     * Sets the map for the label. Settings this to null remove the label from hte map.
     *
     * @param map - A native map object for the underlying implementation. Implementing derivatives should return the
     * actual native object.
     * @memberof CanvasOverlay
     * @method
     */
    public abstract SetMap(map: any): void;

    ///
    /// Protected methods
    ///

    /**
     * Attaches the canvas to the map.
     * @memberof CanvasOverlay
     * @method
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
