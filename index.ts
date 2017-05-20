import { NgModule, NgZone } from "@angular/core";
import { CommonModule } from "@angular/common";

///
/// import module interfaces
///
import { ILatLong } from "./interfaces/ilatlong";
import { IInfoWindowOptions } from "./interfaces/iinfowindowoptions";
import { IInfoWindowAction } from "./interfaces/iinfowindowaction";
import { IMarkerOptions } from "./interfaces/imarkeroptions";
import { IMapOptions } from "./interfaces/imapoptions";
import { ISize } from "./interfaces/isize";
import { IPoint } from "./interfaces/ipoint"
import { IBox } from "./interfaces/ibox";
import { IMarkerEvent } from "./interfaces/imarkerevent";
import { IMarkerIconInfo } from "./interfaces/imarkericoninfo";
import { ILayerOptions } from "./interfaces/ilayeroptions";
import { IClusterOptions } from "./interfaces/iclusteroptions";

///
/// import module models
///
import { InfoWindow } from "./models/infowindow";
import { BingInfoWindow } from "./models/binginfowindow";
import { Marker } from "./models/marker";
import { MarkerTypeId } from "./models/markertypeid";
import { BingMarker } from "./models/bingmarker";
import { MapTypeId } from "./models/maptypeid";
import { Layer } from "./models/layer";
import { ClusterPlacementMode } from "./models/clusterplacementmode";
import { ClusterClickAction } from "./models/clusterclickaction";
import { BingLayer } from "./models/binglayer"; 
import { BingClusterLayer } from "./models/bingclusterlayer";

///
/// import module components
///
import { Map } from "./components/map";
import { MapMarker } from "./components/mapmarker";
import { InfoBox } from "./components/infobox";
import { InfoBoxAction } from "./components/infoboxaction"
import { MapLayer } from "./components/maplayer";
import { ClusterLayer } from "./components/clusterlayer";

///
/// import module services
///
import { MapServiceFactory } from "./services/mapservicefactory";
import { MapService } from "./services/mapservice";
import { MapAPILoader, WindowRef, DocumentRef } from "./services/mapapiloader";
import { InfoBoxService } from "./services/infoboxservice";
import { LayerService } from  "./services/layerservice";
import { MarkerService } from "./services/markerservice";
import { ClusterService } from "./services/clusterservice";
import { BingMapServiceFactory } from "./services/bingmapservicefactory";
import { BingMapService } from "./services/bingmapservice";
import { BingMapAPILoader, BingMapAPILoaderConfig } from "./services/bingmapapiloader";
import { BingInfoBoxService } from "./services/binginfoboxservice";
import { BingMarkerService } from "./services/bingmarkerservice";
import { BingLayerService  } from "./services/binglayerservice";
import { BingClusterService  } from "./services/bingclusterservice";

///
/// export publics components, models, interfaces etc for external reuse.
///
export {
    ILatLong, IInfoWindowOptions, IInfoWindowAction, ISize, IMarkerOptions, IBox, IMapOptions, IPoint, IMarkerEvent, IMarkerIconInfo, ILayerOptions, IClusterOptions,
    Map, InfoBox, MapMarker, InfoBoxAction, MapLayer, ClusterLayer,
    MapService, MapServiceFactory, MarkerService, InfoBoxService, MapAPILoader, WindowRef, DocumentRef, LayerService, ClusterService,
    BingMapServiceFactory, BingMapAPILoaderConfig, BingMapService, BingInfoBoxService, BingMarkerService, BingMapAPILoader, BingLayerService, BingClusterService, 
    MapTypeId, Marker, MarkerTypeId, InfoWindow, Layer, ClusterPlacementMode, ClusterClickAction,
    BingLayer, BingMarker, BingInfoWindow
}

///
/// define module
///
@NgModule({
    declarations: [Map, MapMarker, InfoBox, InfoBoxAction, MapLayer, ClusterLayer ],
    imports: [ CommonModule ],
    exports: [ CommonModule, Map, MapMarker, InfoBox, InfoBoxAction, MapLayer, ClusterLayer ]
})
export class MapModule {

    static forRoot(mapServiceFactory?: MapServiceFactory, loader?: MapAPILoader ) {
        return {
            ngModule: MapModule,
            providers: [
                mapServiceFactory ? { provide: MapServiceFactory, useValue: mapServiceFactory } : { provide: MapServiceFactory, deps: [MapAPILoader, NgZone], useFactory: (apiLoader: MapAPILoader, zone: NgZone) => {
                    return new BingMapServiceFactory(apiLoader, zone);
                }},,
                loader ? { provide: MapAPILoader, useValue: loader } : { provide: MapAPILoader, useFactory: () => {
                    return new BingMapAPILoader(new BingMapAPILoaderConfig(), new WindowRef(), new DocumentRef());
                }},
                DocumentRef,
                WindowRef
            ]
        }
    }
}
