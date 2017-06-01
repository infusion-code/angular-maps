import { Injectable } from "@angular/core";
import { MapService } from "./mapservice";
import { MarkerService } from "./markerservice";
import { InfoBoxService } from "./infoboxservice";
import { LayerService } from "./layerservice";
import { ClusterService } from "./clusterservice";

/**
 * Implements a factory to create all the implementation specifc services for a map implementation
 * 
 * @export
 * @abstract
 * @class MapServiceFactory
 */
@Injectable()
export abstract class MapServiceFactory {

    /**
     * Creates the map service. 
     * 
     * @abstract
     * @returns {MapService} - {@link MapService} implementing a specific underlying map architecture. 
     * 
     * @memberof MapServiceFactory
     */
    abstract Create(): MapService;

    /**
     * Creates the cluster service.
     * 
     * @abstract
     * @param {MapService} map - {@link MapService} implementation for thh underlying map archticture.
     * @returns {ClusterService} - {@link ClusterService} implementation for the underlying map architecture. 
     * 
     * @memberof MapServiceFactory
     */
    abstract CreateClusterService(map:MapService): ClusterService;

    /**
     * Creates the info box service. 
     * 
     * @abstract
     * @param {MapService} map - {@link MapService} implementation for thh underlying map archticture.
     * @returns {InfoBoxService} - {@link InfoBoxService} implementation for the underlying map architecture. 
     * 
     * @memberof MapServiceFactory
     */
    abstract CreateInfoBoxService(map:MapService): InfoBoxService;

    /**
     * Creates the layer service. 
     * 
     * @abstract
     * @param {MapService} map - {@link MapService} implementation for thh underlying map archticture.
     * @returns {LayerService} - {@link LayerService} implementation for the underlying map architecture. 
     * 
     * @memberof MapServiceFactory
     */
    abstract CreateLayerService(map:MapService): LayerService;

    /**
     * Creates the marker service. 
     * 
     * @abstract
     * @param {MapService} map - {@link MapService} implementation for thh underlying map archticture. 
     * @param {LayerService} layers - {@link LayerService} implementation for the underlying map architecture.
     * @param {ClusterService} clusters  - {@link ClusterService} implementation for the underlying map architecture.
     * @returns {MarkerService} - {@link MarkerService} implementation for the underlying map architecture. 
     * 
     * @memberof MapServiceFactory
     */
    abstract CreateMarkerService(map:MapService, layers: LayerService, clusters: ClusterService): MarkerService;

}
