import { NgModule, ModuleWithProviders, NgZone } from "@angular/core";
import { CommonModule } from "@angular/common";

///
/// import module interfaces
///
import { ILatLong } from "./src/interfaces/ilatlong";
import { IInfoWindowOptions } from "./src/interfaces/iinfowindowoptions";
import { IInfoWindowAction } from "./src/interfaces/iinfowindowaction";
import { IMarkerOptions } from "./src/interfaces/imarkeroptions";
import { IMapOptions } from "./src/interfaces/imapoptions";
import { ISize } from "./src/interfaces/isize";
import { IPoint } from "./src/interfaces/ipoint"
import { IBox } from "./src/interfaces/ibox";
import { IMarkerEvent } from "./src/interfaces/imarkerevent";
import { IMarkerIconInfo } from "./src/interfaces/imarkericoninfo";
import { ILayerOptions } from "./src/interfaces/ilayeroptions";
import { IClusterOptions } from "./src/interfaces/iclusteroptions";
import { ISpiderClusterOptions } from "./src/interfaces/ispiderclusteroptions";
import { ILineOptions } from "./src/interfaces/ilineoptions";

///
/// import module models
///
import { InfoWindow } from "./src/models/infowindow";
import { Marker } from "./src/models/marker";
import { MarkerTypeId } from "./src/models/markertypeid";
import { MapTypeId } from "./src/models/maptypeid";
import { Layer } from "./src/models/layer";
import { SpiderClusterMarker } from "./src/models/spiderclustermarker";
import { ClusterPlacementMode } from "./src/models/clusterplacementmode";
import { ClusterClickAction } from "./src/models/clusterclickaction";
import { BingLayer } from "./src/models/bingmaps/binglayer"; 
import { BingClusterLayer } from "./src/models/bingmaps/bingclusterlayer";
import { BingSpiderClusterMarker } from "./src/models/bingmaps/bingspiderclustermarker";
import { BingInfoWindow } from "./src/models/bingmaps/binginfowindow";
import { BingMarker } from "./src/models/bingmaps/bingmarker";

///
/// import module components
///
import { Map } from "./src/components/map";
import { MapMarker } from "./src/components/mapmarker";
import { InfoBox } from "./src/components/infobox";
import { InfoBoxAction } from "./src/components/infoboxaction"
import { MapLayer } from "./src/components/maplayer";
import { ClusterLayer } from "./src/components/clusterlayer";

///
/// import module services
///
import { MapServiceFactory } from "./src/services/mapservicefactory";
import { MapService } from "./src/services/mapservice";
import { MapAPILoader, WindowRef, DocumentRef } from "./src/services/mapapiloader";
import { InfoBoxService } from "./src/services/infoboxservice";
import { LayerService } from  "./src/services/layerservice";
import { MarkerService } from "./src/services/markerservice";
import { ClusterService } from "./src/services/clusterservice";
import { BingMapServiceFactory } from "./src/services/bingmaps/bingmapservicefactory";
import { BingMapService } from "./src/services/bingmaps/bingmapservice";
import { BingMapAPILoader, BingMapAPILoaderConfig } from "./src/services/bingmaps/bingmapapiloader";
import { BingInfoBoxService } from "./src/services/bingmaps/binginfoboxservice";
import { BingMarkerService } from "./src/services/bingmaps/bingmarkerservice";
import { BingLayerService  } from "./src/services/bingmaps/binglayerservice";
import { BingClusterService  } from "./src/services/bingmaps/bingclusterservice";

///
/// export publics components, models, interfaces etc for external reuse.
///
export {
    ILatLong, IInfoWindowOptions, IInfoWindowAction, ISize, IMarkerOptions, IBox, IMapOptions, IPoint, IMarkerEvent, 
    IMarkerIconInfo, ILayerOptions, IClusterOptions, ISpiderClusterOptions, ILineOptions,
    Map, InfoBox, MapMarker, InfoBoxAction, MapLayer, ClusterLayer,
    MapService, MapServiceFactory, MarkerService, InfoBoxService, MapAPILoader, WindowRef, DocumentRef, LayerService, ClusterService,
    BingMapServiceFactory, BingMapAPILoaderConfig, BingMapService, BingInfoBoxService, BingMarkerService, BingMapAPILoader, BingLayerService, BingClusterService, 
    MapTypeId, Marker, MarkerTypeId, InfoWindow, Layer, ClusterPlacementMode, ClusterClickAction, SpiderClusterMarker,
    BingLayer, BingMarker, BingInfoWindow, BingSpiderClusterMarker
}

///
/// define module
///
@NgModule({
    declarations: [MapLayer, Map, MapMarker, InfoBox, InfoBoxAction, ClusterLayer ],
    imports: [ CommonModule ],
    exports: [ CommonModule, Map, MapMarker, InfoBox, InfoBoxAction, MapLayer, ClusterLayer ]
})
export class MapModule {

    static forRoot(mapServiceFactory?: MapServiceFactory, loader?: MapAPILoader ): ModuleWithProviders {
        return {
            ngModule: MapModule,
            providers: [
                mapServiceFactory ? { provide: MapServiceFactory, useValue: mapServiceFactory } : { provide: MapServiceFactory, deps: [MapAPILoader, NgZone], useFactory: BingMapServiceFactoryFactory},
                loader ? { provide: MapAPILoader, useValue: loader } : { provide: MapAPILoader, useFactory: BingMapLoaderFactory },
                DocumentRef,
                WindowRef
            ]
        }
    }
}

export function BingMapServiceFactoryFactory(apiLoader: MapAPILoader, zone: NgZone): MapServiceFactory{
    return new BingMapServiceFactory(apiLoader, zone);
}
export function BingMapLoaderFactory(): MapAPILoader {
    return new BingMapAPILoader(new BingMapAPILoaderConfig(), new WindowRef(), new DocumentRef());
}