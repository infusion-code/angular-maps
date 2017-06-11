import { NgModule, ModuleWithProviders, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';

///
/// import module interfaces
///
import { ILatLong } from './src/interfaces/ilatlong';
import { IInfoWindowOptions } from './src/interfaces/iinfowindowoptions';
import { IInfoWindowAction } from './src/interfaces/iinfowindowaction';
import { IMarkerOptions } from './src/interfaces/imarkeroptions';
import { IMapOptions } from './src/interfaces/imapoptions';
import { ISize } from './src/interfaces/isize';
import { IPoint } from './src/interfaces/ipoint'
import { IBox } from './src/interfaces/ibox';
import { IMarkerEvent } from './src/interfaces/imarkerevent';
import { IMarkerIconInfo } from './src/interfaces/imarkericoninfo';
import { ILayerOptions } from './src/interfaces/ilayeroptions';
import { IClusterOptions } from './src/interfaces/iclusteroptions';
import { ISpiderClusterOptions } from './src/interfaces/ispiderclusteroptions';
import { ILineOptions } from './src/interfaces/ilineoptions';
import { IPolygonOptions } from './src/interfaces/ipolygonoptions';
import { IPolylineOptions } from './src/interfaces/ipolylineoptions';

///
/// import module models
///
import { InfoWindow } from './src/models/infowindow';
import { Marker } from './src/models/marker';
import { MarkerTypeId } from './src/models/markertypeid';
import { MapTypeId } from './src/models/maptypeid';
import { Layer } from './src/models/layer';
import { Polygon } from './src/models/polygon';
import { Polyline } from './src/models/polyline';
import { SpiderClusterMarker } from './src/models/spiderclustermarker';
import { ClusterPlacementMode } from './src/models/clusterplacementmode';
import { ClusterClickAction } from './src/models/clusterclickaction';
import { BingLayer } from './src/models/bingMaps/bing-layer';
import { BingClusterLayer } from './src/models/bingMaps/bing-cluster-layer';
import { BingSpiderClusterMarker } from './src/models/bingMaps/bing-spidercluster-marker';
import { BingInfoWindow } from './src/models/bingMaps/bing-infowindow';
import { BingMarker } from './src/models/bingMaps/bing-marker';
import { BingPolygon } from './src/models/bingMaps/bing-polygon';
import { BingPolyline } from './src/models/bingMaps/bing-polyline';
import { GoogleInfoWindow } from './src/models/google/google-infowindow';
import { GoogleMarker } from './src/models/google/google-marker';
import { GooglePolygon } from './src/models/google/google-polygon';
import { GooglePolyline } from './src/models/google/google-polyline';

///
/// import module components
///
import { MapComponent } from './src/components/map';
import { MapMarkerDirective } from './src/components/mapmarker';
import { InfoBoxComponent } from './src/components/infobox';
import { InfoBoxActionDirective } from './src/components/infoboxaction'
import { MapLayerDirective } from './src/components/maplayer';
import { ClusterLayerDirective } from './src/components/clusterlayer';
import { MapPolygonDirective } from './src/components/mappolygon';
import { MapPolylineDirective } from './src/components/mappolyline';

///
/// import module services
///
import { MapServiceFactory } from './src/services/mapservicefactory';
import { MapService } from './src/services/mapservice';
import { MapAPILoader, WindowRef, DocumentRef } from './src/services/mapapiloader';
import { InfoBoxService } from './src/services/infoboxservice';
import { LayerService } from './src/services/layerservice';
import { MarkerService } from './src/services/markerservice';
import { ClusterService } from './src/services/clusterservice';
import { PolygonService } from './src/services/polygonservice';
import { PolylineService } from './src/services/polylineservice';
import { BingMapServiceFactory, BingMapServiceFactoryFactory, BingMapLoaderFactory } from './src/services/bingMaps/bing-map.service.factory';
import { BingMapService } from './src/services/bingMaps/bing-map.service';
import { BingMapAPILoader, BingMapAPILoaderConfig } from './src/services/bingMaps/bing-map.api-loader.service';
import { BingInfoBoxService } from './src/services/bingMaps/bing-infobox.service';
import { BingMarkerService } from './src/services/bingMaps/bing-marker.service';
import { BingLayerService } from './src/services/bingMaps/bing-layer.service';
import { BingClusterService } from './src/services/bingMaps/bing-cluster.service';
import { BingPolygonService } from './src/services/bingMaps/bing-polygon.service';
import { BingPolylineService } from './src/services/bingMaps/bing-polyline.service';
import { GoogleClusterService } from './src/services/google/google-cluster.service';
import { GoogleInfoBoxService } from './src/services/google/google-infobox.service';
import { GoogleLayerService } from './src/services/google/google-layer.service';
import { GoogleMapAPILoader, GoogleMapAPILoaderConfig } from './src/services/google/google-map-api-loader.service';
import {
    GoogleMapServiceFactory, GoogleMapServiceFactoryFactory,
    GoogleMapLoaderFactory
} from './src/services/google/google-map.service.factory';
import { GoogleMapService } from './src/services/google/google-map.service';
import { GoogleMarkerService } from './src/services/google/google-marker.service';
import { GooglePolygonService } from './src/services/google/google-polygon.service';
import { GooglePolylineService } from './src/services/google/google-polyline.service';

///
/// export publics components, models, interfaces etc for external reuse.
///
export {
    ILatLong, IInfoWindowOptions, IInfoWindowAction, ISize, IMarkerOptions, IBox, IMapOptions, IPoint, IMarkerEvent,
    IMarkerIconInfo, ILayerOptions, IClusterOptions, ISpiderClusterOptions, ILineOptions, IPolygonOptions, IPolylineOptions,
    MapComponent, InfoBoxComponent, MapMarkerDirective, MapPolygonDirective, MapPolylineDirective, InfoBoxActionDirective,
    MapLayerDirective, ClusterLayerDirective, MapTypeId, Marker, MarkerTypeId, InfoWindow, Layer,
    ClusterPlacementMode, ClusterClickAction, SpiderClusterMarker, Polygon, Polyline, MapService, MapServiceFactory,
    MarkerService, InfoBoxService, MapAPILoader, WindowRef, DocumentRef, LayerService, PolygonService, PolylineService, ClusterService
}
export {
    BingMapServiceFactory, BingMapAPILoaderConfig, BingMapService, BingInfoBoxService, 
    BingMarkerService, BingPolygonService, BingPolylineService, BingMapAPILoader, 
    BingLayerService, BingClusterService, BingLayer, BingMarker, BingPolyline, BingPolygon, BingInfoWindow, BingSpiderClusterMarker
}
export {
    GoogleClusterService, GoogleInfoBoxService, GoogleLayerService, GoogleMapAPILoader, GoogleMapAPILoaderConfig,
    GoogleMapServiceFactory, GoogleMapService, GoogleMarkerService, GooglePolygonService, GooglePolylineService,
    GoogleMarker, GoogleInfoWindow, GooglePolygon, GooglePolyline
}

///
/// define module
///
@NgModule({
    declarations: [MapLayerDirective, MapComponent, MapMarkerDirective, InfoBoxComponent,
        InfoBoxActionDirective, MapPolygonDirective, MapPolylineDirective, ClusterLayerDirective],
    imports: [CommonModule],
    exports: [CommonModule, MapComponent, MapMarkerDirective, MapPolygonDirective, MapPolylineDirective,
        InfoBoxComponent, InfoBoxActionDirective, MapLayerDirective, ClusterLayerDirective]
})
export class MapModule {

    static forRoot(mapServiceFactory?: MapServiceFactory, loader?: MapAPILoader): ModuleWithProviders {
        return {
            ngModule: MapModule,
            providers: [
                mapServiceFactory ? { provide: MapServiceFactory, useValue: mapServiceFactory } :
                    { provide: MapServiceFactory, deps: [MapAPILoader, NgZone], useFactory: BingMapServiceFactoryFactory },
                loader ? { provide: MapAPILoader, useValue: loader } : { provide: MapAPILoader, useFactory: BingMapLoaderFactory },
                DocumentRef,
                WindowRef
            ]
        }
    }

    static forRootBing(): ModuleWithProviders {
        return {
            ngModule: MapModule,
            providers: [
                { provide: MapServiceFactory, deps: [MapAPILoader, NgZone], useFactory: BingMapServiceFactoryFactory },
                { provide: MapAPILoader, useFactory: BingMapLoaderFactory },
                DocumentRef,
                WindowRef
            ]
        }
    }

    static forRootGoogle(): ModuleWithProviders {
        return {
            ngModule: MapModule,
            providers: [
                { provide: MapServiceFactory, deps: [MapAPILoader, NgZone], useFactory: GoogleMapServiceFactoryFactory },
                { provide: MapAPILoader, useFactory: GoogleMapLoaderFactory },
                DocumentRef,
                WindowRef
            ]
        }
    }
}
