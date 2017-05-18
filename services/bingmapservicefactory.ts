import { Injectable, NgZone } from "@angular/core";
import { MapServiceFactory } from "./mapservicefactory";
import { MapService } from "./mapservice";
import { MapAPILoader } from "./mapapiloader";
import { MarkerService } from "./markerservice";
import { InfoBoxService } from "./infoboxservice";
import { LayerService } from "./layerservice";
import { ClusterService } from "./clusterservice";
import { BingInfoBoxService } from "./binginfoboxservice";
import { BingMarkerService } from "./bingmarkerservice";
import { BingMapService } from "./bingmapservice";
import { BingLayerService } from "./binglayerservice";
import { BingClusterService } from "./bingclusterservice";

@Injectable()
export class BingMapServiceFactory implements MapServiceFactory {

    constructor(private _loader: MapAPILoader, private _zone: NgZone) { }

    public Create(): MapService {
        return new BingMapService(this._loader, this._zone);
    }

    public CreateMarkerService(_mapService: BingMapService, _layerService: BingLayerService, _clusterService: BingClusterService): MarkerService {
        return new BingMarkerService(_mapService, _layerService, _clusterService, this._zone);
    }

    public CreateInfoBoxService(_mapService: BingMapService): InfoBoxService {
        return new BingInfoBoxService(_mapService, this._zone);
    }

    public CreateLayerService(_mapService: BingMapService): LayerService {
        return new BingLayerService(_mapService, this._zone);
    }

    public CreateClusterService(_mapService: BingMapService): ClusterService {
        return new BingClusterService(_mapService, this._zone);
    }
}
