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
import { BingMapAPILoader, BingMapAPILoaderConfig } from './bing-map.api-loader.service';
import { BingInfoBoxService } from './bing-infobox.service';
import { BingMarkerService } from './bing-marker.service';
import { BingMapService } from './bing-map.service';
import { BingLayerService } from './bing-layer.service';
import { BingClusterService } from './bing-cluster.service';
import { BingPolygonService } from './bing-polygon.service';
import { BingPolylineService } from './bing-polyline.service';

/**
 * Implements a factory to create thre necessary Bing Maps V8 specific service instances.
 *
 * @export
 */
@Injectable()
export class BingMapServiceFactory implements MapServiceFactory {

    ///
    /// Constructor
    ///

    /**
     * Creates an instance of BingMapServiceFactory.
     * @param _loader - {@link MapAPILoader} implementation for the Bing Map V8 provider.
     * @param _zone - NgZone object to implement zone aware promises.
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
     * @returns - {@link MapService}. A concreted instance of the {@link BingMapService}.
     *
     * @memberof BingMapServiceFactory
     */
    public Create(): MapService {
        return new BingMapService(this._loader, this._zone);
    }

    /**
     * Creates the cluster service for the Bing Maps V8 implementation.
     *
     * @param map - {@link MapService}. A concreted instance of the {@link BingMapService}.
     * @returns - {@link ClusterService}. A concreted instance of the {@link BingClusterService}.
     *
     * @memberof BingMapServiceFactory
     */
    public CreateClusterService(_mapService: BingMapService): ClusterService {
        return new BingClusterService(_mapService, this._zone);
    }

    /**
     * Creates thh info box service for the Bing Maps V8 implementation.
     *
     * @param map - {@link MapService}. A concreted instance of the {@link BingMapService}.
     * @returns - {@link InfoBoxService}. A concreted instance of the {@link BingInfoBoxService}.
     *
     * @memberof BingMapServiceFactory
     */
    public CreateInfoBoxService(_mapService: BingMapService): InfoBoxService {
        return new BingInfoBoxService(_mapService, this._zone);
    }

    /**
     * Creates the layer service for the Bing Maps V8 implementation.
     *
     * @param map - {@link MapService}. A concreted instance of the {@link BingMapService}.
     * @returns - {@link LayerService}. A concreted instance of the {@link BingLayerService}.
     *
     * @memberof BingMapServiceFactory
     */
    public CreateLayerService(_mapService: BingMapService): LayerService {
        return new BingLayerService(_mapService, this._zone);
    }

    /**
     * Creates the marker service for the Bing Maps V8 implementation.
     *
     * @param map - {@link MapService}. A concreted instance of the {@link BingMapService}.
     * @param layers - {@link LayerService}. A concreted instance of the {@link BingLayerService}.
     * @param clusters  - {@link ClusterService}. A concreted instance of the {@link BingClusterService}.
     * @returns - {@link MarkerService}. A concreted instance of the {@link BingMarkerService}.
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
     * @param map - {@link MapService} implementation for thh underlying map archticture.
     * @param layers - {@link LayerService} implementation for the underlying map architecture.
     * @returns - {@link PolygonService} implementation for the underlying map architecture.
     *
     * @memberof MapServiceFactory
     */
    public CreatePolygonService(map: MapService, layers: LayerService): PolygonService {
        return new BingPolygonService(map, layers, this._zone);
    }

    /**
     * Creates the polyline service for the Bing Maps V8 implementation.
     *
     * @param map - {@link MapService} implementation for thh underlying map archticture.
     * @param layers - {@link LayerService} implementation for the underlying map architecture.
     * @returns - {@link PolylineService} implementation for the underlying map architecture.
     *
     * @memberof MapServiceFactory
     */
    public CreatePolylineService(map: MapService, layers: LayerService): PolylineService {
        return new BingPolylineService(map, layers, this._zone);
    }

}

/**
 * Creates a new instance of a plaform specific MapServiceFactory.
 *
 * @export
 * @param apiLoader - An {@link MapAPILoader} instance. This is expected to the a {@link BingMapAPILoader}.
 * @param zone - An NgZone instance to provide zone aware promises.
 *
 * @returns -  A {@link MapServiceFactory} instance.
 */
export function BingMapServiceFactoryFactory(apiLoader: MapAPILoader, zone: NgZone): MapServiceFactory {
    return new BingMapServiceFactory(apiLoader, zone);
}

/**
 * Creates a new instance of a plaform specific MapLoaderFactory.
 *
 * @export
 * @returns - A {@link MapAPILoader} instance.
 */
export function BingMapLoaderFactory(): MapAPILoader {
    return new BingMapAPILoader(new BingMapAPILoaderConfig(), new WindowRef(), new DocumentRef());
}
