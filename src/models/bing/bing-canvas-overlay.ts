import { ILatLong } from '../../interfaces/ilatlong';
import { BingConversions } from '../../services/bing/bing-conversions';
import { CanvasOverlay } from '../canvas-overlay';
import { MapLabel } from '../map-label';
import { BingMapLabel } from './bing-label';

/**
 * Concrete implementing a canvas overlay to be placed on the map for Bing Maps.
 *
 * @export
 */
export class BingCanvasOverlay extends CanvasOverlay {

    ///
    /// field declarations
    ///
    private _viewChangeEvent: Microsoft.Maps.IHandlerId;
    private _viewChangeEndEvent: Microsoft.Maps.IHandlerId;
    private _mapResizeEvent: Microsoft.Maps.IHandlerId;


    /**
     * Creates a new instance of the BingCanvasOverlay class.
     * @param drawCallback A callback function that is triggered when the canvas is ready to be
     * rendered for the current map view.
     * @memberof BingCanvasOverlay
     */
    constructor(drawCallback: (canvas: HTMLCanvasElement) => void) {
        super(drawCallback);
    }

    ///
    /// Public methods
    ///

    /**
     * Obtains geo coordinates for the click location
     *
     * @abstract
     * @param e - The mouse event. Expected to implement {@link Microsoft.Maps.IMouseEventArgs}.
     * @returns - {@link ILatLong} containing the geo coordinates of the clicked marker.
     * @memberof BingCanvasOverlay
     */
    public GetCoordinatesFromClick(e: Microsoft.Maps.IMouseEventArgs): ILatLong {
        return { latitude: e.location.latitude, longitude: e.location.longitude };
    }

    /**
     * Gets the map associted with the label.
     *
     * @memberof BingCanvasOverlay
     * @method
     */
    public GetMap(): Microsoft.Maps.Map {
        return (<any>this).getMap();
    }

    /**
     * Returns a MapLabel instance for the current platform that can be used as a tooltip.
     * This method only generates the map label. Content and placement is the responsibility
     * of the caller. Note that this method returns null until OnLoad has been called.
     *
     * @returns - The label to be used for the tooltip.
     * @memberof BingCanvasOverlay
     * @method
     */
    public GetToolTipOverlay(): MapLabel {
        const o: { [key: string]: any } = {
            align: 'left',
            offset: new Microsoft.Maps.Point(0, 25),
            backgroundColor: 'bisque',
            hidden: true,
            fontSize: 12,
            fontColor: '#000000',
            strokeWeight: 0
        };
        const label: MapLabel = new BingMapLabel(o);
        label.SetMap(this.GetMap());
        return label;
    }

    /**
     * CanvasOverlay loaded, attach map events for updating canvas.
     * @abstract
     * @method
     * @memberof BingCanvasOverlay
     */
    public OnLoad() {
        const map: Microsoft.Maps.Map = (<any>this).getMap();

        // Get the current map view information.
        this._zoomStart = map.getZoom();
        this._centerStart = <ILatLong>map.getCenter();

        // Redraw the canvas.
        this.Redraw(true);

        // When the map moves, move the canvas accordingly.
        this._viewChangeEvent = Microsoft.Maps.Events.addHandler(map, 'viewchange', (e) => {
            if (map.getMapTypeId() === Microsoft.Maps.MapTypeId.streetside) {
                // Don't show the canvas if the map is in Streetside mode.
                this._canvas.style.display = 'none';
            }
            else {
                // Re-drawing the canvas as it moves would be too slow. Instead, scale and translate canvas element.
                const zoomCurrent: number = map.getZoom();
                const centerCurrent: Microsoft.Maps.Location = map.getCenter();

                // Calculate map scale based on zoom level difference.
                const scale: number = Math.pow(2, zoomCurrent - this._zoomStart);

                // Calculate the scaled dimensions of the canvas.
                const newWidth: number = map.getWidth() * scale;
                const newHeight: number = map.getHeight() * scale;

                // Calculate offset of canvas based on zoom and center offsets.
                const pixelPoints: Array<Microsoft.Maps.Point> = <Array<Microsoft.Maps.Point>>map.tryLocationToPixel([
                        BingConversions.TranslateLocation(this._centerStart),
                        centerCurrent
                    ], Microsoft.Maps.PixelReference.control);
                const centerOffsetX: number = pixelPoints[1].x - pixelPoints[0].x;
                const centerOffsetY: number = pixelPoints[1].y - pixelPoints[0].y;
                const x: number = (-(newWidth - map.getWidth()) / 2) - centerOffsetX;
                const y: number = (-(newHeight - map.getHeight()) / 2) - centerOffsetY;

                // Update the canvas CSS position and dimensions.
                this.UpdatePosition(x, y, newWidth, newHeight);
            }
        });

        // When the map stops moving, render new data on the canvas.
        this._viewChangeEndEvent = Microsoft.Maps.Events.addHandler(map, 'viewchangeend', (e) => {
            this.UpdateCanvas();
        });

        // Update the position of the overlay when the map is resized.
        this._mapResizeEvent = Microsoft.Maps.Events.addHandler(map, 'mapresize', (e) => {
            this.UpdateCanvas();
        });

        // set the overlay to ready state
        this._readyResolver(true);
    }

    /**
     * Sets the map for the label. Settings this to null remove the label from hte map.
     *
     * @param map - Map to associated with the label.
     * @memberof CanvasOverlay
     * @method
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

    ///
    /// Protected methods
    ///

    /**
     * Attaches the canvas to the map.
     * @memberof CanvasOverlay
     * @method
     */
    protected SetCanvasElement(el: HTMLCanvasElement): void {
        (<any>this).setHtmlElement(el);
    }

    /**
     * Remove the map event handlers.
     * @memberof CanvasOverlay
     * @method
     * @protected
     */
    protected RemoveEventHandlers(): void {
        // Remove all event handlers from the map.
        Microsoft.Maps.Events.removeHandler(this._viewChangeEvent);
        Microsoft.Maps.Events.removeHandler(this._viewChangeEndEvent);
        Microsoft.Maps.Events.removeHandler(this._mapResizeEvent);
    }

    /**
     * Updates the Canvas size based on the map size.
     * @memberof CanvasOverlay
     * @method
     * @protected
     */
    protected Resize(): void {
        const map: Microsoft.Maps.Map = (<any>this).getMap();

        // Clear canvas by updating dimensions. This also ensures canvas stays the same size as the map.
        this._canvas.width = map.getWidth();
        this._canvas.height = map.getHeight();
    }

    /**
     * Updates the Canvas.
     * @memberof CanvasOverlay
     * @method
     * @protected
     */
    protected UpdateCanvas(): void {
        const map: Microsoft.Maps.Map = (<any>this).getMap();

        // Only render the canvas if it isn't in streetside mode.
        if (map.getMapTypeId() !== Microsoft.Maps.MapTypeId.streetside) {
            this._canvas.style.display = '';

            // Reset CSS position and dimensions of canvas.
            this.UpdatePosition(0, 0, map.getWidth(), map.getHeight());

            // Redraw the canvas.
            this.Redraw(true);

            // Get the current map view information.
            this._zoomStart = map.getZoom();
            this._centerStart = <ILatLong>map.getCenter();
        }
    }
}

function define(obj: any, field: string, newProperty: any){
     if (typeof newProperty !== 'undefined') {
         Object.defineProperty(obj, field, newProperty);
     }
}

/**
 * Helper function to extend the OverlayView into the CanvasOverlay
 *
 * @export
 * @method
 */
export function MixinCanvasOverlay() {
    const x = BingCanvasOverlay.prototype;

    define(BingCanvasOverlay, 'prototype', new Microsoft.Maps.CustomOverlay());

    for (const y in x) {
        if ((<any>x)[y] != null) {
            define(BingCanvasOverlay.prototype, y, (<any>x)[y]);
        }
    }

    define(BingCanvasOverlay.prototype, 'onAdd', x['OnAdd']);
    define(BingCanvasOverlay.prototype, 'onLoad', x['OnLoad']);
    define(BingCanvasOverlay.prototype, 'onRemove', x['OnRemove']);
}
