import { IMapOptions } from './../../interfaces/imap-options';
import { IBox } from './../../interfaces/ibox';
import { ILatLong } from './../../interfaces/ilatlong';
import { IMarkerOptions } from './../../interfaces/imarker-options';
import { IClusterOptions } from './../../interfaces/icluster-options';
import { IInfoWindowOptions } from './../../interfaces/iinfo-window-options';
import { IInfoWindowAction } from './../../interfaces/iinfo-window-action';
import { IPolygonOptions } from '../../interfaces/ipolygon-options';
import { IPolylineOptions } from '../../interfaces/ipolyline-options';
import { IPoint } from './../../interfaces/ipoint';
import { MapTypeId } from './../../models/map-type-id';
import { Marker } from './../../models/marker';
import { ClusterPlacementMode } from './../../models/cluster-placement-mode';
import { BingMapService } from './bing-map.service';

/**
 * This class contains helperfunctions to map various interfaces used to represent options and structures into the
 * corresponding Bing Maps V8 specific implementations.
 *
 * @export
 * @class BingConversions
 */
export class BingConversions {

    ///
    /// Field declarations
    ///

    /**
     * Map option attributes that are supported for conversion to Bing Map properties
     *
     * @private
     * @static
     * @type {string[]}
     * @memberof BingConversions
     */
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

    /**
     * View option attributes that are supported for conversion to Bing Map properties
     *
     * @private
     * @static
     * @type {string[]}
     * @memberof BingConversions
     */
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

    /**
     * InfoWindow option attributes that are supported for conversion to Bing Map properties
     *
     * @private
     * @static
     * @type {string[]}
     * @memberof BingConversions
     */
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

    /**
     * Marker option attributes that are supported for conversion to Bing Map properties
     *
     * @private
     * @static
     * @type {string[]}
     * @memberof BingConversions
     */
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

    /**
     * Polygon option attributes that are supported for conversion to Bing Map Polygon properties
     *
     * @private
     * @static
     * @type {string[]}
     * @memberof BingConversions
     */
    private static _polygonOptionsAttributes: string[] = [
        'cursor',
        'fillColor',
        'fillOpacity',
        'strokeColor',
        'strokeOpacity',
        'strokeWeight',
        'visible'
    ];

    /**
     * Polyline option attributes that are supported for conversion to Bing Map Polyline properties
     *
     * @private
     * @static
     * @type {string[]}
     * @memberof BingConversions
     */
    private static _polylineOptionsAttributes: string[] = [
        'cursor',
        'strokeColor',
        'strokeOpacity',
        'strokeWeight',
        'visible'
    ];

    /**
     * Cluster option attributes that are supported for conversion to Bing Map properties
     *
     * @private
     * @static
     * @type {string[]}
     * @memberof BingConversions
     */
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

    ///
    /// Public methods
    ///

    /**
     * Maps an IInfoWindowAction to a Microsoft.Maps.IInfoboxActions
     *
     * @static
     * @param {IInfoWindowAction} action - Object to be mapped.
     * @returns {Microsoft.Maps.IInfoboxActions} - Navtive mapped object.
     *
     * @memberof BingConversions
     */
    public static TranslateAction(action: IInfoWindowAction): Microsoft.Maps.IInfoboxActions {
        const a: Microsoft.Maps.IInfoboxActions = {
            eventHandler: action.eventHandler,
            label: action.label
        };
        return a;
    }

    /**
     * Maps an Array of IInfoWindowAction to an Array of Microsoft.Maps.IInfoboxActions
     *
     * @static
     * @param {Array<IInfoWindowAction>} actions - Array of objects to be mapped.
     * @returns {Array<Microsoft.Maps.IInfoboxActions>} - Array of mapped objects.
     *
     * @memberof BingConversions
     */
    public static TranslateActions(actions: Array<IInfoWindowAction>): Array<Microsoft.Maps.IInfoboxActions> {
        const a: Array<Microsoft.Maps.IInfoboxActions> = new Array<Microsoft.Maps.IInfoboxActions>();
        actions.forEach(x => a.push(BingConversions.TranslateAction(x)));
        return a;
    }

    /**
     * Maps an IBox object to a Microsoft.Maps.LocationRect object.
     *
     * @static
     * @param {IBox} box - Object to be mapped.
     * @returns {Microsoft.Maps.LocationRect} - Mapped object.
     *
     * @memberof BingConversions
     */
    public static TranslateBounds(box: IBox): Microsoft.Maps.LocationRect {
        const r: Microsoft.Maps.LocationRect =
            Microsoft.Maps.LocationRect.fromEdges(box.maxLatitude, box.minLongitude, box.minLatitude, box.maxLongitude);
        return r;
    }

    /**
     * Maps an IClusterOptions object to a Microsoft.Maps.IClusterLayerOptions object.
     *
     * @static
     * @param {IClusterOptions} options - Object to be mapped.
     * @returns {Microsoft.Maps.IClusterLayerOptions} - Mapped object.
     *
     * @memberof BingConversions
     */
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

    /**
     * Maps an IInfoWindowOptions object to a Microsoft.Maps.IInfoboxOptions object.
     *
     * @static
     * @param {IInfoWindowOptions} options - Object to be mapped.
     * @returns {Microsoft.Maps.IInfoboxOptions} - Mapped object.
     *
     * @memberof BingConversions
     */
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

    /**
     * Maps an IMapOptions object to a Microsoft.Maps.IMapLoadOptions object.
     *
     * @static
     * @param {IMapOptions} options - Object to be mapped.
     * @returns {Microsoft.Maps.IMapLoadOptions} - Mapped object.
     *
     * @memberof BingConversions
     */
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

    /**
     * Maps an ILatLong object to a Microsoft.Maps.Location object.
     *
     * @static
     * @param {ILatLong} latlong - Object to be mapped.
     * @returns {Microsoft.Maps.Location} - Mapped object.
     *
     * @memberof BingConversions
     */
    public static TranslateLocation(latlong: ILatLong): Microsoft.Maps.Location {
        const l: Microsoft.Maps.Location = new Microsoft.Maps.Location(latlong.latitude, latlong.longitude);
        return l;
    }

    /**
     * Maps an IMarkerOptions object to a Microsoft.Maps.IPushpinOptions object.
     *
     * @static
     * @param {IMarkerOptions} options - Object to be mapped.
     * @returns {Microsoft.Maps.IPushpinOptions} - Mapped object.
     *
     * @memberof BingConversions
     */
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

    /**
     * Maps an IMapOptions object to a Microsoft.Maps.IMapOptions object.
     *
     * @static
     * @param {IMapOptions} options - Object to be mapped.
     * @returns {Microsoft.Maps.IMapOptions} - Mapped object.
     *
     * @memberof BingConversions
     */
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

    /**
     * Translates an array of locations or an array or arrays of location to and array of arrays of Bing Map Locations
     * 
     * @static
     * @param {(Array<ILatLong> | Array<Array<ILatLong>>)} paths - ILatLong based locations to convert. 
     * @returns {Array<Array<Microsoft.Maps.Location>>} - converted locations. 
     * 
     * @memberof BingConversions
     */
    public static TranslatePaths(paths:Array<ILatLong> | Array<Array<ILatLong>>): Array<Array<Microsoft.Maps.Location>> {
        let p: Array<Array<Microsoft.Maps.Location>> = new Array<Array<Microsoft.Maps.Location>>();
        if (paths == null || !Array.isArray(paths) || paths.length === 0) { 
            p.push(new Array<Microsoft.Maps.Location>());
        }
        else if (Array.isArray(paths[0])){
            // parameter is an array or arrays
             (<Array<Array<ILatLong>>>paths).forEach(path => {
                const _p: Array<Microsoft.Maps.Location> = new Array<Microsoft.Maps.Location>();
                path.forEach(x => _p.push(new Microsoft.Maps.Location(x.latitude, x.longitude)));
                p.push(_p);
            });
        }
        else{
            // parameter is a simple array....
            const y: Array<Microsoft.Maps.Location> = new Array<Microsoft.Maps.Location>();
            (<Array<ILatLong>>paths).forEach(x => y.push(new Microsoft.Maps.Location(x.latitude, x.longitude)));
            p.push(y);
        }
        return p;
    }

    /**
     *  Maps an IPoint object to a Microsoft.Maps.Point object.
     *
     * @static
     * @param {IPoint} point - Object to be mapped.
     * @returns {Microsoft.Maps.Point} - Mapped object.
     *
     * @memberof BingConversions
     */
    public static TranslatePoint(point: IPoint): Microsoft.Maps.Point {
        const p: Microsoft.Maps.Point = new Microsoft.Maps.Point(point.x, point.y);
        return p;
    }

    /**
     *  Maps an IPolygonOptions object to a Microsoft.Maps.IPolygonOptions.
     *
     * @static
     * @param {IPolygonOptions} options - Object to be mapped.
     * @returns {Microsoft.Maps.IPolygonOptions} - Mapped object.
     *
     * @memberof BingConversions
     */
    public static TranslatePolygonOptions(options: IPolygonOptions): Microsoft.Maps.IPolygonOptions {
        const o: Microsoft.Maps.IPolygonOptions | any = {};
        const f: (s:string, a:number) => string = (s, a) => {
            let m = /rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(,\s*\d+[\.\d+]*)*\)/g.exec(s);
            if (m && m.length > 3) {
                a = a > 1 ? (a / 100) : a;
                return 'rgba(' + [m[1],m[2],m[3],a].join(',') +')';
            }
            else if(s[0] === '#') {
                let x: number = Math.floor(a * 255);
                let y: string = x.toString(16);
                let z: string = s.substr(0);
                if (z.length > 7) { z = z.substr(0, 7); }
                if (x < 16) { y = y + '0'; } 
                return z + y; 
            }   
            else {
                return s;
            }
        }; 

        Object.keys(options)
            .filter(k => BingConversions._polygonOptionsAttributes.indexOf(k) !== -1)
            .forEach((k) => {
                if (k === 'strokeWeight') {
                    o.strokeThickness = options.strokeWeight;
                } else if (k === 'strokeColor') {
                    if(options.strokeOpacity){
                        o.strokeColor = f(options.strokeColor, options.strokeOpacity);
                    }
                    else{
                        o.strokeColor = options.strokeColor;
                    }
                } else if (k === 'strokeOpacity') {    
                } else if (k === 'fillColor') {
                    if(options.fillOpacity){
                        o.fillColor = f(options.fillColor, options.fillOpacity);;;
                    }
                    else{
                        o.fillColor = options.fillColor;
                    }
                } else if (k === 'fillOpacity') {
                } else {
                    o[k] = (<any>options)[k];
                }
            });
        return o;
    }

    /**
     *  Maps an IPolylineOptions object to a Microsoft.Maps.IPolylineOptions.
     *
     * @static
     * @param {IPolygonOptions} options - Object to be mapped.
     * @returns {Microsoft.Maps.IPolylineOptions} - Mapped object.
     *
     * @memberof BingConversions
     */
    public static TranslatePolylineOptions(options: IPolylineOptions): Microsoft.Maps.IPolylineOptions{
        const o: Microsoft.Maps.IPolylineOptions | any = {};
        const f: (s:string, a:number) => string = (s, a) => {
            let m = /rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(,\s*\d+[\.\d+]*)*\)/g.exec(s);
            if (m && m.length > 3) {
                a = a > 1 ? (a / 100) : a;
                return 'rgba(' + [m[1],m[2],m[3],a].join(',') +')';
            }
            else if(s[0] === '#') {
                let x: number = Math.floor(a * 255);
                let y: string = x.toString(16);
                let z: string = s.substr(0);
                if (z.length > 7) { z = z.substr(0, 7); }
                if (x < 16) { y = y + '0'; } 
                return z + y; 
            }   
            else {
                return s;
            }
        }; 
        
        Object.keys(options)
            .filter(k => BingConversions._polylineOptionsAttributes.indexOf(k) !== -1)
            .forEach((k) => {
                if (k === 'strokeWeight') {
                    o.strokeThickness = options.strokeWeight;
                } else if (k === 'strokeColor') {
                    if(options.strokeOpacity){
                        o.strokeColor = f(options.strokeColor, options.strokeOpacity);
                    }
                    else{
                        o.strokeColor = options.strokeColor;
                    }
                } else if (k === 'strokeOpacity') {    
                } else {
                    o[k] = (<any>options)[k];
                }
            });
        return o;
    }

    /**
     * Maps an IMapOptions object to a Microsoft.Maps.IViewOptions object.
     *
     * @static
     * @param {IMapOptions} options - Object to be mapped.
     * @returns {Microsoft.Maps.IViewOptions} - Mapped object.
     *
     * @memberof BingConversions
     */
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
