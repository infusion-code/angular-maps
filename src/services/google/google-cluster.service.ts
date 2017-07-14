import { IClusterIconInfo } from '../../interfaces/icluster-icon-info';
import { MarkerService } from './../marker.service';
import { IClusterOptions } from './../../interfaces/icluster-options';
import { Injectable, NgZone } from '@angular/core';
import { IMarkerOptions } from './../../interfaces/imarker-options';
import { Marker } from './../../models/marker';
import { Layer } from './../../models/layer';
import { ClusterLayerDirective } from './../../components/cluster-layer';
import { ClusterService } from './../cluster.service';
import { MapService } from './../map.service';
import { GoogleLayerBase } from './google-layer-base';
import { IPolygonOptions } from '../../interfaces/ipolygon-options';
import { IPolylineOptions } from '../../interfaces/ipolyline-options';
import { Polygon } from '../../models/polygon';
import { Polyline } from '../../models/polyline';

@Injectable()
export class GoogleClusterService extends GoogleLayerBase implements ClusterService {

    ///
    /// Field declarations
    ///
    protected _layers: Map<ClusterLayerDirective, Promise<Layer>> = new Map<ClusterLayerDirective, Promise<Layer>>();

    ///
    /// Constructors
    ///

    /**
     * Creates an instance of GoogleClusterService.
     * @param {MapService} _mapService
     * @param {NgZone} _zone
     * @memberof GoogleClusterService
     */
    constructor(_mapService: MapService, private _zone: NgZone) {
        super(_mapService);
    }

    /**
     * Adds the cluster layer to the map
     *
     * @param {ClusterLayerDirective} layer
     * @memberof GoogleClusterService
     */
    public AddLayer(layer: ClusterLayerDirective): void {
        const options: IClusterOptions = {
            id: layer.Id,
            zoomOnClick: layer.ZoomOnClick
        };
        if (layer.GridSize) { options.gridSize = layer.GridSize; }
        if (layer.MinimumClusterSize) { options.minimumClusterSize = layer.MinimumClusterSize; }
        if (layer.Styles) { options.styles = this.CreateClusterIcons(layer.Styles); }

        const layerPromise = this._mapService.CreateClusterLayer(options);
        this._layers.set(layer, layerPromise);
    };

    /**
     * Returns the native layer
     *
     * @param {ClusterLayerDirective} layer
     * @returns {Promise<Layer>}
     * @memberof GoogleClusterService
     */
    public GetNativeLayer(layer: ClusterLayerDirective): Promise<Layer> {
        return this._layers.get(layer);
    };

    /**
     * Delets the native layer
     *
     * @param {ClusterLayerDirective} layer
     * @returns {Promise<void>}
     * @memberof GoogleClusterService
     */
    public DeleteLayer(layer: ClusterLayerDirective): Promise<void> {
        this._layers.delete(layer);
        return Promise.resolve();
    };

    /**
     * Create a marker in the cluster
     *
     * @param {number} layer
     * @param {IMarkerOptions} options
     * @returns {Promise<Marker>}
     * @memberof GoogleClusterService
     */
    public CreateMarker(layer: number, options: IMarkerOptions): Promise<Marker> {
        const p: Promise<Layer> = this.GetLayerById(layer);
        if (p == null) { throw (new Error(`Layer with id ${layer} not found in Layer Map`)); }
        return p.then((l: Layer) => {
            return this._mapService.CreateMarker(options)
                .then((marker: Marker) => {
                    marker.IsFirst = options.isFirst;
                    marker.IsLast = options.isLast;
                    l.AddEntity(marker);
                    return marker;
                });
        });
    };

    /**
     * Starts the clustering
     *
     * @param {ClusterLayerDirective} layer
     * @returns {Promise<void>}
     * @memberof GoogleClusterService
     */
    public StartClustering(layer: ClusterLayerDirective): Promise<void> {
        return Promise.resolve();
    }

    /**
     * Stops the clustering
     *
     * @param {ClusterLayerDirective} layer
     * @returns {Promise<void>}
     * @memberof GoogleClusterService
     */
    public StopClustering(layer: ClusterLayerDirective): Promise<void> {
        return Promise.resolve();
    }

    /**
     * Creates the cluster icon from the styles
     *
     * @param {Array<IClusterIconInfo>} styles
     * @returns
     * @memberof GoogleClusterService
     */
    public CreateClusterIcons(styles: Array<IClusterIconInfo>) {
        styles.forEach(style => {
            if (style.iconInfo) {
                style.url = Marker.CreateMarker(style.iconInfo);
            }
        });
        return styles;
    }

    public CreatePolygon(layer: number, options: IPolygonOptions): Promise<Polygon> {
        throw new Error('Method not implemented.');
    }
    public CreatePolyline(layer: number, options: IPolylineOptions): Promise<Polyline> {
        throw new Error('Method not implemented.');
    }

}
