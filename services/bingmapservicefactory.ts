import { Injectable, NgZone } from "@angular/core";
import { MapServiceFactory } from "./mapservicefactory";
import { MapService } from "./mapservice";
import { BingMapService } from "./bingmapservice";
import { MapAPILoader } from "./mapapiloader";
import { MarkerService } from "./markerservice";
import { BingMarkerService } from "./bingmarkerservice";
import { InfoBoxService } from "./infoboxservice";
import { BingInfoBoxService } from "./binginfoboxservice";

@Injectable()
export class BingMapServiceFactory implements MapServiceFactory {

    private _mapService: BingMapService = null;

    constructor(private _loader: MapAPILoader, private _zone: NgZone) { }

    public Create(): MapService {
        if (this._mapService == null) this._mapService = new BingMapService(this._loader, this._zone);
        return this._mapService; 
    }

    public CreateMarkerService(): MarkerService {
        if (this._mapService == null) this.Create();
        return new BingMarkerService(this._mapService, this._zone);
    }

    public CreateInfoBoxService(): InfoBoxService {
        if (this._mapService == null) this.Create();
        return new BingInfoBoxService(this._mapService, this._zone);
    }
}
