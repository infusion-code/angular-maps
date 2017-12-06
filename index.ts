import { NgModule, ModuleWithProviders, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';

///
/// import module interfaces
///
import { ILatLong } from './src/interfaces/ilatlong';
import { IInfoWindowOptions } from './src/interfaces/iinfo-window-options';
import { IInfoWindowAction } from './src/interfaces/iinfo-window-action';
import { IMarkerOptions } from './src/interfaces/imarker-options';
import { IMapOptions } from './src/interfaces/imap-options';
import { ISize } from './src/interfaces/isize';
import { IPoint } from './src/interfaces/ipoint';
import { IBox } from './src/interfaces/ibox';
import { IMarkerEvent } from './src/interfaces/imarker-event';
import { IMarkerIconInfo } from './src/interfaces/imarker-icon-info';
import { ILayerOptions } from './src/interfaces/ilayer-options';
import { IClusterOptions } from './src/interfaces/icluster-options';
import { ISpiderClusterOptions } from './src/interfaces/ispider-cluster-options';
import { ILineOptions } from './src/interfaces/iline-options';
import { IPolygonOptions } from './src/interfaces/ipolygon-options';
import { IPolylineOptions } from './src/interfaces/ipolyline-options';
import { IPolygonEvent } from './src/interfaces/ipolygon-event';
import { IPolylineEvent } from './src/interfaces/ipolyline-event';
import { IMapEventLookup } from './src/interfaces/imap-event-lookup';
import { ILabelOptions } from './src/interfaces/ilabel-options';

///
/// import module models
///
import { InfoWindow } from './src/models/info-window';
import { Marker } from './src/models/marker';
import { MarkerTypeId } from './src/models/marker-type-id';
import { MapTypeId } from './src/models/map-type-id';
import { Layer } from './src/models/layer';
import { Polygon } from './src/models/polygon';
import { Polyline } from './src/models/polyline';
import { SpiderClusterMarker } from './src/models/spider-cluster-marker';
import { ClusterPlacementMode } from './src/models/cluster-placement-mode';
import { ClusterClickAction } from './src/models/cluster-click-action';
import { CanvasOverlay} from './src/models/canvas-overlay';
import { BingLayer } from './src/models/bing/bing-layer';
import { BingClusterLayer } from './src/models/bing/bing-cluster-layer';
import { BingSpiderClusterMarker } from './src/models/bing/bing-spider-cluster-marker';
import { BingInfoWindow } from './src/models/bing/bing-info-window';
import { BingMarker } from './src/models/bing/bing-marker';
import { BingPolygon } from './src/models/bing/bing-polygon';
import { BingPolyline } from './src/models/bing/bing-polyline';
import { BingMapEventsLookup } from './src/models/bing/bing-events-lookup';
import { BingCanvasOverlay } from './src/models/bing/bing-canvas-overlay';
import { GoogleInfoWindow } from './src/models/google/google-info-window';
import { GoogleMarker } from './src/models/google/google-marker';
import { GooglePolygon } from './src/models/google/google-polygon';
import { GooglePolyline } from './src/models/google/google-polyline';
import { GoogleMapEventsLookup } from './src/models/google/google-events-lookup';
import { GoogleCanvasOverlay } from './src/models/google/google-canvas-overlay';

///
/// import module components
///
import { MapComponent } from './src/components/map';
import { MapMarkerDirective } from './src/components/map-marker';
import { InfoBoxComponent } from './src/components/infobox';
import { InfoBoxActionDirective } from './src/components/infobox-action';
import { MapLayerDirective } from './src/components/map-layer';
import { ClusterLayerDirective } from './src/components/cluster-layer';
import { MapPolygonDirective } from './src/components/map-polygon';
import { MapPolylineDirective } from './src/components/map-polyline';
import { MapMarkerLayerDirective } from './src/components/map-marker-layer';
import { MapPolygonLayerDirective } from './src/components/map-polygon-layer';
import { MapPolylineLayerDirective } from './src/components/map-polyline-layer';

///
/// import module services
///
import { MapServiceFactory } from './src/services/mapservicefactory';
import { MapService } from './src/services/map.service';
import { MapAPILoader, WindowRef, DocumentRef } from './src/services/mapapiloader';
import { InfoBoxService } from './src/services/infobox.service';
import { LayerService } from './src/services/layer.service';
import { MarkerService } from './src/services/marker.service';
import { ClusterService } from './src/services/cluster.service';
import { PolygonService } from './src/services/polygon.service';
import { PolylineService } from './src/services/polyline.service';
import { BingMapServiceFactory,
    BingMapServiceFactoryFactory, BingMapLoaderFactory } from './src/services/bing/bing-map.service.factory';
import { BingMapService } from './src/services/bing/bing-map.service';
import { BingMapAPILoader, BingMapAPILoaderConfig } from './src/services/bing/bing-map.api-loader.service';
import { BingInfoBoxService } from './src/services/bing/bing-infobox.service';
import { BingMarkerService } from './src/services/bing/bing-marker.service';
import { BingLayerService } from './src/services/bing/bing-layer.service';
import { BingClusterService } from './src/services/bing/bing-cluster.service';
import { BingPolygonService } from './src/services/bing/bing-polygon.service';
import { BingPolylineService } from './src/services/bing/bing-polyline.service';
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
    ILatLong, IInfoWindowOptions, IInfoWindowAction, ISize, IMarkerOptions, IBox, IMapOptions, IPoint, IMarkerEvent, IPolygonEvent,
    IPolylineEvent, IMapEventLookup, IMarkerIconInfo, ILayerOptions, IClusterOptions, ISpiderClusterOptions, ILineOptions,
    IPolygonOptions, IPolylineOptions, ILabelOptions, MapComponent, InfoBoxComponent, MapMarkerDirective, MapPolygonDirective,
    MapPolylineDirective, InfoBoxActionDirective, MapMarkerLayerDirective, MapPolygonLayerDirective, MapLayerDirective,
    ClusterLayerDirective, MapPolylineLayerDirective, MapTypeId, Marker, MarkerTypeId, InfoWindow, Layer, ClusterPlacementMode,
    ClusterClickAction, SpiderClusterMarker, Polygon, Polyline, CanvasOverlay, MapService, MapServiceFactory, MarkerService,
    InfoBoxService, MapAPILoader, WindowRef, DocumentRef, LayerService, PolygonService, PolylineService, ClusterService
};
export {
    BingMapServiceFactory, BingMapAPILoaderConfig, BingMapService, BingInfoBoxService,
    BingMarkerService, BingPolygonService, BingPolylineService, BingMapAPILoader,
    BingLayerService, BingClusterService, BingLayer, BingMarker, BingPolyline, BingMapEventsLookup, BingPolygon,
    BingInfoWindow, BingClusterLayer, BingSpiderClusterMarker, BingCanvasOverlay
};
export {
    GoogleClusterService, GoogleInfoBoxService, GoogleLayerService, GoogleMapAPILoader, GoogleMapAPILoaderConfig,
    GoogleMapServiceFactory, GoogleMapService, GoogleMarkerService, GooglePolygonService, GooglePolylineService,
    GoogleMarker, GoogleInfoWindow, GooglePolygon, GooglePolyline, GoogleMapEventsLookup, GoogleCanvasOverlay
};

///
/// define module
///
@NgModule({
    declarations: [
        MapLayerDirective,
        MapComponent,
        MapMarkerDirective,
        InfoBoxComponent,
        InfoBoxActionDirective,
        MapPolygonDirective,
        MapPolylineDirective,
        ClusterLayerDirective,
        MapMarkerLayerDirective,
        MapPolygonLayerDirective,
        MapPolylineLayerDirective
    ],
    imports: [CommonModule],
    exports: [
        CommonModule,
        MapComponent,
        MapMarkerDirective,
        MapPolygonDirective,
        MapPolylineDirective,
        InfoBoxComponent,
        InfoBoxActionDirective,
        MapLayerDirective,
        ClusterLayerDirective,
        MapMarkerLayerDirective,
        MapPolygonLayerDirective,
        MapPolylineLayerDirective
    ]
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
        };
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
        };
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
        };
    }
}
