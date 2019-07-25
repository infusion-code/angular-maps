import { ILatLong } from '../../interfaces/ilatlong';
import { GoogleConversions } from '../../services/google/google-conversions';
import { CanvasOverlay } from '../canvas-overlay';
import { MapLabel } from '../map-label';
import { GoogleMapLabel } from './google-label';
import * as GoogleMapTypes from '../../services/google/google-map-types';
declare var google: any;

/**
 * Concrete implementing a canvas overlay to be placed on the map for Google Maps.
 *
 * @export
 */
export class GoogleCanvasOverlay extends CanvasOverlay {

    ///
    /// field declarations
    ///
    private _viewChangeEndEvent: GoogleMapTypes.MapsEventListener;
    private _mapResizeEvent: GoogleMapTypes.MapsEventListener;

    /**
     * Creates a new instance of the GoogleCanvasOverlay class.
     * @param drawCallback A callback function that is triggered when the canvas is ready to be
     * rendered for the current map view.
     * @memberof GoogleCanvasOverlay
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
     * @param e - The mouse event.
     * @returns - {@link ILatLong} containing the geo coordinates of the clicked marker.
     * @memberof GoogleCanvasOverlay
     */
    public GetCoordinatesFromClick(e: GoogleMapTypes.MouseEvent): ILatLong {
        if (!e) { return null; }
        if (!e.latLng) { return null; }
        if (!e.latLng.lat || !e.latLng.lng) { return null; }
        return { latitude: e.latLng.lat(), longitude: e.latLng.lng() };
    }

    /**
     * Gets the map associted with the label.
     *
     * @memberof GoogleCanvasOverlay
     * @method
     */
    public GetMap(): GoogleMapTypes.GoogleMap {
        return (<any>this).getMap();
    }

    /**
     * Returns a MapLabel instance for the current platform that can be used as a tooltip.
     * This method only generates the map label. Content and placement is the responsibility
     * of the caller.
     *
     * @returns - The label to be used for the tooltip.
     * @memberof GoogleCanvasOverlay
     * @method
     */
    public GetToolTipOverlay(): MapLabel {
        const o: { [key: string]: any } = {
            align: 'left',
            offset: new google.maps.Point(0, 25),
            backgroundColor: 'bisque',
            hidden: true,
            fontSize: 12,
            fontColor: '#000000',
            strokeWeight: 0
        };
        o.zIndex = 100000;
        const label: MapLabel = new GoogleMapLabel(o);
        label.SetMap(this.GetMap());
        return label;
    }

    /**
     * Called when the custom overlay is added to the map. Triggers Onload....
     * @memberof GoogleCanvasOverlay
     */
    public OnAdd(): void {
        super.OnAdd();
        this.OnLoad();
        this._canvas.style.zIndex = '100';
            // move the canvas above primitives such as polygons.

        // set the overlay to ready state
        this._readyResolver(true);
    }

    /**
     * Called whenever the canvas needs to be redrawn. This method does not do the actual
     * update, it simply scales the canvas. The actual redraw happens once the map is idle.
     * @memberof GoogleCanvasOverly
     * @method
     */
    public OnDraw(): void {
        const isStreetView: boolean = false;
        const map: GoogleMapTypes.GoogleMap = this.GetMap();

        if (isStreetView) {
            // Don't show the canvas if the map is in Streetside mode.
            this._canvas.style.display = 'none';
        }
        else {
            // Re-drawing the canvas as it moves would be too slow. Instead, scale and translate canvas element.
            // Upon idle or drag end, we can then redraw the canvas....
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
            const projection = (<any>this).getProjection();
            const cc = projection.fromLatLngToDivPixel(centerCurrent);

            // Update the canvas CSS position and dimensions.
            this.UpdatePosition(cc.x - newWidth / 2, cc.y - newHeight / 2, newWidth, newHeight);
        }
    }

    /**
     * CanvasOverlay loaded, attach map events for updating canvas.
     * @method
     * @memberof GoogleCanvasOverlay
     */
    public OnLoad(): void {
        const isStreetView: boolean = false;
        const map: GoogleMapTypes.GoogleMap = (<any>this).getMap();

        // Get the current map view information.
        this._zoomStart = map.getZoom();
        const c: GoogleMapTypes.LatLng = map.getCenter();
        this._centerStart = {
            latitude: c.lat(),
            longitude: c.lng()
        };

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
     */
    protected SetCanvasElement(el: HTMLCanvasElement): void {
        const panes = (<any>this).getPanes();
        if (panes) {
            if (el != null) {
                panes.overlayLayer.appendChild(el);
                // 4: floatPane (infowindow)
                // 3: overlayMouseTarget (mouse events)
                // 2: markerLayer (marker images)
                // 1: overlayLayer (polygons, polylines, ground overlays, tile layer overlays)
                // 0: mapPane (lowest pane above the map tiles)
            }
            else {
                panes.overlayLayer.removeChild(this._canvas);
            }
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
        if (this._viewChangeEndEvent) { google.maps.event.removeListener(this._viewChangeEndEvent); }
        if (this._mapResizeEvent) { google.maps.event.removeListener(this._mapResizeEvent); }
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
            const centerPoint = (<any>this).getProjection().fromLatLngToDivPixel(map.getCenter());
            this.UpdatePosition((centerPoint.x - w / 2), (centerPoint.y - h / 2), w, h);

            // Redraw the canvas.
            this.Redraw(true);

            // Get the current map view information.
            this._zoomStart = map.getZoom();
            const c: GoogleMapTypes.LatLng = map.getCenter();
            this._centerStart = {
                latitude: c.lat(),
                longitude: c.lng()
            };
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

    Object.defineProperty(GoogleCanvasOverlay, 'prototype', new google.maps.OverlayView);

    for (const y in x) {
        if ((<any>x)[y] != null) {
            (Object.defineProperty(GoogleCanvasOverlay.prototype, y, (<any>x)[y]));
        }
    }

    (Object.defineProperty(GoogleCanvasOverlay.prototype, 'onAdd', x['OnAdd']));
    (Object.defineProperty(GoogleCanvasOverlay.prototype, 'onDraw', x['OnDraw']));
    (Object.defineProperty(GoogleCanvasOverlay.prototype, 'onRemove', x['OnRemove']));
}
