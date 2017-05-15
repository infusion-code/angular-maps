import { Injectable, NgZone } from "@angular/core";
import { MapServiceFactory } from "./mapservicefactory";
import { MapService } from "./mapservice";
import { MapAPILoader } from "./mapapiloader";
import { MarkerService } from "./markerservice";
import { InfoBoxService } from "./infoboxservice";
import { LayerService } from "./layerservice";
import { BingInfoBoxService } from "./binginfoboxservice";
import { BingMarkerService } from "./bingmarkerservice";
import { BingMapService } from "./bingmapservice";
import { BingLayerService } from "./binglayerservice";

@Injectable()
export class BingMapServiceFactory implements MapServiceFactory {

    private _mapService: BingMapService = null;
    private _layerService: BingLayerService = null;

    constructor(private _loader: MapAPILoader, private _zone: NgZone) { }

    public Create(): MapService {
        if (this._mapService == null) this._mapService = new BingMapService(this._loader, this._zone);
        return this._mapService; 
    }

    public CreateMarkerService(): MarkerService {
        if (this._mapService == null) this.Create();
        if (this._layerService == null) this.CreateLayerService();
        return new BingMarkerService(this._mapService, this._layerService, this._zone);
    }

    public CreateInfoBoxService(): InfoBoxService {
        if (this._mapService == null) this.Create();
        return new BingInfoBoxService(this._mapService, this._zone);
    }

    public CreateLayerService(): LayerService {
        if (this._mapService == null) this.Create();
        this._layerService = new BingLayerService(this._mapService, this._zone);
        return this._layerService;
    }
}
