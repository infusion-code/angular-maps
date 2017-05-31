import { IMapOptions } from "../../interfaces/imapoptions";
import { ILatLong } from "../../interfaces/ilatlong";
import * as GoogleMapTypes from './google-map-types';
import { MapTypeId } from "../../models/maptypeid";

export class GoogleConversions {

    ///
    /// Map option attributes that can change over time
    ///
    private static _mapOptionsAttributes: string[] = [
        // 'disableKeyboardInput',
        // 'disablePanning',
        // 'disableTouchInput',
        // 'disableUserInput',
        // 'disableZooming',
        // 'disableStreetside',
        // 'enableClickableLogo',
        // 'navigationBarMode',
        // 'showDashboard',
        // 'showMapTypeSelector',
        // 'showScalebar',
        'center',
        'zoom',
        'mapTypeId'
    ];

    private static _viewOptionsAttributes: string[] = [
        "animate",
        "bounds",
        "center",
        "centerOffset",
        "heading",
        "labelOverlay",
        "mapTypeId",
        "padding",
        "zoom"
    ];

    private static _infoWindowOptionsAttributes: string[] = [
        "actions",
        "description",
        "htmlContent",
        "id",
        "position",
        "pixelOffset",
        "showCloseButton",
        "showPointer",
        "pushpin",
        "title",
        "titleClickHandler",
        "typeName",
        "visible",
        "width",
        "height"
    ];

    private static _markerOptionsAttributes: string[] = [
        "anchor",
        "draggable",
        "height",
        "htmlContent",
        "icon",
        "iconInfo",
        "infobox",
        "state",
        "title",
        "textOffset",
        "typeName",
        "visible",
        "width",
        "zIndex"
    ];

    private static _clusterOptionsAttributes: string[] = [
        "callback",
        "clusteredPinCallback",
        "clusteringEnabled",
        "gridSize",
        "layerOffset",
        "placementMode",
        "visible",
        "zIndex"
    ];

    public static TranslateLocation(latlong: ILatLong): GoogleMapTypes.LatLngLiteral {
        const l: GoogleMapTypes.LatLngLiteral = { lat: latlong.latitude, lng: latlong.longitude };
        return l;
    }

    public static TranslateMapTypeId(mapTypeId: MapTypeId): string {
        switch(mapTypeId) {
            case MapTypeId.road:
                return GoogleMapTypes.MapTypeId[GoogleMapTypes.MapTypeId.roadmap];
            case MapTypeId.grayscale:
                return GoogleMapTypes.MapTypeId[GoogleMapTypes.MapTypeId.terrain];
            default:
                return GoogleMapTypes.MapTypeId[GoogleMapTypes.MapTypeId.satellite];
        }
    }

    public static TranslateOptions(options: IMapOptions): GoogleMapTypes.MapOptions {
        let o: GoogleMapTypes.MapOptions | any = {};
        Object.keys(options)
            .filter(k => GoogleConversions._mapOptionsAttributes.indexOf(k) !== -1)
            .forEach((k) => {
                if (k == "center") o.center = GoogleConversions.TranslateLocation(options.center);
                else if (k == "mapTypeId") o.mapTypeId = GoogleConversions.TranslateMapTypeId(options.mapTypeId);
                else o[k] = (<any>options)[k];
            });
        return o;
    }

}