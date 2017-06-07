import { Injectable, NgZone } from '@angular/core';
import { MapServiceFactory } from './mapservicefactory';
import { MapService } from './mapservice';
import { MapAPILoader, WindowRef, DocumentRef } from './mapapiloader';
import { MarkerService } from './markerservice';
import { InfoBoxService } from './infoboxservice';
import { LayerService } from './layerservice';
import { ClusterService } from './clusterservice';
import { PolygonService } from './polygonservice';
import { BingMapAPILoader, BingMapAPILoaderConfig } from './bingmapapiloader';
import { BingInfoBoxService } from './binginfoboxservice';
import { BingMarkerService } from './bingmarkerservice';
import { BingMapService } from './bingmapservice';
import { BingLayerService } from './binglayerservice';
import { BingClusterService } from './bingclusterservice';

/**
 * Implements a factory to create thre necessary Bing Maps V8 specific service instances.
 *
 * @export
 * @class BingMapServiceFactory
 * @implements {MapServiceFactory}
 */
@Injectable()
export class BingMapServiceFactory implements MapServiceFactory {

    ///
    /// Constructor
    ///

    /**
     * Creates an instance of BingMapServiceFactory.
     * @param {MapAPILoader} _loader - {@link MapAPILoader} implementation for the Bing Map V8 provider.
     * @param {NgZone} _zone - NgZone object to implement zone aware promises.
     *
     * @memberof BingMapServiceFactory
     */
    constructor(private _loader: MapAPILoader, private _zone: NgZone) { }

    ///
    /// Public methods and MapServiceFactory implementation.
    ///

    /**
     * Creates the map service for the Bing Maps V8 implementation.
     *
     * @returns {MapService} - {@link MapService}. A concreted instance of the {@link BingMapService}.
     *
     * @memberof BingMapServiceFactory
     */
    public Create(): MapService {
        return new BingMapService(this._loader, this._zone);
    }

    /**
     * Creates the cluster service for the Bing Maps V8 implementation.
     *
     * @param {MapService} map - {@link MapService}. A concreted instance of the {@link BingMapService}.
     * @returns {ClusterService} - {@link ClusterService}. A concreted instance of the {@link BingClusterService}.
     *
     * @memberof BingMapServiceFactory
     */
    public CreateClusterService(_mapService: BingMapService): ClusterService {
        return new BingClusterService(_mapService, this._zone);
    }

    /**
     * Creates thh info box service for the Bing Maps V8 implementation.
     *
     * @param {MapService} map - {@link MapService}. A concreted instance of the {@link BingMapService}.
     * @returns {InfoBoxService} - {@link InfoBoxService}. A concreted instance of the {@link BingInfoBoxService}.
     *
     * @memberof BingMapServiceFactory
     */
    public CreateInfoBoxService(_mapService: BingMapService): InfoBoxService {
        return new BingInfoBoxService(_mapService, this._zone);
    }

    /**
     * Creates the layer service for the Bing Maps V8 implementation.
     *
     * @param {MapService} map - {@link MapService}. A concreted instance of the {@link BingMapService}.
     * @returns {LayerService} - {@link LayerService}. A concreted instance of the {@link BingLayerService}.
     *
     * @memberof BingMapServiceFactory
     */
    public CreateLayerService(_mapService: BingMapService): LayerService {
        return new BingLayerService(_mapService, this._zone);
    }

    /**
     * Creates the marker service for the Bing Maps V8 implementation.
     *
     * @param {MapService} map - {@link MapService}. A concreted instance of the {@link BingMapService}.
     * @param {LayerService} layers - {@link LayerService}. A concreted instance of the {@link BingLayerService}.
     * @param {ClusterService} clusters  - {@link ClusterService}. A concreted instance of the {@link BingClusterService}.
     * @returns {MarkerService} - {@link MarkerService}. A concreted instance of the {@link BingMarkerService}.
     *
     * @memberof BingMapServiceFactory
     */
    public CreateMarkerService(_mapService: BingMapService,
        _layerService: BingLayerService, _clusterService: BingClusterService): MarkerService {
        return new BingMarkerService(_mapService, _layerService, _clusterService, this._zone);
    }

    /**
     * Creates the polygon service for the Bing Maps V8 implementation.
     *
     * @param {MapService} map - {@link MapService} implementation for thh underlying map archticture.
     * @param {LayerService} layers - {@link LayerService} implementation for the underlying map architecture.
     * @returns {PolygonService} - {@link PolygonService} implementation for the underlying map architecture.
     *
     * @memberof MapServiceFactory
     */
    public CreatePolygonService(map: MapService, layers: LayerService): PolygonService {
        // no implementation yet...
        return null;
    }

}

/**
 * Creates a new instance of a plaform specific MapServiceFactory.
 * 
 * @export
 * @param apiLoader - An {@link MapAPILoader} instance. This is expected to the a {@link BingMapAPILoader}. 
 * @param zone - An NgZone instance to provide zone aware promises.  
 * 
 * @return {MapServiceFactory} -  A {@link MapServiceFactory} instance. 
 */
export function BingMapServiceFactoryFactory(apiLoader: MapAPILoader, zone: NgZone): MapServiceFactory {
    return new BingMapServiceFactory(apiLoader, zone);
}

/**
 * Creates a new instance of a plaform specific MapLoaderFactory.
 * 
 * @export
 * @returns {MapAPILoader} - A {@link MapAPILoader} instance. 
 */
export function BingMapLoaderFactory(): MapAPILoader {
    return new BingMapAPILoader(new BingMapAPILoaderConfig(), new WindowRef(), new DocumentRef());
}
