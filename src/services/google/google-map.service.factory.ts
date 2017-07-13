import { Injectable, NgZone } from '@angular/core';
import { MapServiceFactory } from '../mapservicefactory';
import { MapService } from '../map.service';
import { MapAPILoader, WindowRef, DocumentRef } from '../mapapiloader';
import { MarkerService } from '../marker.service';
import { InfoBoxService } from '../infobox.service';
import { LayerService } from '../layer.service';
import { ClusterService } from '../cluster.service';
import { PolygonService } from '../polygon.service';
import { PolylineService } from '../polyline.service';

import * as GoogleMapTypes from './google-map-types';

import { GoogleMapAPILoader, GoogleMapAPILoaderConfig } from './google-map-api-loader.service';
import { GoogleInfoBoxService } from './google-infobox.service';
import { GoogleMarkerService } from './google-marker.service';
import { GoogleMapService } from './google-map.service';
import { GoogleLayerService } from './google-layer.service';
import { GoogleClusterService } from './google-cluster.service';
import { GooglePolygonService } from './google-polygon.service';
import { GooglePolylineService } from './google-polyline.service';

/**
 * Implements a factory to create three necessary Google Maps specific service instances.
 *
 * @export
 * @class GoogleMapServiceFactory
 * @implements {MapServiceFactory}
 */
@Injectable()
export class GoogleMapServiceFactory implements MapServiceFactory {
    private _map: Promise<GoogleMapTypes.GoogleMap>;
    private _mapResolver: (value?: GoogleMapTypes.GoogleMap) => void;

    ///
    /// Constructor
    ///

    /**
     * Creates an instance of GoogleMapServiceFactory.
     * @param {MapAPILoader} _loader - {@link MapAPILoader} implementation for the Google Map provider.
     * @param {NgZone} _zone - NgZone object to implement zone aware promises.
     *
     * @memberof GoogleMapServiceFactory
     */
    constructor(private _loader: MapAPILoader, private _zone: NgZone) {
        this._map =
            new Promise<GoogleMapTypes.GoogleMap>((resolve: () => void) => { this._mapResolver = resolve; });
    }

    ///
    /// Public methods and MapServiceFactory implementation.
    ///

    /**
     * Creates the map service for the Google Maps implementation.
     *
     * @returns {MapService} - {@link MapService}. A concreted instance of the {@link GoogleMapService}.
     *
     * @memberof GoogleMapServiceFactory
     */
    public Create(): MapService {
        return new GoogleMapService(this._loader, this._zone);
    }

    /**
     * Creates the cluster service for the Google Maps implementation.
     *
     * @param {MapService} map - {@link MapService}. A concreted instance of the {@link GoogleMapService}.
     * @returns {ClusterService} - {@link ClusterService}. A concreted instance of the {@link GoogleClusterService}.
     *
     * @memberof GoogleMapServiceFactory
     */
    public CreateClusterService(_mapService: MapService): ClusterService {
        return new GoogleClusterService(_mapService, this._zone);
    }

    /**
     * Creates thh info box service for the Google Maps implementation.
     *
     * @param {MapService} map - {@link MapService}. A concreted instance of the {@link GoogleMapService}.
     * @param {MarkerService} map - {@link MarkerService}. A concreted instance of the {@link GoogleMarkerService}.
     * @returns {InfoBoxService} - {@link InfoBoxService}. A concreted instance of the {@link GoogleInfoBoxService}.
     *
     * @memberof GoogleMapServiceFactory
     */
    public CreateInfoBoxService(_mapService: MapService, _markerService: MarkerService) {
        return new GoogleInfoBoxService(_mapService, _markerService, this._zone);
    }

    /**
     * Creates the layer service for the Google Maps implementation.
     *
     * @param {MapService} map - {@link MapService}. A concreted instance of the {@link GoogleMapService}.
     * @returns {LayerService} - {@link LayerService}. A concreted instance of the {@link GoogleLayerService}.
     *
     * @memberof GoogleMapServiceFactory
     */
    public CreateLayerService(_mapService: MapService) {
        return new GoogleLayerService(_mapService, this._zone);
    }

    /**
     * Creates the marker service for the Google Maps implementation.
     *
     * @param {MapService} map - {@link MapService}. A concreted instance of the {@link GoogleMapService}.
     * @param {LayerService} layers - {@link LayerService}. A concreted instance of the {@link GoogleLayerService}.
     * @param {ClusterService} clusters  - {@link ClusterService}. A concreted instance of the {@link GoogleClusterService}.
     * @returns {MarkerService} - {@link MarkerService}. A concreted instance of the {@link GoogleMarkerService}.
     *
     * @memberof GoogleMapServiceFactory
     */
    public CreateMarkerService(_mapService: MapService, _layerService: GoogleLayerService, _clusterService: GoogleClusterService) {
        return new GoogleMarkerService(_mapService, _layerService, _clusterService, this._zone);
    }

    /**
     * Creates the polygon service for the Google Maps implementation.
     *
     * @param {MapService} map - {@link MapService} implementation for thh underlying map archticture.
     * @param {LayerService} layers - {@link LayerService} implementation for the underlying map architecture.
     * @returns {PolygonService} - {@link PolygonService} implementation for the underlying map architecture.
     *
     * @memberof MapServiceFactory
     */
    public CreatePolygonService(map: MapService, layers: LayerService): PolygonService {
        return new GooglePolygonService(map, layers, this._zone);
    }

    /**
     * Creates the polyline service for the Google Maps implementation.
     *
     * @param {MapService} map - {@link MapService} implementation for thh underlying map archticture.
     * @param {LayerService} layers - {@link LayerService} implementation for the underlying map architecture.
     * @returns {PolylineService} - {@link PolylineService} implementation for the underlying map architecture.
     *
     * @memberof MapServiceFactory
     */
    public CreatePolylineService(map: MapService, layers: LayerService): PolylineService {
        return new GooglePolylineService(map, layers, this._zone);
    }

}

/**
 *  Creates a new instance of a plaform specific MapServiceFactory.
 *
 * @param apiLoader - An {@link MapAPILoader} instance. This is expected to the a {@link GoogleMapAPILoader}.
 * @param zone - An NgZone instance to provide zone aware promises.
 *
 * @return {MapServiceFactory} -  A {@link MapServiceFactory} instance.
 */
export function GoogleMapServiceFactoryFactory(apiLoader: MapAPILoader, zone: NgZone): MapServiceFactory {
    return new GoogleMapServiceFactory(apiLoader, zone);
}

/**
 * Creates a new instance of a plaform specific MapLoaderFactory.
 *
 * @export
 * @returns {MapAPILoader} - A {@link MapAPILoader} instance.
 */
export function GoogleMapLoaderFactory(): MapAPILoader {
    return new GoogleMapAPILoader(new GoogleMapAPILoaderConfig(), new WindowRef(), new DocumentRef());
}
