import { NgModule, ModuleWithProviders, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';

///
/// import module interfaces
///
import { ILatLong } from './interfaces/ilatlong';
import { IInfoWindowOptions } from './interfaces/iinfowindowoptions';
import { IInfoWindowAction } from './interfaces/iinfowindowaction';
import { IMarkerOptions } from './interfaces/imarkeroptions';
import { IMapOptions } from './interfaces/imapoptions';
import { ISize } from './interfaces/isize';
import { IPoint } from './interfaces/ipoint'
import { IBox } from './interfaces/ibox';
import { IMarkerEvent } from './interfaces/imarkerevent';
import { IMarkerIconInfo } from './interfaces/imarkericoninfo';
import { ILayerOptions } from './interfaces/ilayeroptions';
import { IClusterOptions } from './interfaces/iclusteroptions';
import { ISpiderClusterOptions } from './interfaces/ispiderclusteroptions';
import { ILineOptions } from './interfaces/ilineoptions';
import { IPolygonOptions } from './interfaces/ipolygonoptions';

///
/// import module models
///
import { InfoWindow } from './models/infowindow';
import { Marker } from './models/marker';
import { MarkerTypeId } from './models/markertypeid';
import { MapTypeId } from './models/maptypeid';
import { Layer } from './models/layer';
import { Polygon } from './models/polygon';
import { SpiderClusterMarker } from './models/spiderclustermarker';
import { ClusterPlacementMode } from './models/clusterplacementmode';
import { ClusterClickAction } from './models/clusterclickaction';
import { BingLayer } from './models/binglayer';
import { BingClusterLayer } from './models/bingclusterlayer';
import { BingSpiderClusterMarker } from './models/bingspiderclustermarker';
import { BingInfoWindow } from './models/binginfowindow';
import { BingMarker } from './models/bingmarker';

///
/// import module components
///
import { MapComponent } from './components/map';
import { MapMarkerDirective } from './components/mapmarker';
import { InfoBoxComponent } from './components/infobox';
import { InfoBoxActionDirective } from './components/infoboxaction'
import { MapLayerDirective } from './components/maplayer';
import { ClusterLayerDirective } from './components/clusterlayer';
import { MapPolygonDirective } from './components/mappolygon'; 

///
/// import module services
///
import { MapServiceFactory } from './services/mapservicefactory';
import { MapService } from './services/mapservice';
import { MapAPILoader, WindowRef, DocumentRef } from './services/mapapiloader';
import { InfoBoxService } from './services/infoboxservice';
import { LayerService } from './services/layerservice';
import { MarkerService } from './services/markerservice';
import { ClusterService } from './services/clusterservice';
import { PolygonService } from './services/polygonservice'; 
import { BingMapServiceFactory, BingMapServiceFactoryFactory, BingMapLoaderFactory } from './services/bingmapservicefactory';
import { BingMapService } from './services/bingmapservice';
import { BingMapAPILoader, BingMapAPILoaderConfig } from './services/bingmapapiloader';
import { BingInfoBoxService } from './services/binginfoboxservice';
import { BingMarkerService } from './services/bingmarkerservice';
import { BingLayerService  } from './services/binglayerservice';
import { BingClusterService  } from './services/bingclusterservice';
import { GoogleClusterService } from './services/google/google-cluster.service';
import { GoogleInfoBoxService } from './services/google/google-infobox.service';
import { GoogleLayerService } from './services/google/google-layer.service';
import { GoogleMapAPILoader, GoogleMapAPILoaderConfig } from './services/google/google-map-api-loader.service';
import { GoogleMapServiceFactory, GoogleMapServiceFactoryFactory, GoogleMapLoaderFactory } from './services/google/google-map.service.factory';
import { GoogleMapService } from './services/google/google-map.service';
import { GoogleMarkerService } from './services/google/google-marker.service';
import { GooglePolygonService } from './services/google/google-polygon.service';

///
/// export publics components, models, interfaces etc for external reuse.
///
export {
    ILatLong, IInfoWindowOptions, IInfoWindowAction, ISize, IMarkerOptions, IBox, IMapOptions, IPoint, IMarkerEvent,
    IMarkerIconInfo, ILayerOptions, IClusterOptions, ISpiderClusterOptions, ILineOptions, IPolygonOptions,
    MapComponent, InfoBoxComponent, MapMarkerDirective, MapPolygonDirective, InfoBoxActionDirective, MapLayerDirective, ClusterLayerDirective,
    MapTypeId, Marker, MarkerTypeId, InfoWindow, Layer, ClusterPlacementMode, ClusterClickAction, SpiderClusterMarker, Polygon,
    MapService, MapServiceFactory, MarkerService, InfoBoxService, MapAPILoader, WindowRef, DocumentRef, LayerService, PolygonService, ClusterService
}
export {
    BingMapServiceFactory, BingMapAPILoaderConfig, BingMapService, BingInfoBoxService, BingMarkerService,
    BingMapAPILoader, BingLayerService, BingClusterService, BingLayer, BingMarker, BingInfoWindow, BingSpiderClusterMarker
}
export {
    GoogleClusterService, GoogleInfoBoxService, GoogleLayerService, GoogleMapAPILoader, GoogleMapAPILoaderConfig,
    GoogleMapServiceFactory, GoogleMapService, GoogleMarkerService, GooglePolygonService
}

///
/// define module
///
@NgModule({
    declarations: [MapLayerDirective, MapComponent, MapMarkerDirective, InfoBoxComponent, InfoBoxActionDirective, MapPolygonDirective, ClusterLayerDirective ],
    imports: [ CommonModule ],
    exports: [ CommonModule, MapComponent, MapMarkerDirective, MapPolygonDirective,
        InfoBoxComponent, InfoBoxActionDirective, MapLayerDirective, ClusterLayerDirective ]
})
export class MapModule {

    static forRoot(mapServiceFactory?: MapServiceFactory, loader?: MapAPILoader ): ModuleWithProviders {
        return {
            ngModule: MapModule,
            providers: [
                mapServiceFactory ? { provide: MapServiceFactory, useValue: mapServiceFactory } :
                    { provide: MapServiceFactory, deps: [MapAPILoader, NgZone], useFactory: BingMapServiceFactoryFactory},
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
                { provide: MapServiceFactory, deps: [MapAPILoader, NgZone], useFactory: GoogleMapServiceFactoryFactory},
                { provide: MapAPILoader, useFactory: GoogleMapLoaderFactory },
                DocumentRef,
                WindowRef
            ]
        }
    }
}
