import { IInfoWindowOptions } from './../../interfaces/iinfo-window-options';
import { IBox } from './../../interfaces/ibox';
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
 * @class GoogleConversions
 */
export class GoogleConversions {

    ///
    /// Field declarations
    ///

    /**
     * Map option attributes that are supported for conversion to Google Map properties
     *
     * @type string[]
     * @memberof GoogleConversions
     * @private
     * @static
     */
    private static _mapOptionsAttributes: string[] = [
        'backgroundColor',
        'center',
        'clickableIcons',
        'disableDefaultUI',
        'disableDoubleClickZoom',
        'draggable',
        'draggableCursor',
        'draggingCursor',
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
     * @type string[]
     * @memberof GoogleConversions
     * @private
     * @static
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
     * @type string[]
     * @memberof GoogleConversions
     * @private
     * @static
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
     * @type string[]
     * @memberof GoogleConversions
     * @private
     * @static
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
     * @type string[]
     * @memberof GoogleConversions
     * @private
     * @static
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
     * @type string[]
     * @memberof GoogleConversions
     * @private
     * @static
     */
    private static _polylineOptionsAttributes: string[] = [
        'clickable',
        'draggable',
        'editable',
        'geodesic',
        'path',
        'strokeColor',
        'strokeOpacity',
        'strokeWeight',
        'visible',
        'zIndex'
    ];

    /**
     * Maps an IBox object to a GoogleMapTypes.LatLngBoundsLiteral object.
     *
     * @static
     * @param {IBox} box - Object to be mapped.
     * @returns {GoogleMapTypes.LatLngBoundsLiteral} - Mapped object.
     *
     * @memberof GoogleConversions
     */
    public static TranslateBounds(bounds: IBox): GoogleMapTypes.LatLngBoundsLiteral {
        const b: GoogleMapTypes.LatLngBoundsLiteral = {
            east: bounds.maxLongitude,
            north: bounds.maxLatitude,
            south: bounds.minLatitude,
            west: bounds.minLongitude,
        }
        return b;
    }

    /**
     * Maps an IInfoWindowOptions object to a GoogleMapTypes.InfoWindowOptions object.
     *
     * @static
     * @param {IInfoWindowOptions} options - Object to be mapped.
     * @returns {GoogleMapTypes.InfoWindowOptions} - Mapped object.
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
                    o[k] = (<any>options)[k]
                };
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
     * @static
     * @param {ILatLong} latlong - Object to be mapped.
     * @returns {GoogleMapTypes.LatLngLiteral} - Mapped object.
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
     * @static
     * @param {GoogleMapTypes.LatLngLiteral} latlong - Object to be mapped.
     * @returns {ILatLong} - Mapped object.
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
     * @static
     * @param {ILatLong} latlong - Object to be mapped.
     * @returns {GoogleMapTypes.LatLng} - Mapped object.
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
     * @static
     * @param {GoogleMapTypes.LatLng} latlong - Object to be mapped.
     * @returns {ILatLong} - Mapped object.
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
     * @static
     * @param {Array<ILatLong>} latlongArray - Object to be mapped.
     * @returns {Array<GoogleMapTypes.LatLng>} - Mapped object.
     *
     * @memberof GoogleConversions
     */
    public static TranslateLocationObjectArray(latlongArray: Array<ILatLong>): Array<GoogleMapTypes.LatLng> {
        const p: Array<GoogleMapTypes.LatLng> = new Array<GoogleMapTypes.LatLng>();
        latlongArray.forEach(x => p.push(GoogleConversions.TranslateLocationObject(x)));
        return p;
    }

    /**
     * Maps a MapTypeId object to a Google maptype string.
     *
     * @static
     * @param {MapTypeId} mapTypeId - Object to be mapped.
     * @returns {string} - Mapped object.
     *
     * @memberof GoogleConversions
     */
    public static TranslateMapTypeId(mapTypeId: MapTypeId): string {
        switch (mapTypeId) {
            case MapTypeId.road: return GoogleMapTypes.MapTypeId[GoogleMapTypes.MapTypeId.roadmap];
            case MapTypeId.grayscale: return GoogleMapTypes.MapTypeId[GoogleMapTypes.MapTypeId.terrain];
            default: return GoogleMapTypes.MapTypeId[GoogleMapTypes.MapTypeId.satellite];
        }
    }

    /**
     * Maps an IMarkerOptions object to a GoogleMapTypes.MarkerOptions object.
     *
     * @static
     * @param {IMarkerOptions} options - Object to be mapped.
     * @returns {GoogleMapTypes.MarkerOptions} - Promise that when resolved contains the mapped object.
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
                } else {
                    o[k] = (<any>options)[k]
                };
            });
        return o;
    }

    /**
     * Maps an IMapOptions object to a GoogleMapTypes.MapOptions object.
     *
     * @static
     * @param {IMapOptions} options - Object to be mapped.
     * @returns {GoogleMapTypes.MapOptions} - Mapped object.
     *
     * @memberof GoogleConversions
     */
    public static TranslateOptions(options: IMapOptions): GoogleMapTypes.MapOptions {
        const o: GoogleMapTypes.MapOptions | any = {};
        Object.keys(options)
            .filter(k => GoogleConversions._mapOptionsAttributes.indexOf(k) !== -1)
            .forEach((k) => {
                if (k === 'center') {
                    o.center = GoogleConversions.TranslateLocation(options.center);
                } else if (k === 'mapTypeId') {
                    o.mapTypeId = GoogleConversions.TranslateMapTypeId(options.mapTypeId);
                } else {
                    o[k] = (<any>options)[k]
                };
            });
        return o;
    }

    /**
     *  Maps an IPolygonOptions object to a GoogleMapTypes.PolygonOptions.
     *
     * @static
     * @param {IPolygonOptions} options - Object to be mapped.
     * @returns {GoogleMapTypes.PolygonOptions} - Mapped object.
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
                    } else if (Array.isArray(options.paths[0])) {
                        o.paths = new Array<Array<GoogleMapTypes.LatLng>>();
                        (<Array<Array<ILatLong>>>options.paths).forEach(path => {
                            o.paths.push(GoogleConversions.TranslateLocationObjectArray(path));
                        });
                    } else {
                        o.paths = GoogleConversions.TranslateLocationObjectArray(<Array<ILatLong>>options.paths);
                    }
                } else {
                    o[k] = (<any>options)[k]
                };
            });
        return o;
    }

    /**
     *  Maps an IPolylineOptions object to a GoogleMapTypes.PolylineOptions.
     *
     * @static
     * @param {IPolylineOptions} options - Object to be mapped.
     * @returns {GoogleMapTypes.PolylineOptions} - Mapped object.
     *
     * @memberof GoogleConversions
     */
    public static TranslatePolylineOptions(options: IPolylineOptions): GoogleMapTypes.PolylineOptions {
        const o: GoogleMapTypes.PolylineOptions | any = {};
        Object.keys(options)
            .filter(k => GoogleConversions._polylineOptionsAttributes.indexOf(k) !== -1)
            .forEach((k) => {
                if (k === 'path') {
                    if (!Array.isArray(options.path)) { return; }
                    if (options.path.length === 0) {
                        o.path = new Array<GoogleMapTypes.LatLng>();
                    } else if (Array.isArray(options.path[0])) {
                        o.path = new Array<Array<GoogleMapTypes.LatLng>>();
                        (<Array<Array<ILatLong>>>options.path).forEach(path => {
                            o.path.push(GoogleConversions.TranslateLocationObjectArray(path));
                        });
                    } else {
                        o.path = GoogleConversions.TranslateLocationObjectArray(<Array<ILatLong>>options.path);
                    }
                } else {
                    o[k] = (<any>options)[k]
                };
            });
        return o;
    }
}
