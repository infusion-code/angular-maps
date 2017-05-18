import { Injectable } from "@angular/core";
import { MapService } from "./mapservice";
import { MarkerService } from "./markerservice";
import { InfoBoxService } from "./infoboxservice";
import { LayerService } from "./layerservice";
import { ClusterService } from "./clusterservice";


@Injectable()
export abstract class MapServiceFactory {

    abstract Create(): MapService;
    abstract CreateMarkerService(map:MapService, layers: LayerService, clusters: ClusterService): MarkerService;
    abstract CreateInfoBoxService(map:MapService): InfoBoxService;
    abstract CreateLayerService(map:MapService): LayerService;
    abstract CreateClusterService(map:MapService): ClusterService;
}
