import { IInfoWindowOptions } from '../../interfaces/iinfo-window-options';
import { IBox } from '../../interfaces/ibox';
import { IMapOptions } from '../../interfaces/imap-options';
import { IMarkerOptions } from '../../interfaces/imarker-options';
import { IPolygonOptions } from '../../interfaces/ipolygon-options';
import { IPolylineOptions } from '../../interfaces/ipolyline-options';
import { ILatLong } from '../../interfaces/ilatlong';
import * as GoogleMapTypes from './google-map-types';
import { MapTypeId } from '../../models/map-type-id';

declare var google: any;


/**
 * This class contains helperfunctions to map various interfaces used to represent options and structures into the
 * corresponding Google Maps specific implementations.
 *
 * @export
 */
export class GoogleConversions {

    ///
    /// Field declarations
    ///

    /**
     * Map option attributes that are supported for conversion to Google Map properties
     *
     * @memberof GoogleConversions
     */
    private static _mapOptionsAttributes: string[] = [
        'backgroundColor',
        'center',
        'clickableIcons',
        'customMapStyleGoogle',
        'disableDefaultUI',
        'disableDoubleClickZoom',
        'draggable',
        'draggableCursor',
        'draggingCursor',
        'disableZooming',
        'fullscreenControl',
        'fullscreenControlOptions',
        'gestureHandling',
        'heading',
        'keyboardShortcuts',
        'mapTypeControl',
        'mapTypeControlOptions',
        'mapTypeId',
        'maxZoom',
        'minZoom',
        'noClear',
        'panControl',
        'panControlOptions',
        'rotateControl',
        'rotateControlOptions',
        'scaleControl',
        'scaleControlOptions',
        'scrollwheel',
        'showMapTypeSelector',
        'streetView',
        'streetViewControl',
        'streetViewControlOptions',
        'styles',
        'tilt',
        'zoom',
        'zoomControl',
        'zoomControlOptions'
    ];

    /**
     * InfoWindow option attributes that are supported for conversion to Google Map properties
     *
     * @memberof GoogleConversions
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
     * Marker option attributes that are supported for conversion to Google Map properties
     *
     * @memberof GoogleConversions
     */
    private static _markerOptionsAttributes: string[] = [
        'anchor',
        'position',
        'title',
        'text',
        'label',
        'draggable',
        'icon',
        'width',
        'height',
        'iconInfo',
        'metadata',
        'visible'
    ];

    /**
     * Cluster option attributes that are supported for conversion to Google Map properties
     *
     * @memberof GoogleConversions
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

    /**
     * Polygon option attributes that are supported for conversion to Google Map properties
     *
     * @memberof GoogleConversions
     */
    private static _polygonOptionsAttributes: string[] = [
        'clickable',
        'draggable',
        'editable',
        'fillColor',
        'fillOpacity',
        'geodesic',
        'paths',
        'strokeColor',
        'strokeOpacity',
        'strokeWeight',
        'visible',
        'zIndex'
    ];

    /**
     * Polyline option attributes that are supported for conversion to Google Map properties
     *
     * @memberof GoogleConversions
     */
    private static _polylineOptionsAttributes: string[] = [
        'clickable',
        'draggable',
        'editable',
        'geodesic',
        'strokeColor',
        'strokeOpacity',
        'strokeWeight',
        'visible',
        'zIndex'
    ];

    /**
     * Maps an IBox object to a GoogleMapTypes.LatLngBoundsLiteral object.
     *
     * @param bounds - Object to be mapped.
     * @returns - Mapped object.
     *
     * @memberof GoogleConversions
     */
    public static TranslateBounds(bounds: IBox): GoogleMapTypes.LatLngBoundsLiteral {
        const b: GoogleMapTypes.LatLngBoundsLiteral = {
            east: bounds.maxLongitude,
            north: bounds.maxLatitude,
            south: bounds.minLatitude,
            west: bounds.minLongitude,
        };
        return b;
    }

    /**
     * Maps an IInfoWindowOptions object to a GoogleMapTypes.InfoWindowOptions object.
     *
     * @param options - Object to be mapped.
     * @returns - Mapped object.
     *
     * @memberof GoogleConversions
     */
    public static TranslateInfoWindowOptions(options: IInfoWindowOptions): GoogleMapTypes.InfoWindowOptions {
        const o: GoogleMapTypes.InfoWindowOptions | any = {};
        Object.keys(options)
            .filter(k => GoogleConversions._infoWindowOptionsAttributes.indexOf(k) !== -1)
            .forEach((k) => {
                if (k === 'htmlContent') {
                    o.content = (<any>options)[k];
                } else {
                    o[k] = (<any>options)[k];
                }
            });
        if (o.content == null || o.content === '') {
            if (options.title !== '' && options.description !== '') {
                o.content = `${options.title}: ${options.description}`;
            }
            else if (options.description !== '') { o.content = options.description; }
            else { o.content = options.title; }
        }
        return o;
    }

    /**
     * Maps an ILatLong object to a GoogleMapTypes.LatLngLiteral object.
     *
     * @param latlong - Object to be mapped.
     * @returns - Mapped object.
     *
     * @memberof GoogleConversions
     */
    public static TranslateLocation(latlong: ILatLong): GoogleMapTypes.LatLngLiteral {
        const l: GoogleMapTypes.LatLngLiteral = { lat: latlong.latitude, lng: latlong.longitude };
        return l;
    }

    /**
     * Maps an GoogleMapTypes.LatLngLiteral object to a ILatLong object.
     *
     * @param latlng - Object to be mapped.
     * @returns - Mapped object.
     *
     * @memberof GoogleConversions
     */
    public static TranslateLatLng(latlng: GoogleMapTypes.LatLngLiteral): ILatLong {
        const l: ILatLong = { latitude: latlng.lat, longitude: latlng.lng };
        return l;
    }

    /**
     * Maps an ILatLong object to a GoogleMapTypes.LatLng object.
     *
     * @param latlong - Object to be mapped.
     * @returns - Mapped object.
     *
     * @memberof GoogleConversions
     */
    public static TranslateLocationObject(latlong: ILatLong): GoogleMapTypes.LatLng {
        const l: GoogleMapTypes.LatLng = new google.maps.LatLng(latlong.latitude, latlong.longitude);
        return l;
    }

    /**
     * Maps an GoogleMapTypes.LatLng object to a ILatLong object.
     *
     * @param latlng - Object to be mapped.
     * @returns - Mapped object.
     *
     * @memberof GoogleConversions
     */
    public static TranslateLatLngObject(latlng: GoogleMapTypes.LatLng): ILatLong {
        const l: ILatLong = { latitude: latlng.lat(), longitude: latlng.lng() };
        return l;
    }

    /**
     * Maps an ILatLong array to a array of GoogleMapTypes.LatLng object.
     *
     * @param latlongArray - Object to be mapped.
     * @returns - Mapped object.
     *
     * @memberof GoogleConversions
     */
    public static TranslateLocationObjectArray(latlongArray: Array<ILatLong>): Array<GoogleMapTypes.LatLng> {
        // use for loop for performance in case we deal with large numbers of points and paths...
        const p: Array<GoogleMapTypes.LatLng> = new Array<GoogleMapTypes.LatLng>();
        for (let i = 0; i < latlongArray.length; i++) {
            p.push(GoogleConversions.TranslateLocationObject(latlongArray[i]));
        }
        return p;
    }

    /**
     * Maps a MapTypeId object to a Google maptype string.
     *
     * @param mapTypeId - Object to be mapped.
     * @returns - Mapped object.
     *
     * @memberof GoogleConversions
     */
    public static TranslateMapTypeId(mapTypeId: MapTypeId): string {
        switch (mapTypeId) {
            case MapTypeId.road: return GoogleMapTypes.MapTypeId[GoogleMapTypes.MapTypeId.roadmap];
            case MapTypeId.grayscale: return GoogleMapTypes.MapTypeId[GoogleMapTypes.MapTypeId.terrain];
            case MapTypeId.hybrid: return GoogleMapTypes.MapTypeId[GoogleMapTypes.MapTypeId.hybrid];
            case MapTypeId.ordnanceSurvey: return GoogleMapTypes.MapTypeId[GoogleMapTypes.MapTypeId.terrain];
            default: return GoogleMapTypes.MapTypeId[GoogleMapTypes.MapTypeId.satellite];
        }
    }

    /**
     * Maps an IMarkerOptions object to a GoogleMapTypes.MarkerOptions object.
     *
     * @param options - Object to be mapped.
     * @returns - Promise that when resolved contains the mapped object.
     *
     * @memberof GoogleConversions
     */
    public static TranslateMarkerOptions(options: IMarkerOptions): GoogleMapTypes.MarkerOptions {
        const o: GoogleMapTypes.MarkerOptions | any = {};
        Object.keys(options)
            .filter(k => GoogleConversions._markerOptionsAttributes.indexOf(k) !== -1)
            .forEach((k) => {
                if (k === 'position') {
                    const latlng = GoogleConversions.TranslateLocationObject(options[k]);
                    o.position = latlng;
                }
                else {
                    o[k] = (<any>options)[k];
                }
            });
        return o;
    }

    /**
     * Maps an IMapOptions object to a GoogleMapTypes.MapOptions object.
     *
     * @param options - Object to be mapped.
     * @returns - Mapped object.
     *
     * @memberof GoogleConversions
     */
    public static TranslateOptions(options: IMapOptions): GoogleMapTypes.MapOptions {
        const o: GoogleMapTypes.MapOptions = {};
        Object.keys(options)
            .filter(k => GoogleConversions._mapOptionsAttributes.indexOf(k) !== -1)
            .forEach((k) => {
                if (k === 'center') {
                    o.center = GoogleConversions.TranslateLocation(options.center);
                }
                else if (k === 'mapTypeId') {
                    o.mapTypeId = GoogleConversions.TranslateMapTypeId(options.mapTypeId);
                }
                else if (k === 'disableZooming') {
                    o.gestureHandling = 'none';
                    o.zoomControl =  false;
                }
                else if (k === 'showMapTypeSelector') {
                    o.mapTypeControl = false;
                }
                else if (k === 'customMapStyleGoogle') {
                    o.styles = <GoogleMapTypes.MapTypeStyle[]><any> options.customMapStyleGoogle
                }
                else {
                    (<any>o)[k] = (<any>options)[k];
                }
            });
        return o;
    }

    /**
     * Translates an array of locations or an array or arrays of location to and array of arrays of Bing Map Locations
     *
     * @param paths - ILatLong based locations to convert.
     * @returns - converted locations.
     *
     * @memberof GoogleConversions
     */
    public static TranslatePaths(paths: Array<ILatLong> | Array<Array<ILatLong>>): Array<Array<GoogleMapTypes.LatLng>> {
        const p: Array<Array<GoogleMapTypes.LatLng>> = new Array<Array<GoogleMapTypes.LatLng>>();
        if (paths == null || !Array.isArray(paths) || paths.length === 0) {
            p.push(new Array<GoogleMapTypes.LatLng>());
        }
        else if (Array.isArray(paths[0])) {
            // parameter is an array or arrays
            // use for loop for performance in case we deal with large numbers of points and paths...
            const p1 = <Array<Array<ILatLong>>>paths;
            for (let i = 0; i < p1.length; i++) {
                p.push(GoogleConversions.TranslateLocationObjectArray(p1[i]));
            }
        }
        else {
            // parameter is a simple array....
            p.push(GoogleConversions.TranslateLocationObjectArray(<Array<ILatLong>>paths));
        }
        return p;
    }

    /**
     *  Maps an IPolygonOptions object to a GoogleMapTypes.PolygonOptions.
     *
     * @param options - Object to be mapped.
     * @returns - Mapped object.
     *
     * @memberof GoogleConversions
     */
    public static TranslatePolygonOptions(options: IPolygonOptions): GoogleMapTypes.PolygonOptions {
        const o: GoogleMapTypes.PolygonOptions | any = {};
        Object.keys(options)
            .filter(k => GoogleConversions._polygonOptionsAttributes.indexOf(k) !== -1)
            .forEach((k) => {
                if (k === 'paths') {
                    if (!Array.isArray(options.paths)) { return; }
                    if (options.paths.length === 0) {
                        o.paths = new Array<GoogleMapTypes.LatLng>();
                    }
                    else if (Array.isArray(options.paths[0])) {
                        o.paths = new Array<Array<GoogleMapTypes.LatLngLiteral>>();
                        // use for loop for performance in case we deal with large numbers of points and paths..
                        const p1 = <Array<Array<ILatLong>>>options.paths;
                        for (let i = 0; i < p1.length; i++) {
                            o.paths[i] = new Array<GoogleMapTypes.LatLngLiteral>();
                            for (let j = 0; j < p1[i].length; j++) {
                                o.paths[i][j] = {lat: p1[i][j].latitude, lng: p1[i][j].longitude};
                            }
                        }
                    }
                    else {
                        o.paths = new Array<GoogleMapTypes.LatLngLiteral>();
                        // use for loop for performance in case we deal with large numbers of points and paths..
                        const p1 = <Array<ILatLong>>options.paths;
                        for (let i = 0; i < p1.length; i++) {
                            o.paths[i] = {lat: p1[i].latitude, lng: p1[i].longitude};
                        }
                    }
                }
                else {
                    o[k] = (<any>options)[k];
                }
            });
        return o;
    }

    /**
     *  Maps an IPolylineOptions object to a GoogleMapTypes.PolylineOptions.
     *
     * @param options - Object to be mapped.
     * @returns - Mapped object.
     *
     * @memberof GoogleConversions
     */
    public static TranslatePolylineOptions(options: IPolylineOptions): GoogleMapTypes.PolylineOptions {
        const o: GoogleMapTypes.PolylineOptions | any = {};
        Object.keys(options)
            .filter(k => GoogleConversions._polylineOptionsAttributes.indexOf(k) !== -1)
            .forEach((k) => {
                o[k] = (<any>options)[k];
            });
        return o;
    }
}
