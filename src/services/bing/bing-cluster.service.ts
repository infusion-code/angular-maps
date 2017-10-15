import { Injectable, NgZone } from '@angular/core';
import { IMarkerOptions } from './../../interfaces/imarker-options';
import { IPolygonOptions } from './../../interfaces/ipolygon-options';
import { IPolylineOptions } from './../../interfaces/ipolyline-options';
import { IClusterOptions } from './../../interfaces/icluster-options';
import { IMarkerIconInfo } from './../../interfaces/imarker-icon-info';
import { Marker } from './../../models/marker';
import { Polygon } from './../../models/polygon';
import { Polyline } from './../../models/polyline';
import { BingMarker } from './../../models/bing/bing-marker';
import { BingClusterLayer } from './../../models/bing/bing-cluster-layer';
import { Layer } from './../../models/layer';
import { MarkerTypeId } from './../../models/marker-type-id';
import { ClusterClickAction } from './../../models/cluster-click-action';
import { MapService } from './../map.service';
import { ClusterLayerDirective } from './../../components/cluster-layer';
import { ClusterService } from './../cluster.service';
import { BingLayerBase } from './bing-layer-base';
import { BingMapService } from './bing-map.service';
import { BingConversions } from './bing-conversions';

/**
 * Implements the {@link ClusterService} contract for a  Bing Maps V8 specific implementation.
 *
 * @export
 * @class BingClusterService
 * @extends {BingLayerBase}
 * @implements {ClusterService}
 */
@Injectable()
export class BingClusterService extends BingLayerBase implements ClusterService {

    ///
    /// Field declarations
    ///
    protected _layers: Map<number, Promise<Layer>> = new Map<number, Promise<Layer>>();

    ///
    /// Constructor
    ///

    /**
     * Creates an instance of BingClusterService.
     * @param {MapService} _mapService - Concrete {@link MapService} implementation for Bing Maps V8. An instance of {@link BingMapService}.
     * @param {NgZone} _zone - NgZone instance to provide zone aware promises.
     *
     * @memberof BingClusterService
     */
    constructor(_mapService: MapService, private _zone: NgZone) {
        super(_mapService);
    }

    ///
    /// Public methods
    ///

    /**
     * Adds a layer to the map.
     *
     * @abstract
     * @param {ClusterLayerDirective} layer - ClusterLayerDirective component object.
     * Generally, MapLayer will be injected with an instance of the
     * LayerService and then self register on initialization.
     *
     * @memberof BingClusterService
     */
    public AddLayer(layer: ClusterLayerDirective): void {
        const options: IClusterOptions = {
            id: layer.Id,
            visible: layer.Visible,
            clusteringEnabled: layer.ClusteringEnabled,
            placementMode: layer.ClusterPlacementMode
        };
        if (layer.GridSize) { options.gridSize = layer.GridSize; }
        if (layer.LayerOffset) { options.layerOffset = layer.LayerOffset; }
        if (layer.ZIndex) { options.zIndex = layer.ZIndex; }
        if (layer.IconInfo) {
            options.clusteredPinCallback = (pin: Microsoft.Maps.ClusterPushpin) => { this.CreateClusterPushPin(pin, layer); };
        }
        if (layer.CustomMarkerCallback) {
            options.clusteredPinCallback = (pin: Microsoft.Maps.ClusterPushpin) => { this.CreateCustomClusterPushPin(pin, layer); };
        }
        if (layer.SpiderClusterOptions) { options.spiderClusterOptions = layer.SpiderClusterOptions; }

        const layerPromise: Promise<Layer> = this._mapService.CreateClusterLayer(options);
        (<BingMapService>this._mapService).MapPromise.then(m => {
            Microsoft.Maps.Events.addHandler(m, 'viewchangeend', (e) => {
                if (layer.ClusteringEnabled && m.getZoom() === 19) {
                    layerPromise.then((l: BingClusterLayer) => {
                        l.SetOptions({ id: layer.Id, clusteringEnabled: false })
                    });
                }
                if (layer.ClusteringEnabled && m.getZoom() < 19) {
                    layerPromise.then((l: BingClusterLayer) => {
                        if (!l.GetOptions().clusteringEnabled) {
                            l.SetOptions({ id: layer.Id, clusteringEnabled: true });
                        }
                    });
                }
            })
        });
        this._layers.set(layer.Id, layerPromise);
    }

    /**
     * Adds a polygon to the layer.
     *
     * @abstract
     * @param {number} layer - The id of the layer to which to add the polygon.
     * @param {IPolygonOptions} options - Polygon options defining the polygon.
     * @returns {Promise<Polygon>} - A promise that when fullfilled contains the an instance of the Polygon model.
     *
     * @memberof BingClusterService
     */
    public CreatePolygon(layer: number, options: IPolygonOptions): Promise<Polygon> {
        throw (new Error('Polygons are not supported in clustering layers. You can only use markers.'));
    }

    /**
     * Creates an array of unbound polygons. Use this method to create arrays of polygons to be used in bulk
     * operations.
     *
     * @param {number} layer - The id of the layer to which to add the polygon.
     * @param {Array<IPolygonOptions>} options - Polygon options defining the polygons.
     * @returns {Promise<Array<Polygon>>} - A promise that when fullfilled contains the an arrays of the Polygon models.
     *
     * @memberof BingClusterService
     */
    public CreatePolygons(layer: number, options: Array<IPolygonOptions>): Promise<Array<Polygon>> {
        throw (new Error('Polygons are not supported in clustering layers. You can only use markers.'));
    }

    /**
     * Adds a polyline to the layer.
     *
     * @abstract
     * @param {number} layer - The id of the layer to which to add the line.
     * @param {IPolylineOptions} options - Polyline options defining the line.
     * @returns {Promise<Polyline|ArraY<Polyline>>} - A promise that when fullfilled contains the an instance of the Polyline (or an array
     * of polygons for complex paths) model.
     *
     * @memberof BingClusterService
     */
    public CreatePolyline(layer: number, options: IPolylineOptions): Promise<Polyline|Array<Polyline>> {
        throw (new Error('Polylines are not supported in clustering layers. You can only use markers.'));
    }

    /**
     * Creates an array of unbound polylines. Use this method to create arrays of polylines to be used in bulk
     * operations.
     *
     * @param {number} layer - The id of the layer to which to add the polylines.
     * @param {Array<IPolylineOptions>} options - Polyline options defining the polylines.
     * @returns {Promise<Array<Polyline|Array<Polyline>>>} - A promise that when fullfilled contains the an arrays of the Polyline models.
     *
     * @memberof BingClusterService
     */
    public CreatePolylines(layer: number, options: Array<IPolylineOptions>): Promise<Array<Polyline|Array<Polyline>>> {
        throw (new Error('Polylines are not supported in clustering layers. You can only use markers.'));
    }

    /**
     * Returns the Layer model represented by this layer.
     *
     * @abstract
     * @param {ClusterLayerDirective} layer - ClusterLayerDirective component object for which to retrieve the layer model.
     * @returns {Promise<Layer>} - A promise that when resolved contains the Layer model.
     *
     * @memberof BingClusterService
     */
    public GetNativeLayer(layer: ClusterLayerDirective): Promise<Layer> {
        return this._layers.get(layer.Id);
    }

    /**
     * Deletes the layer
     *
     * @abstract
     * @param {ClusterLayerDirective} layer - ClusterLayerDirective component object for which to retrieve the layer.
     * @returns {Promise<void>} - A promise that is fullfilled when the layer has been removed.
     *
     * @memberof BingClusterService
     */
    public DeleteLayer(layer: ClusterLayerDirective): Promise<void> {
        const l = this._layers.get(layer.Id);
        if (l == null) {
            return Promise.resolve();
        }
        return l.then((l1: Layer) => {
            return this._zone.run(() => {
                l1.Delete();
                this._layers.delete(layer.Id);
            });
        });
    }

    /**
     * Start to actually cluster the entities in a cluster layer. This method should be called after the initial set of entities
     * have been added to the cluster. This method is used for performance reasons as adding an entitiy will recalculate all clusters.
     * As such, StopClustering should be called before adding many entities and StartClustering should be called once adding is
     * complete to recalculate the clusters.
     *
     * @param {ClusterLayerDirective} layer - ClusterLayerDirective component object for which to retrieve the layer.
     * @returns {Promise<void>}
     *
     * @memberof BingClusterService
     */
    public StartClustering(layer: ClusterLayerDirective): Promise<void> {
        const l = this._layers.get(layer.Id);
        if (l == null) {
            return Promise.resolve();
        }
        return l.then((l1: BingClusterLayer) => {
            return this._zone.run(() => {
                l1.StartClustering();
            });
        });
    }

    /**
     * Stop to actually cluster the entities in a cluster layer.
     * This method is used for performance reasons as adding an entitiy will recalculate all clusters.
     * As such, StopClustering should be called before adding many entities and StartClustering should be called once adding is
     * complete to recalculate the clusters.
     *
     * @param {ClusterLayerDirective} layer - ClusterLayerDirective component object for which to retrieve the layer.
     * @returns {Promise<void>}
     *
     * @memberof BingClusterService
     */
    public StopClustering(layer: ClusterLayerDirective): Promise<void> {
        const l = this._layers.get(layer.Id);
        if (l == null) {
            return Promise.resolve();
        }
        return l.then((l1: BingClusterLayer) => {
            return this._zone.run(() => {
                l1.StopClustering();
            });
        });
    }

    ///
    /// Private methods
    ///

    /**
     * Creates the default cluster pushpin as a callback from BingMaps when clustering occurs. The {@link ClusterLayerDirective} model
     * can provide an IconInfo property that would govern the apparenace of the pin. This method will assign the same pin to all
     * clusters in the layer.
     *
     * @private
     * @param {Microsoft.Maps.ClusterPushpin} cluster - The cluster for which to create the pushpin.
     * @param {ClusterLayerDirective} layer - The {@link ClusterLayerDirective} component representing the layer.
     *
     * @memberof BingClusterService
     */
    private CreateClusterPushPin(cluster: Microsoft.Maps.ClusterPushpin, layer: ClusterLayerDirective): void {
        this._layers.get(layer.Id).then((l: BingClusterLayer) => {
            if (layer.IconInfo) {
                const o: Microsoft.Maps.IPushpinOptions = {};
                const payload: (icon: string, info: IMarkerIconInfo) => void = (icon, info) => {
                        o.icon = icon;
                        o.anchor = new Microsoft.Maps.Point(
                            (info.size && info.markerOffsetRatio) ? (info.size.width * info.markerOffsetRatio.x) : 0,
                            (info.size && info.markerOffsetRatio) ? (info.size.height * info.markerOffsetRatio.y) : 0
                        );
                        cluster.setOptions(o);
                };
                const icon: string|Promise<{icon: string, iconInfo: IMarkerIconInfo}> = Marker.CreateMarker(layer.IconInfo);
                if (typeof(icon) === 'string') {
                    payload(icon, layer.IconInfo);
                }
                else {
                    icon.then(x => {
                        payload(x.icon, x.iconInfo);
                    });
                }
            }
            if (layer.ClusterClickAction === ClusterClickAction.ZoomIntoCluster) {
                Microsoft.Maps.Events.addHandler(cluster, 'click', (e: Microsoft.Maps.IMouseEventArgs) => this.ZoomIntoCluster(e));
            }
            if (layer.ClusterClickAction === ClusterClickAction.Spider) {
                Microsoft.Maps.Events.addHandler(cluster, 'dblclick', (e: Microsoft.Maps.IMouseEventArgs) => this.ZoomIntoCluster(e));
                l.InitializeSpiderClusterSupport();
            }
        });
    }

    /**
     * Provides a hook for consumers to provide a custom function to create cluster bins for a cluster. This is particuarily useful
     * in situation where the pin should differ to represent information about the pins in the cluster.
     *
     * @private
     * @param {Microsoft.Maps.ClusterPushpin} cluster - The cluster for which to create the pushpin.
     * @param {ClusterLayerDirective} layer - The {@link ClusterLayerDirective} component
     * representing the layer. Set the {@link ClusterLayerDirective.CustomMarkerCallback}
     * property to define the callback generating the pin.
     *
     * @memberof BingClusterService
     */
    private CreateCustomClusterPushPin(cluster: Microsoft.Maps.ClusterPushpin, layer: ClusterLayerDirective): void {
        this._layers.get(layer.Id).then((l: BingClusterLayer) => {
            // assemble markers for callback
            const m: Array<Marker> = new Array<Marker>();
            cluster.containedPushpins.forEach(p => {
                const marker: Marker = l.GetMarkerFromBingMarker(p)
                if (marker) { m.push(marker); }
            });
            const iconInfo: IMarkerIconInfo = { markerType: MarkerTypeId.None };
            const o: Microsoft.Maps.IPushpinOptions = {};
            o.icon = layer.CustomMarkerCallback(m, iconInfo);
            if (o.icon !== '') {
                o.anchor = new Microsoft.Maps.Point(
                    (iconInfo.size && iconInfo.markerOffsetRatio) ? (iconInfo.size.width * iconInfo.markerOffsetRatio.x) : 0,
                    (iconInfo.size && iconInfo.markerOffsetRatio) ? (iconInfo.size.height * iconInfo.markerOffsetRatio.y) : 0
                );
                if (iconInfo.textOffset) { o.textOffset = new Microsoft.Maps.Point(iconInfo.textOffset.x, iconInfo.textOffset.y); }
                cluster.setOptions(o);
            }
            if (layer.ClusterClickAction === ClusterClickAction.ZoomIntoCluster) {
                Microsoft.Maps.Events.addHandler(cluster, 'click', (e: Microsoft.Maps.IMouseEventArgs) => this.ZoomIntoCluster(e));
            }
            if (layer.ClusterClickAction === ClusterClickAction.Spider) {
                Microsoft.Maps.Events.addHandler(cluster, 'dblclick', (e: Microsoft.Maps.IMouseEventArgs) => this.ZoomIntoCluster(e));
                l.InitializeSpiderClusterSupport();
            }
        });
    }

    /**
     * Zooms into the cluster on click so that the members of the cluster comfortable fit into the zommed area.
     *
     * @private
     * @param {Microsoft.Maps.IMouseEventArgs} e - Mouse Event.
     *
     * @memberof BingClusterService
     */
    private ZoomIntoCluster(e: Microsoft.Maps.IMouseEventArgs): void {
        const pin: Microsoft.Maps.ClusterPushpin = <Microsoft.Maps.ClusterPushpin>e.target;
        if (pin && pin.containedPushpins) {
            let bounds: Microsoft.Maps.LocationRect;
            const locs: Array<Microsoft.Maps.Location> = new Array<Microsoft.Maps.Location>();
            pin.containedPushpins.forEach(p => locs.push(p.getLocation()));
            bounds = Microsoft.Maps.LocationRect.fromLocations(locs);

            // Zoom into the bounding box of the cluster.
            // Add a padding to compensate for the pixel area of the pushpins.
            (<BingMapService>this._mapService).MapPromise.then((m: Microsoft.Maps.Map) => {
                m.setView({ bounds: bounds, padding: 75 });
            });
        }
    }

}
