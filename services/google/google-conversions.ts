import { IPolylineOptions } from './../../interfaces/Ipolylineoptions';
import { IMarkerOptions } from './../../interfaces/Imarkeroptions';
import { IInfoWindowOptions } from './../../interfaces/Iinfowindowoptions';
import { IMapOptions } from '../../interfaces/imapoptions';
import { IPolygonOptions } from '../../interfaces/ipolygonoptions';
import { ILatLong } from '../../interfaces/ilatlong';
import * as GoogleMapTypes from './google-map-types';
import { MapTypeId } from '../../models/maptypeid';

declare var google: any;

export class GoogleConversions {

    ///
    /// Map option attributes that can change over time
    ///
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

    public static TranslateLocation(latlong: ILatLong): GoogleMapTypes.LatLngLiteral {
        const l: GoogleMapTypes.LatLngLiteral = { lat: latlong.latitude, lng: latlong.longitude };
        return l;
    }

    public static TranslateLatLng(latlng: GoogleMapTypes.LatLngLiteral) {
        const l: ILatLong = { latitude: latlng.lat, longitude: latlng.lng };
        return l;
    }

    public static TranslateLocationObject(latlong: ILatLong): GoogleMapTypes.LatLng {
        const l: GoogleMapTypes.LatLng = new google.maps.LatLng(latlong.latitude, latlong.longitude);
        return l;
    }

    public static TranslateLatLngObject(latlng: GoogleMapTypes.LatLng) {
        const l: ILatLong = { latitude: latlng.lat(), longitude: latlng.lng() };
        return l;
    }

    public static TranslateLocationObjectArray(latlongArray: Array<ILatLong>): Array<GoogleMapTypes.LatLng> {
        const p: Array<GoogleMapTypes.LatLng> = new Array<GoogleMapTypes.LatLng>();
        latlongArray.forEach(x => p.push(GoogleConversions.TranslateLocationObject(x)));
        return p;
    }

    public static TranslateMapTypeId(mapTypeId: MapTypeId): string {
        switch (mapTypeId) {
            case MapTypeId.road:
                return GoogleMapTypes.MapTypeId[GoogleMapTypes.MapTypeId.roadmap];
            case MapTypeId.grayscale:
                return GoogleMapTypes.MapTypeId[GoogleMapTypes.MapTypeId.terrain];
            default:
                return GoogleMapTypes.MapTypeId[GoogleMapTypes.MapTypeId.satellite];
        }
    }

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
        return o;
    }

}
