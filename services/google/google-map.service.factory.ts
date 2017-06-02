import { Injectable, NgZone } from '@angular/core';
import { MapServiceFactory } from '../mapservicefactory';
import { MapService } from '../mapservice';
import { MapAPILoader } from '../mapapiloader';
import { MarkerService } from '../markerservice';
import { InfoBoxService } from '../infoboxservice';
import { LayerService } from '../layerservice';
import { ClusterService } from '../clusterservice';

import * as GoogleMapTypes from './google-map-types';

import { GoogleInfoBoxService } from './google-infobox.service';
import { GoogleMarkerService } from './google-marker.service';
import { GoogleMapService } from './google-map.service';
import { GoogleLayerService } from './google-layer.service';
import { GoogleClusterService } from './google-cluster.service';

/**
 * Implements a factory to create three necessary Google Maps V8 specific service instances.
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
     * @param {MapAPILoader} _loader - {@link MapAPILoader} implementation for the Google Map V8 provider.
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
     * Creates the map service for the Google Maps V8 implementation.
     *
     * @returns {MapService} - {@link MapService}. A concreted instance of the {@link GoogleMapService}.
     *
     * @memberof GoogleMapServiceFactory
     */
    public Create(): MapService {
        return new GoogleMapService(this._loader, this._zone);
    }

    /**
     * Creates the cluster service for the Google Maps V8 implementation.
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
     * Creates thh info box service for the Google Maps V8 implementation.
     *
     * @param {MapService} map - {@link MapService}. A concreted instance of the {@link GoogleMapService}.
     * @returns {InfoBoxService} - {@link InfoBoxService}. A concreted instance of the {@link GoogleInfoBoxService}.
     *
     * @memberof GoogleMapServiceFactory
     */
    public CreateInfoBoxService(_mapService: MapService) {
        return new GoogleInfoBoxService(_mapService, this._zone);
    }

    /**
     * Creates the layer service for the Google Maps V8 implementation.
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
     * Creates the marker service for the Google Maps V8 implementation.
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

}
