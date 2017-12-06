import { Injectable, NgZone } from '@angular/core';
import { IMarkerOptions } from '../interfaces/imarker-options';
import { IPolygonOptions } from '../interfaces/ipolygon-options';
import { IPolylineOptions } from '../interfaces/ipolyline-options';
import { IMarkerIconInfo } from '../interfaces/imarker-icon-info';
import { Marker } from '../models/marker';
import { Layer } from '../models/layer';
import { Polygon } from '../models/polygon';
import { Polyline } from '../models/polyline';
import { ClusterLayerDirective } from '../components/cluster-layer';
import { LayerService } from './layer.service';

/**
 * Abstract class to to define teh cluster layer service contract. Must be realized by implementing provider.
 *
 * @export
 * @abstract
 * @class ClusterService
 */
@Injectable()
export abstract class ClusterService extends LayerService {

    /**
     * Start to actually cluster the entities in a cluster layer. This method should be called after the initial set of entities
     * have been added to the cluster. This method is used for performance reasons as adding an entitiy will recalculate all clusters.
     * As such, StopClustering should be called before adding many entities and StartClustering should be called once adding is
     * complete to recalculate the clusters.
     *
     * @param {ClusterLayerDirective} layer - ClusterLayerDirective component object for which to retrieve the layer.
     * @returns {Promise<void>}
     *
     * @memberof ClusterService
     */
    public abstract StartClustering(layer: ClusterLayerDirective): Promise<void>;

    /**
     * Stop to actually cluster the entities in a cluster layer.
     * This method is used for performance reasons as adding an entitiy will recalculate all clusters.
     * As such, StopClustering should be called before adding many entities and StartClustering should be called once adding is
     * complete to recalculate the clusters.
     *
     * @param {ClusterLayerDirective} layer - ClusterLayerDirective component object for which to retrieve the layer.
     * @returns {Promise<void>}
     *
     * @memberof ClusterService
     */
    public abstract StopClustering(layer: ClusterLayerDirective): Promise<void>;

}
