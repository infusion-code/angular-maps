import { IMapOptions } from '../interfaces/imapoptions';
import { IBox } from '../interfaces/ibox';
import { ILatLong } from '../interfaces/ilatlong';
import { IMarkerOptions } from '../interfaces/imarkeroptions';
import { IClusterOptions } from '../interfaces/iclusteroptions';
import { IInfoWindowOptions } from '../interfaces/iinfowindowoptions';
import { IInfoWindowAction } from '../interfaces/iinfowindowaction';
import { IPoint } from '../interfaces/ipoint';
import { MapTypeId } from '../models/maptypeid';
import { Marker } from '../models/marker';
import { ClusterPlacementMode } from '../models/clusterplacementmode';
import { BingMapService } from './bingmapservice';

export class BingConversions {

    ///
    /// Map option attributes that can change over time
    ///
    private static _mapOptionsAttributes: string[] = [
        'backgroundColor',
        'credentials',
        'customizeOverlays',
        'disableBirdseye',
        'disableKeyboardInput',
        'disableMouseInput',
        'disablePanning',
        'disableTouchInput',
        'disableUserInput',
        'disableZooming',
        'disableStreetside',
        'enableClickableLogo',
        'enableSearchLogo',
        'fixedMapPosition',
        'height',
        'inertiaIntensity',
        'navigationBarMode',
        'showBreadcrumb',
        'showCopyright',
        'showDashboard',
        'showMapTypeSelector',
        'showScalebar',
        'theme',
        'tileBuffer',
        'useInertia',
        'width',
        'center',
        'zoom',
        'mapTypeId'
    ];

    private static _viewOptionsAttributes: string[] = [
        'animate',
        'bounds',
        'center',
        'centerOffset',
        'heading',
        'labelOverlay',
        'mapTypeId',
        'padding',
        'zoom'
    ];

    private static _infoWindowOptionsAttributes: string[] = [
        'actions',
        'description',
        'htmlContent',
        'id',
        'position',
        'pixelOffset',
        'showCloseButton',
        'showPointer',
        'pushpin',
        'title',
        'titleClickHandler',
        'typeName',
        'visible',
        'width',
        'height'
    ];

    private static _markerOptionsAttributes: string[] = [
        'anchor',
        'draggable',
        'height',
        'htmlContent',
        'icon',
        'iconInfo',
        'infobox',
        'state',
        'title',
        'textOffset',
        'typeName',
        'visible',
        'width',
        'zIndex'
    ];

    private static _clusterOptionsAttributes: string[] = [
        'callback',
        'clusteredPinCallback',
        'clusteringEnabled',
        'gridSize',
        'layerOffset',
        'placementMode',
        'visible',
        'zIndex'
    ];

    public static TranslateAction(action: IInfoWindowAction): Microsoft.Maps.IInfoboxActions {
        const a: Microsoft.Maps.IInfoboxActions = {
            eventHandler: action.eventHandler,
            label: action.label
        };
        return a;
    }

    public static TranslateActions(actions: Array<IInfoWindowAction>): Array<Microsoft.Maps.IInfoboxActions> {
        const a: Array<Microsoft.Maps.IInfoboxActions> = new Array<Microsoft.Maps.IInfoboxActions>();
        actions.forEach(x => a.push(BingConversions.TranslateAction(x)));
        return a;
    }

    public static TranslateBounds(box: IBox): Microsoft.Maps.LocationRect {
        const r: Microsoft.Maps.LocationRect =
            Microsoft.Maps.LocationRect.fromEdges(box.maxLatitude, box.minLongitude, box.minLatitude, box.maxLongitude);
        return r;
    }

    public static TranslateClusterOptions(options: IClusterOptions): Microsoft.Maps.IClusterLayerOptions {
        const o: Microsoft.Maps.IClusterLayerOptions | any = {};
        Object.keys(options)
            .filter(k => BingConversions._clusterOptionsAttributes.indexOf(k) !== -1)
            .forEach((k) => {
                if (k === 'layerOffset') {
                    o.layerOffset = BingConversions.TranslatePoint(options.layerOffset);
                }
                if (k === 'placementMode') {
                    if (options.placementMode === ClusterPlacementMode.FirstPin) {
                        o.placementMode = Microsoft.Maps.ClusterPlacementType.FirstLocation;
                    } else {
                        o.placementMode = Microsoft.Maps.ClusterPlacementType.MeanAverage;
                    }
                } else {
                    o[k] = (<any>options)[k];
                }
            });
        return o;
    }

    public static TranslateInfoBoxOptions(options: IInfoWindowOptions): Microsoft.Maps.IInfoboxOptions {
        const o: Microsoft.Maps.IInfoboxOptions | any = {};
        Object.keys(options)
            .filter(k => BingConversions._infoWindowOptionsAttributes.indexOf(k) !== -1)
            .forEach((k) => {
                if (k === 'pixelOffset') {
                    o.offset = BingConversions.TranslatePoint(options.pixelOffset);
                } else if (k === 'position') {
                    o.location = BingConversions.TranslateLocation(options.position);
                } else if (k === 'actions') {
                    o.actions = BingConversions.TranslateActions(options.actions);
                } else {
                    o[k] = (<any>options)[k];
                }
            });
        return o;
    }

    public static TranslateLoadOptions(options: IMapOptions): Microsoft.Maps.IMapLoadOptions {
        const o: Microsoft.Maps.IMapLoadOptions | any = {};
        Object.keys(options)
            .filter(k => {
                return BingConversions._mapOptionsAttributes.indexOf(k) !== -1 || BingConversions._viewOptionsAttributes.indexOf(k) !== -1;
            })
            .forEach((k) => {
                if (k === 'center') {
                    o.center = BingConversions.TranslateLocation(options.center);
                } else if (k === 'mapTypeId') {
                    o.mapTypeId = Microsoft.Maps.MapTypeId[(<any>MapTypeId)[options.mapTypeId]];
                } else if (k === 'bounds') {
                    o.bounds = BingConversions.TranslateBounds(options.bounds);
                } else {
                    o[k] = (<any>options)[k];
                }
            });
        return o;
    }

    public static TranslateLocation(latlong: ILatLong): Microsoft.Maps.Location {
        const l: Microsoft.Maps.Location = new Microsoft.Maps.Location(latlong.latitude, latlong.longitude);
        return l;
    }

    public static TranslateMarkerOptions(options: IMarkerOptions): Microsoft.Maps.IPushpinOptions {
        const o: Microsoft.Maps.IPushpinOptions | any = {};
        Object.keys(options)
            .filter(k => BingConversions._markerOptionsAttributes.indexOf(k) !== -1)
            .forEach((k) => {
                if (k === 'iconInfo' && options.iconInfo) {
                    o.icon = Marker.CreateMarker(options.iconInfo);
                } else if (k === 'icon' && options.iconInfo == null) {
                    o.icon = options.icon;
                } else if (k === 'anchor') {
                    o.anchor = BingConversions.TranslatePoint(options.anchor);
                } else {
                    o[k] = (<any>options)[k];
                }
            });
        return o;
    }

    public static TranslateOptions(options: IMapOptions): Microsoft.Maps.IMapOptions {
        const o: Microsoft.Maps.IMapOptions | any = {};
        Object.keys(options)
            .filter(k => BingConversions._mapOptionsAttributes.indexOf(k) !== -1)
            .forEach((k) => {
                if (k === 'center') {
                    o.center = BingConversions.TranslateLocation(options.center);
                } else if (k === 'mapTypeId') {
                    o.mapTypeId = Microsoft.Maps.MapTypeId[(<any>MapTypeId)[options.mapTypeId]]
                } else {
                    o[k] = (<any>options)[k];
                }
            });
        return o;
    }

    public static TranslatePoint(point: IPoint): Microsoft.Maps.Point {
        const p: Microsoft.Maps.Point = new Microsoft.Maps.Point(point.x, point.y);
        return p;
    }

    public static TranslateViewOptions(options: IMapOptions): Microsoft.Maps.IViewOptions {
        const o: Microsoft.Maps.IViewOptions | any = {};
        Object.keys(options)
            .filter(k => BingConversions._viewOptionsAttributes.indexOf(k) !== -1)
            .forEach((k) => {
                if (k === 'center') {
                    o.center = BingConversions.TranslateLocation(options.center);
                } else if (k === 'bounds') {
                    o.bounds = BingConversions.TranslateBounds(options.bounds);
                } else if (k === 'centerOffset') {
                    o.centerOffset = BingConversions.TranslatePoint(options.centerOffset);
                } else if (k === 'mapTypeId') {
                    o.mapTypeId = Microsoft.Maps.MapTypeId[(<any>MapTypeId)[options.mapTypeId]]
                } else {
                    o[k] = (<any>options)[k];
                }
            });
        return o;
    }

}
