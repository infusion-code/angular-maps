import { GoogleMarker } from './google-marker';
import { IClusterOptions } from '../../interfaces/icluster-options';
import { MapService } from '../../services/map.service';
import { Layer } from '../layer';
import { Marker } from '../marker';
import { InfoWindow } from '../info-window';
import { ClusterPlacementMode } from '../cluster-placement-mode';
import * as GoogleMapTypes from '../../services/google/google-map-types';
import { timer } from 'rxjs';

/**
 * Concrete implementation of a clustering layer for the Google Map Provider.
 *
 * @export
 */
export class GoogleMarkerClusterer implements Layer {

    ///
    /// Field declarations
    ///
    private _isClustering = true;
    private _markerLookup: Map<GoogleMapTypes.Marker, Marker> = new Map<GoogleMapTypes.Marker, Marker>();
    private _markers: Array<Marker> = new Array<Marker>();
    private _pendingMarkers: Array<Marker> = new Array<Marker>();
    private _mapclicks: number = 0;
    private _currentZoom: number = 0;
    private _visible: boolean = true;

    ///
    /// Property definitions
    ///

    /**
     * Get the native primitive underneath the abstraction layer.
     *
     * @returns GoogleMapTypes.MarkerClusterer.
     *
     * @memberof GoogleMarkerClusterer
     */
    public get NativePrimitve(): GoogleMapTypes.MarkerClusterer {
        return this._layer;
    }

    ///
    /// Constructor
    ///

    /**
     * Creates a new instance of the GoogleMarkerClusterer class.
     *
     * @param _layer GoogleMapTypes.MarkerClusterer. Native Google Maps Marker Clusterer supporting the cluster layer.
     * @param _maps MapService. MapService implementation to leverage for the layer.
     *
     * @memberof GoogleMarkerClusterer
     */
    constructor(private _layer: GoogleMapTypes.MarkerClusterer) { }


    ///
    /// Public methods, Layer interface implementation
    ///

    /**
     * Adds an event listener for the layer.
     *
     * @param eventType string. Type of event to add (click, mouseover, etc). You can use any event that the underlying native
     * layer supports.
     * @param fn function. Handler to call when the event occurs.
     *
     * @memberof GoogleMarkerClusterer
     */
    public AddListener(eventType: string, fn: Function): void {
        throw (new Error('Events are not supported on Google Cluster Layers. You can still add events to individual markers.'));
    }

    /**
     * Adds an entity to the layer. Use this method with caution as it will
     * trigger a recaluation of the clusters (and associated markers if approprite) for
     * each invocation. If you use this method to add many markers to the cluster, use
     *
     * @param entity Marker. Entity to add to the layer.
     *
     * @memberof GoogleMarkerClusterer
     */
    public AddEntity(entity: Marker): void {
        let isMarker: boolean = entity instanceof Marker;
        isMarker = entity instanceof GoogleMarker || isMarker;
        if (isMarker) {
            entity.NativePrimitve.setMap(null);
                // remove the marker from the map as the clusterer will control marker visibility.
            if (entity.IsFirst) {
                this.StopClustering();
            }
        }
        if (entity.NativePrimitve && entity.Location) {
            if (this._isClustering && this._visible) {
                this._layer.addMarker(entity.NativePrimitve);
                this._markers.push(entity);
            }
            else {
                this._pendingMarkers.push(entity);
            }
            this._markerLookup.set(entity.NativePrimitve, entity);
        }
        if (isMarker) {
            if (entity.IsLast) {
                this.StartClustering();
            }
        }
    }

    /**
     * Adds a number of markers to the layer.
     *
     * @param entities Array<Marker>. Entities to add to the layer.
     *
     * @memberof GoogleMarkerClusterer
     */
    public AddEntities(entities: Array<Marker>): void {
        if (entities != null && Array.isArray(entities) && entities.length !== 0 ) {
            const e: Array<GoogleMapTypes.Marker> = entities.map(p => {
                this._markerLookup.set(p.NativePrimitve, p);
                p.NativePrimitve.setMap(null);
                    // remove the marker from the map as the clusterer will control marker visibility.
                return p.NativePrimitve;
            });
            if (this._isClustering && this._visible) {
                this._layer.addMarkers(e);
                this._markers.push(...entities);
            }
            else {
                // if layer is not visible, always add to pendingMarkers. Setting the layer to visible later
                // will render the markers appropriately
                this._pendingMarkers.push(...entities);
            }
        }
    }

    /**
     * Deletes the clustering layer.
     *
     * @memberof GoogleMarkerClusterer
     */
    public Delete(): void {
        this._layer.getMarkers().forEach(m => {
            m.setMap(null);
                // remove the marker from the map as the clusterer will control marker visibility.
        });
        this._layer.clearMarkers();
        this._markers.splice(0);
        this._pendingMarkers.splice(0);
    }

    /**
     * Returns the abstract marker used to wrap the Google Marker.
     *
     * @returns Marker. The abstract marker object representing the pushpin.
     *
     * @memberof GoogleMarkerClusterer
     */
    public GetMarkerFromGoogleMarker(pin: GoogleMapTypes.Marker): Marker {
        const m: Marker = this._markerLookup.get(pin);
        return m;
    }

    /**
     * Returns the options governing the behavior of the layer.
     *
     * @returns IClusterOptions. The layer options.
     *
     * @memberof GoogleMarkerClusterer
     */
    public GetOptions(): IClusterOptions {
        const options: IClusterOptions = {
            id: 0,
            gridSize: this._layer.getGridSize(),
            clusteringEnabled: this._layer.getGridSize() === 0,
            maxZoom: this._layer.getMaxZoom(),
            minimumClusterSize: this._layer.getMinClusterSize(),
            placementMode: this._layer.isAverageCenter() ? ClusterPlacementMode.MeanValue : ClusterPlacementMode.FirstPin,
            visible: this._visible,
            zoomOnClick: this._layer.isZoomOnClick(),
            styles: this._layer.getStyles()
        };
        return options;
    }

    /**
     * Returns the visibility state of the layer.
     *
     * @returns Boolean. True is the layer is visible, false otherwise.
     *
     * @memberof GoogleMarkerClusterer
     */
    public GetVisible(): boolean {
        return this._visible;
    }

    /**
     * Removes an entity from the cluster layer.
     *
     * @param entity Marker Entity to be removed from the layer.
     *
     * @memberof GoogleMarkerClusterer
     */
    public RemoveEntity(entity: Marker): void {
        if (entity.NativePrimitve && entity.Location) {
            const j: number = this._markers.indexOf(entity);
            const k: number = this._pendingMarkers.indexOf(entity);
            if (j > -1) { this._markers.splice(j, 1); }
            if (k > -1) { this._pendingMarkers.splice(k, 1); }
            if (this._isClustering) {
                this._layer.removeMarker(entity.NativePrimitve);
            }
            this._markerLookup.delete(entity.NativePrimitve);
        }
    }

    /**
     * Sets the entities for the cluster layer.
     *
     * @param entities Array<Marker> containing
     * the entities to add to the cluster. This replaces any existing entities.
     *
     * @memberof GoogleMarkerClusterer
     */
    public SetEntities(entities: Array<Marker>): void {
        this._layer.getMarkers().forEach(m => {
            m.setMap(null);
        });
        this._layer.clearMarkers();
        this._markers.splice(0);
        this._pendingMarkers.splice(0);
        this._markerLookup.clear();

        const p: Array<GoogleMapTypes.Marker> = new Array<GoogleMapTypes.Marker>();
        entities.forEach((e: any) => {
            if (e.NativePrimitve && e.Location) {
                e.NativePrimitve.setMap(null);
                this._markerLookup.set(e.NativePrimitve, e);
                if (this._visible) {
                    this._markers.push(e);
                    p.push(e.NativePrimitve);
                }
                else {
                    this._pendingMarkers.push(e);
                }
            }
        });
        this._layer.addMarkers(p);
    }

    /**
     * Sets the options for the cluster layer.
     *
     * @param options IClusterOptions containing the options enumeration controlling the layer behavior. The supplied options
     * are merged with the default/existing options.
     *
     * @memberof GoogleMarkerClusterer
     */
    public SetOptions(options: IClusterOptions): void {
        if (options.placementMode != null) {
            throw(new Error('GoogleMarkerClusterer: PlacementMode option cannot be set after initial creation.'));
        }
        if (options.zoomOnClick != null) {
            throw(new Error('GoogleMarkerClusterer: ZoomOnClick option cannot be set after initial creation.'));
        }
        if (options.callback != null) {}
        if (options.clusteringEnabled != null) {
            this._layer.setMinClusterSize(options.clusteringEnabled ? 1 : 10000000);
            this._layer.resetViewport();
            this._layer.redraw();
        }
        if (options.gridSize != null && (options.clusteringEnabled == null || options.clusteringEnabled)) {
            this._layer.setGridSize(options.gridSize);
            this._layer.resetViewport();
            this._layer.redraw();
        }
        if (options.maxZoom != null) { this._layer.setMaxZoom(options.maxZoom); }
        if (options.minimumClusterSize != null) { this._layer.setMinClusterSize(options.minimumClusterSize); }
        if (options.styles != null) { this._layer.setStyles(options.styles); }
        if (options.visible != null) { this.SetVisible(options.visible); }
    }

    /**
     * Toggles the cluster layer visibility.
     *
     * @param visible Boolean true to make the layer visible, false to hide the layer.
     *
     * @memberof GoogleMarkerClusterer
     */
    public SetVisible(visible: boolean): void {
        const map: GoogleMapTypes.GoogleMap = visible ? this._layer.getMap() : null;
        if (!visible) {
            this._layer.resetViewport(true);
        }
        else {
            const p: Array<GoogleMapTypes.Marker> = new Array<GoogleMapTypes.Marker>();
            if (this._pendingMarkers.length > 0) {
                this._pendingMarkers.forEach(e => {
                    if (e.NativePrimitve && e.Location) {
                        p.push(<GoogleMapTypes.Marker>e.NativePrimitve);
                    }
                });
                this._layer.addMarkers(p);
                this._markers = this._markers.concat(this._pendingMarkers.splice(0));
            }
            else {
                this._layer.redraw();
            }
        }
        this._visible = visible;
    }

    /**
     * Start to actually cluster the entities in a cluster layer. This method should be called after the initial set of entities
     * have been added to the cluster. This method is used for performance reasons as adding an entitiy will recalculate all clusters.
     * As such, StopClustering should be called before adding many entities and StartClustering should be called once adding is
     * complete to recalculate the clusters.
     *
     * @memberof GoogleMarkerClusterer
     */
    public StartClustering(): void {
        if (this._isClustering) { return; }

        if (this._visible) {
            const p: Array<GoogleMapTypes.Marker> = new Array<GoogleMapTypes.Marker>();
            this._markers.forEach(e => {
                if (e.NativePrimitve && e.Location) {
                    p.push(<GoogleMapTypes.Marker>e.NativePrimitve);
                }
            });
            this._pendingMarkers.forEach(e => {
                if (e.NativePrimitve && e.Location) {
                    p.push(<GoogleMapTypes.Marker>e.NativePrimitve);
                }
            });
            this._layer.addMarkers(p);
            this._markers = this._markers.concat(this._pendingMarkers.splice(0));
        }

        if (!this._visible) {
            // only add the markers if the layer is visible. Otherwise, keep them pending. They would be added once the
            // layer is set to visible.
            timer(0).subscribe(() => {
                this._layer.resetViewport(true);
            });
        }
        this._isClustering = true;
    }

    /**
     * Stop to actually cluster the entities in a cluster layer.
     * This method is used for performance reasons as adding an entitiy will recalculate all clusters.
     * As such, StopClustering should be called before adding many entities and StartClustering should be called once adding is
     * complete to recalculate the clusters.
     *
     * @returns
     *
     * @memberof GoogleMarkerClusterer
     */
    public StopClustering() {
        if (!this._isClustering) { return; }
        this._isClustering = false;
    }
}
