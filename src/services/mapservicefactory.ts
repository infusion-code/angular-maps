import { Injectable } from '@angular/core';
import { MapService } from './map.service';
import { MarkerService } from './marker.service';
import { InfoBoxService } from './infobox.service';
import { LayerService } from './layer.service';
import { ClusterService } from './cluster.service';
import { PolygonService } from './polygon.service';
import { PolylineService } from './polyline.service';

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
    abstract CreateClusterService(map: MapService): ClusterService;

    /**
     * Creates the info box service.
     *
     * @abstract
     * @param {MapService} map - {@link MapService} implementation for thh underlying map archticture.
     * @param {MarkerService} marker - {@link MarkerService} implementation for thh underlying marker archticture.
     * @returns {InfoBoxService} - {@link InfoBoxService} implementation for the underlying map architecture.
     *
     * @memberof MapServiceFactory
     */
    abstract CreateInfoBoxService(map: MapService, marker: MarkerService): InfoBoxService;

    /**
     * Creates the layer service.
     *
     * @abstract
     * @param {MapService} map - {@link MapService} implementation for thh underlying map archticture.
     * @returns {LayerService} - {@link LayerService} implementation for the underlying map architecture.
     *
     * @memberof MapServiceFactory
     */
    abstract CreateLayerService(map: MapService): LayerService;

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
    abstract CreateMarkerService(map: MapService, layers: LayerService, clusters: ClusterService): MarkerService;

    /**
     * Creates the polygon service.
     *
     * @abstract
     * @param {MapService} map - {@link MapService} implementation for thh underlying map archticture.
     * @param {LayerService} layers - {@link LayerService} implementation for the underlying map architecture.
     * @returns {PolygonService} - {@link PolygonService} implementation for the underlying map architecture.
     *
     * @memberof MapServiceFactory
     */
    abstract CreatePolygonService(map: MapService, layers: LayerService): PolygonService;

    /**
     * Creates the polyline service.
     *
     * @abstract
     * @param {MapService} map - {@link MapService} implementation for thh underlying map archticture.
     * @param {LayerService} layers - {@link LayerService} implementation for the underlying map architecture.
     * @returns {PolylineService} - {@link PolylineService} implementation for the underlying map architecture.
     *
     * @memberof MapServiceFactory
     */
    abstract CreatePolylineService(map: MapService, layers: LayerService): PolylineService;

}
