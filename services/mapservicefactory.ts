import { Injectable } from "@angular/core";
import { MapService } from "./mapservice";
import { MarkerService } from "./markerservice";
import { InfoBoxService } from "./infoboxservice";

@Injectable()
export abstract class MapServiceFactory {

    abstract Create(): MapService;
    abstract CreateMarkerService(): MarkerService;
    abstract CreateInfoBoxService(): InfoBoxService;
}
