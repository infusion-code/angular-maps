import { ILatLong } from '../../interfaces/ilatlong';
import { GoogleConversions } from './../../services/google/google-conversions';
import { CanvasOverlay } from '../canvas-overlay';
import * as GoogleMapTypes from '../../services/google/google-map-types';
declare var google: any;

/**
 * Concrete implementing a canvas overlay to be placed on the map for Google Maps.
 *
 * @export
 * @class GoogleCanvasOverlay
 */
export class GoogleCanvasOverlay extends CanvasOverlay {

    ///
    /// field declarations
    ///
    private _viewChangeEvent: GoogleMapTypes.MapsEventListener;
    private _viewChangeEndEvent: GoogleMapTypes.MapsEventListener;
    private _mapResizeEvent: GoogleMapTypes.MapsEventListener;


    /**
     * Creates a new instance of the GoogleCanvasOverlay class.
     * @param  {HTMLCanvasElements => void} drawCallback A callback function that is triggered when the canvas is ready to be
     * rendered for the current map view.
     * @memberof GoogleCanvasOverlay
     * @constructor
     */
    constructor(drawCallback: (canvas: HTMLCanvasElement) => void) {
        super(drawCallback);
    }

    ///
    /// Public methods
    ///

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
     * CanvasOverlay loaded, attach map events for updating canvas.
     * @method
     * @public
     * @memberof GoogleCanvasOverlay
     */
    public OnLoad() {
        const isStreetView: boolean = false;
        const map: GoogleMapTypes.GoogleMap = (<any>this).getMap();

        // Get the current map view information.
        this._zoomStart = map.getZoom();
        const c: GoogleMapTypes.LatLng = map.getCenter();
        this._centerStart = {
            latitude: c.lat(),
            longitude: c.lng()
        }

        // Redraw the canvas.
        this.Redraw();

        // When the map moves, move the canvas accordingly.
        this._viewChangeEvent = google.maps.event.addListener(map, 'bounds_changed', (e: any) => {
            const translateToPoint = function(latlng: GoogleMapTypes.LatLng): GoogleMapTypes.Point {
                const projection = map.getProjection();
                const scale: number = Math.pow(2, map.getZoom());
                const bounds: GoogleMapTypes.LatLngBounds = map.getBounds();
                const topRight: GoogleMapTypes.Point = projection.fromLatLngToPoint(bounds.getNorthEast());
                const bottomLeft: GoogleMapTypes.Point = projection.fromLatLngToPoint(bounds.getSouthWest());
                const point: GoogleMapTypes.Point = projection.fromLatLngToPoint(latlng);
                return new google.maps.Point(Math.floor((point.x - bottomLeft.x) * scale), Math.floor((point.y - topRight.y) * scale));
            }

            if (isStreetView) {
                // Don't show the canvas if the map is in Streetside mode.
                this._canvas.style.display = 'none';
            }
            else {
                // Re-drawing the canvas as it moves would be too slow. Instead, scale and translate canvas element.
                const zoomCurrent: number = map.getZoom();
                const centerCurrent: GoogleMapTypes.LatLng = map.getCenter();

                // Calculate map scale based on zoom level difference.
                const scale: number = Math.pow(2, zoomCurrent - this._zoomStart);

                // Calculate the scaled dimensions of the canvas.
                const el: HTMLDivElement = map.getDiv();
                const w: number = el.offsetWidth;
                const h: number = el.offsetHeight;
                const newWidth: number = w * scale;
                const newHeight: number = h * scale;

                // Calculate offset of canvas based on zoom and center offsets.
                const pixelPoints: Array<GoogleMapTypes.Point> = [
                    translateToPoint(GoogleConversions.TranslateLocationObject(this._centerStart)),
                    translateToPoint(centerCurrent)
                ]
                const centerOffsetX: number = pixelPoints[1].x - pixelPoints[0].x;
                const centerOffsetY: number = pixelPoints[1].y - pixelPoints[0].y;
                const x: number = (-(newWidth - w) / 2) - centerOffsetX;
                const y: number = (-(newHeight - h) / 2) - centerOffsetY;

                // Update the canvas CSS position and dimensions.
                this.UpdatePosition(x, y, newWidth, newHeight);
            }
        });

        // When the map stops moving, render new data on the canvas.
        this._viewChangeEndEvent = google.maps.event.addListener(map, 'idle', (e: any) => {
            this.UpdateCanvas();
        });

        // Update the position of the overlay when the map is resized.
        this._mapResizeEvent = google.maps.event.addListener(map, 'resize', (e: any) => {
            this.UpdateCanvas();
        });
    }

    /**
     * Associates the cnavas overlay with a map.
     * @method
     * @public
     * @memberof GoogleCanvasOverlay
     */
    public SetMap(map: GoogleMapTypes.GoogleMap): void {
        (<any>this).setMap(map);
    }

    ///
    /// Protected methods
    ///

    /**
     * Attaches the canvas to the map.
     * @memberof CanvasOverlay
     * @method
     * @public
     */
    protected SetCanvasElement(el: HTMLCanvasElement): void {
        const panes = (<any>this).getPanes();
        if (panes) {
            panes.overlayLayer.appendChild(el);
                // 4: floatPane (infowindow)
                // 3: overlayMouseTarget (mouse events)
                // 2: markerLayer (marker images)
                // 1: overlayLayer (polygons, polylines, ground overlays, tile layer overlays)
                // 0: mapPane (lowest pane above the map tiles)
        }
    }

    /**
     * Remove the map event handlers.
     * @memberof CanvasOverlay
     * @method
     * @protected
     */
    protected RemoveEventHandlers(): void {
        // Remove all event handlers from the map.
        google.maps.event.removeListener(this._viewChangeEvent);
        google.maps.event.removeListener(this._viewChangeEndEvent);
        google.maps.event.removeListener(this._mapResizeEvent);
    }

    /**
     * Updates the Canvas size based on the map size.
     * @memberof CanvasOverlay
     * @method
     * @protected
     */
    protected Resize(): void {
        const map: GoogleMapTypes.GoogleMap = (<any>this).getMap();

        // Clear canvas by updating dimensions. This also ensures canvas stays the same size as the map.
        const el: HTMLDivElement = map.getDiv();
        this._canvas.width = el.offsetWidth;
        this._canvas.height = el.offsetHeight;
    }

    /**
     * Updates the Canvas.
     * @memberof CanvasOverlay
     * @method
     * @protected
     */
    protected UpdateCanvas(): void {
        const map: GoogleMapTypes.GoogleMap = (<any>this).getMap();

        // Only render the canvas if it isn't in streetside mode.
        if (true) {
            this._canvas.style.display = '';

            // Reset CSS position and dimensions of canvas.
            const el: HTMLDivElement = map.getDiv();
            const w: number = el.offsetWidth;
            const h: number = el.offsetHeight;
            this.UpdatePosition(0, 0, w, h);

            // Redraw the canvas.
            this.Redraw();

            // Get the current map view information.
            this._zoomStart = map.getZoom();
            const c: GoogleMapTypes.LatLng = map.getCenter();
            this._centerStart = {
                latitude: c.lat(),
                longitude: c.lng()
            }
        }
    }
}

/**
 * Helper function to extend the OverlayView into the CanvasOverlay
 *
 * @export
 * @method
 */
export function MixinCanvasOverlay() {
    const x = GoogleCanvasOverlay.prototype;
    GoogleCanvasOverlay.prototype = <any> new google.maps.OverlayView();
    for (const y in x) { if ((<any>x)[y] != null) { (<any>GoogleCanvasOverlay.prototype)[y] = (<any>x)[y]; }}
    (<any>GoogleCanvasOverlay.prototype)['onAdd'] = x['OnAdd'];
    (<any>GoogleCanvasOverlay.prototype)['draw'] = x['OnLoad'];
    (<any>GoogleCanvasOverlay.prototype)['onRemove'] = x['OnRemove'];
}
