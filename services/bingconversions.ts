import { IMapOptions } from "../interfaces/imapoptions";
import { IBox } from "../interfaces/ibox";
import { ILatLong } from "../interfaces/ilatlong";
import { IMarkerOptions } from "../interfaces/imarkeroptions";
import { IInfoWindowOptions } from "../interfaces/iinfowindowoptions";
import { IInfoWindowAction } from "../interfaces/iinfowindowaction";
import { IPoint } from "../interfaces/ipoint";
import { MapTypeId } from "../models/maptypeid";
import { Marker } from "../models/marker";

export class BingConversions {

    ///
    /// Map option attributes that can change over time
    ///
    private static _mapOptionsAttributes: string[] = [
        "backgroundColor",
        "credentials",
        "customizeOverlays",
        "disableBirdseye",
        "disableKeyboardInput",
        "disableMouseInput",
        "disablePanning",
        "disableTouchInput",
        "disableUserInput",
        "disableZooming",
        "disableStreetside",
        "enableClickableLogo",
        "enableSearchLogo",
        "fixedMapPosition",
        "height",
        "inertiaIntensity",
        "navigationBarMode",
        "showBreadcrumb",
        "showCopyright",
        "showDashboard",
        "showMapTypeSelector",
        "showScalebar",
        "theme",
        "tileBuffer",
        "useInertia",
        "width",
        "center",
        "zoom",
        "mapTypeId"
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


    public static TranslateAction(action: IInfoWindowAction): Microsoft.Maps.Action {
        let a: Microsoft.Maps.Action = {
            eventHandler: action.eventHandler
        };
        a.label = action.label;
        a.icon = action.icon;
        return a;
    }

    public static TranslateActions(actions: Array<IInfoWindowAction>): Array<Microsoft.Maps.Action> {
        let a: Array<Microsoft.Maps.Action> = new Array<Microsoft.Maps.Action>();
        actions.forEach(x => a.push(this.TranslateAction(x)));
        return a;
    }

    public static TranslateBounds(box: IBox): Microsoft.Maps.LocationRect {
        let r: Microsoft.Maps.LocationRect = Microsoft.Maps.LocationRect.fromEdges(box.maxLatitude, box.minLongitude, box.minLatitude, box.maxLongitude, 0, 1);
        return r;
    }

    public static TranslateInfoBoxOptions(options: IInfoWindowOptions): Microsoft.Maps.InfoboxOptions {
        let o: Microsoft.Maps.InfoboxOptions | any = {};
        Object.keys(options)
            .filter(k => BingConversions._infoWindowOptionsAttributes.indexOf(k) !== -1)
            .forEach((k) => {
                if (k == "pixelOffset") o.offset = this.TranslatePoint(options.pixelOffset);
                else if (k == "position") o.location = this.TranslateLocation(options.position);
                else if (k == "actions") o.actions = this.TranslateActions(options.actions);
                else o[k] = (<any>options)[k];
            });
        return o;
    }

    public static TranslateLocation(latlong: ILatLong): Microsoft.Maps.Location {
        let l: Microsoft.Maps.Location = new Microsoft.Maps.Location(latlong.latitude, latlong.longitude);
        return l;
    }

    public static TranslateMarkerOptions(options: IMarkerOptions): Microsoft.Maps.PushpinOptions {
        let o: Microsoft.Maps.PushpinOptions | any = {};
        Object.keys(options)
            .filter(k => BingConversions._markerOptionsAttributes.indexOf(k) !== -1)
            .forEach((k) => {
                if (k == "iconInfo" && options.iconInfo) o.icon = Marker.CreateMarker(options.iconInfo);
                else if (k == "icon" && options.iconInfo == null) o.icon = options.icon;
                else if (k == "anchor") o.anchor = this.TranslatePoint(options.anchor);
                else o[k] = (<any>options)[k];
            });
        return o;
    }

    public static TranslateOptions(options: IMapOptions): Microsoft.Maps.MapOptions {
        let o: Microsoft.Maps.MapOptions | any = {};
        Object.keys(options)
            .filter(k => BingConversions._mapOptionsAttributes.indexOf(k) !== -1)
            .forEach((k) => {
                if (k == "center") o.center = this.TranslateLocation(options.center);
                else if (k == "mapTypeId") o.mapTypeId = Microsoft.Maps.MapTypeId[(<any>MapTypeId)[options.mapTypeId]]
                else o[k] = (<any>options)[k];
            });
        return o;
    }

    public static TranslatePoint(point: IPoint): Microsoft.Maps.Point {
        let p: Microsoft.Maps.Point = new Microsoft.Maps.Point(point.x, point.y);
        return p;
    }

    public static TranslateViewOptions(options: IMapOptions): Microsoft.Maps.ViewOptions {
        let o: Microsoft.Maps.ViewOptions | any = {};
        Object.keys(options)
            .filter(k => BingConversions._viewOptionsAttributes.indexOf(k) !== -1)
            .forEach((k) => {
                if (k == "center") o.center = this.TranslateLocation(options.center);
                else if (k == "bounds") o.bounds = this.TranslateBounds(options.bounds);
                else if (k == "centerOffset") o.centerOffset = this.TranslatePoint(options.centerOffset);
                else if (k == "mapTypeId") o.mapTypeId = Microsoft.Maps.MapTypeId[(<any>MapTypeId)[options.mapTypeId]]
                else o[k] = (<any>options)[k];
            });
        return o;
    }

}