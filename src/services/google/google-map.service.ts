import { GoogleMarkerClusterer } from './../../models/google/google-marker-clusterer';
import { GoogleInfoWindow } from './../../models/google/google-info-window';
import { Injectable, NgZone } from '@angular/core';
import { Observer } from 'rxjs/Observer';
import { Observable } from 'rxjs/Observable';
import { MapService } from '../map.service';
import { MapAPILoader } from '../mapapiloader';
import { GoogleMapAPILoader, GoogleMapAPILoaderConfig } from './google-map-api-loader.service'
import { GoogleClusterService } from './google-cluster.service';
import { ILayerOptions } from '../../interfaces/ilayer-options';
import { IClusterOptions } from '../../interfaces/icluster-options';
import { IMapOptions } from '../../interfaces/imap-options';
import { ILatLong } from '../../interfaces/ilatlong';
import { IPoint } from '../../interfaces/ipoint';
import { IMarkerOptions } from '../../interfaces/imarker-options';
import { IMarkerIconInfo } from '../../interfaces/imarker-icon-info';
import { IPolygonOptions } from '../../interfaces/ipolygon-options';
import { IPolylineOptions } from '../../interfaces/ipolyline-options';
import { IInfoWindowOptions } from '../../interfaces/iinfo-window-options';
import { MapTypeId } from '../../models/map-type-id';
import { Marker } from '../../models/marker';
import { Polygon } from '../../models/polygon';
import { Polyline } from '../../models/polyline';
import { ExtendMapLabelWithOverlayView } from '../../models/google/google-label';
import { Layer } from '../../models/layer';
import { InfoWindow } from '../../models/info-window';
import { GooglePolygon } from '../../models/google/google-polygon';
import { GooglePolyline } from '../../models/google/google-polyline';
import { GoogleConversions } from './google-conversions';
import { GoogleMarker } from './../../models/google/google-marker';
import { IBox } from '../../interfaces/ibox';
import { GoogleMapEventsLookup } from '../../models/google/google-events-lookup'
import * as GoogleMapTypes from './google-map-types';

declare var google: any;
declare var MarkerClusterer: any;

/**
 * Concrete implementation of the MapService abstract implementing a Google Maps provider
 *
 * @export
 * @class GoogleMapService
 * @implements {MapService}
 */
@Injectable()
export class GoogleMapService implements MapService {

    ///
    /// Field Declarations
    ///

    private _map: Promise<GoogleMapTypes.GoogleMap>;
    private _mapInstance: GoogleMapTypes.GoogleMap;
    private _mapResolver: (value?: GoogleMapTypes.GoogleMap) => void;
    private _config: GoogleMapAPILoaderConfig;

    ///
    /// Property Definitions
    ///


    /**
     * Gets the Google Map control instance underlying the implementation
     *
     * @readonly
     * @type {GoogleMapTypes.GoogleMap}
     * @memberof GoogleMapService
     */
    public get MapInstance(): GoogleMapTypes.GoogleMap { return this._mapInstance; }

    /**
     * Gets a Promise for a Google Map control instance underlying the implementation. Use this instead of {@link MapInstance} if you
     * are not sure if and when the instance will be created.
     * @readonly
     * @type {Promise<GoogleMapTypes.GoogleMap>}
     * @memberof GoogleMapService
     */
    public get MapPromise(): Promise<GoogleMapTypes.GoogleMap> { return this._map; }

    ///
    /// Constructor
    ///

    /**
     * Creates an instance of GoogleMapService.
     * @param {MapAPILoader} _loader MapAPILoader instance implemented for Google Maps. This instance will generally be injected.
     * @param {NgZone} _zone NgZone object to enable zone aware promises. This will generally be injected.
     *
     * @memberof GoogleMapService
     */
    constructor(private _loader: MapAPILoader, private _zone: NgZone) {
        this._map = new Promise<GoogleMapTypes.GoogleMap>(
                (resolve: (map: GoogleMapTypes.GoogleMap) => void) => { this._mapResolver = resolve; }
        );
        this._config = (<GoogleMapAPILoader>this._loader).Config;
    }

    ///
    /// Public methods and MapService interface implementation
    ///

    /*
     * Creates a Google map cluster layer within the map context
     *
     * @param {IClusterOptions} options - Options for the layer. See {@link IClusterOptions}.
     * @returns {Promise<Layer>} - Promise of a {@link Layer} object, which models the underlying Microsoft.Maps.ClusterLayer object.
     *
     * @memberof GoogleMapService
     */
    public CreateClusterLayer(options: IClusterOptions): Promise<Layer> {
        return this._map.then((map: GoogleMapTypes.GoogleMap) => {
            const markerClusterer: GoogleMapTypes.MarkerClusterer = new MarkerClusterer(map, [], options);
            return new GoogleMarkerClusterer(markerClusterer);
        });
    }

    /**
     * Creates an information window for a map position
     *
     * @param {IInfoWindowOptions} [options] - Infowindow options. See {@link IInfoWindowOptions}
     * @returns {Promise<InfoWindow>} - Promise of a {@link InfoWindow} object, which models the underlying Microsoft.Maps.Infobox object.
     *
     * @memberof GoogleMapService
     */
    public CreateInfoWindow(options?: IInfoWindowOptions): Promise<GoogleInfoWindow> {
        return this._map.then((map: GoogleMapTypes.GoogleMap) => {
            const o: GoogleMapTypes.InfoWindowOptions = GoogleConversions.TranslateInfoWindowOptions(options);
            const infoWindow: GoogleMapTypes.InfoWindow = new google.maps.InfoWindow(o);
            return new GoogleInfoWindow(infoWindow, this);
        });
    }

    /**
     * Creates a map layer within the map context
     *
     * @param {ILayerOptions} options - Options for the layer. See {@link ILayerOptions}
     * @returns {Promise<Layer>} - Promise of a {@link Layer} object, which models the underlying Microsoft.Maps.Layer object.
     *
     * @memberof GoogleMapService
     */
    public CreateLayer(options: ILayerOptions): Promise<Layer> {
        return Promise.resolve(<any>{});
        // return this._map.then((map: GoogleMapTypes.GoogleMap) => {
        //     let layer: Microsoft.Maps.Layer = new Microsoft.Maps.Layer(options.id.toString());
        //     map.layers.insert(layer);
        //     return new GoogleLayer(layer, this);
        // });
    }

    /**
     * Creates a map instance
     *
     * @param {HTMLElement} el - HTML element to host the map.
     * @param {IMapOptions} mapOptions - Map options
     * @returns {Promise<void>} - Promise fullfilled once the map has been created.
     *
     * @memberof GoogleMapService
     */
    public CreateMap(el: HTMLElement, mapOptions: IMapOptions): Promise<void> {
        return this._loader.Load().then(() => {
            ExtendMapLabelWithOverlayView();
            if (!mapOptions.mapTypeId == null) { mapOptions.mapTypeId = MapTypeId.hybrid; }

            const o: GoogleMapTypes.MapOptions = GoogleConversions.TranslateOptions(mapOptions);
            const map: GoogleMapTypes.GoogleMap = new google.maps.Map(el, o);
            if (mapOptions.bounds) {
                map.fitBounds(GoogleConversions.TranslateBounds(mapOptions.bounds));
            }
            this._mapResolver(map);
            return;
        });
    }

    /**
     * Creates a Google map marker within the map context
     *
     * @param {IMarkerOptions} [options=<IMarkerOptions>{}] - Options for the marker. See {@link IMarkerOptions}.
     * @returns {Promise<Marker>} - Promise of a {@link Marker} object, which models the underlying Microsoft.Maps.PushPin object.
     *
     * @memberof GoogleMapService
     */
    public CreateMarker(options: IMarkerOptions = <IMarkerOptions>{}): Promise<Marker> {
        return this._map.then((map: GoogleMapTypes.GoogleMap) => {
            const payload = (x: GoogleMapTypes.MarkerOptions): GoogleMarker => {
                const marker = new google.maps.Marker(x);
                marker.setMap(map);
                return new GoogleMarker(marker);
            };
            const o: GoogleMapTypes.MarkerOptions = GoogleConversions.TranslateMarkerOptions(options);
            if (options.iconInfo && options.iconInfo.markerType) {
                const s = Marker.CreateMarker(options.iconInfo);
                if (typeof(s) === 'string') {
                    o.icon = s;
                    return payload(o);
                }
                else {
                    return s.then(x => {
                        o.icon = x.icon;
                        return payload(o);
                    });
                }
            }
            else {
                return payload(o);
            }
        });
    }

    /**
     * Creates a polygon within the Google Map map context
     *
     * @abstract
     * @param {IPolygonOptions} options - Options for the polygon. See {@link IPolygonOptions}.
     * @returns {Promise<Polygon>} - Promise of a {@link Polygon} object, which models the underlying native polygon.
     *
     * @memberof MapService
     */
    public CreatePolygon(options: IPolygonOptions): Promise<Polygon> {
        return this._map.then((map: GoogleMapTypes.GoogleMap) => {
            const o: GoogleMapTypes.PolygonOptions = GoogleConversions.TranslatePolygonOptions(options);
            const polygon: GoogleMapTypes.Polygon = new google.maps.Polygon(o);
            polygon.setMap(map);

            const p: GooglePolygon = new GooglePolygon(polygon);
            if (options.title && options.title !== '') { p.Title = options.title; }
            if (options.showLabel != null) { p.ShowLabel = options.showLabel; }
            if (options.showTooltip != null) { p.ShowTooltip = options.showTooltip; }
            if (options.labelMaxZoom != null) { p.LabelMaxZoom = options.labelMaxZoom; }
            if (options.labelMinZoom != null) { p.LabelMinZoom = options.labelMinZoom; }
            return p;
        });
    }

    /**
     * Creates a polyline within the Google Map map context
     *
     * @abstract
     * @param {IPolylineOptions} options - Options for the polyline. See {@link IPolylineOptions}.
     * @returns {Promise<Polyline>} - Promise of a {@link Polyline} object (or an array therefore for complex paths)
     * which models the underlying native polyline.
     *
     * @memberof MapService
     */
    public CreatePolyline(options: IPolylineOptions): Promise<Polyline|Array<Polyline>> {
        let polyline: GoogleMapTypes.Polyline;
        return this._map.then((map: GoogleMapTypes.GoogleMap) => {
            const o: GoogleMapTypes.PolylineOptions = GoogleConversions.TranslatePolylineOptions(options);
            if (options.path && options.path.length > 0 && !Array.isArray(options.path[0])) {
                o.path = GoogleConversions.TranslatePaths(options.path)[0];
                polyline = new google.maps.Polyline(o);
                polyline.setMap(map);

                const pl = new GooglePolyline(polyline);
                if (options.title && options.title !== '') { pl.Title = options.title; }
                if (options.showTooltip != null) { pl.ShowTooltip = options.showTooltip; }
                return pl;
            }
            else {
                const paths: Array<Array<GoogleMapTypes.LatLng>> = GoogleConversions.TranslatePaths(options.path);
                const lines: Array<Polyline> = new Array<Polyline>();
                paths.forEach(p => {
                    o.path = p;
                    polyline = new google.maps.Polyline(o);
                    polyline.setMap(map);

                    const pl = new GooglePolyline(polyline);
                    if (options.title && options.title !== '') { pl.Title = options.title; }
                    if (options.showTooltip != null) { pl.ShowTooltip = options.showTooltip; }
                    lines.push(pl);
                });
                return lines;
            }
        });
    }

    /**
     * Deletes a layer from the map.
     *
     * @param {Layer} layer - Layer to delete. See {@link Layer}. This method expects the Google specific Layer model implementation.
     * @returns {Promise<void>} - Promise fullfilled when the layer has been removed.
     *
     * @memberof GoogleMapService
     */
    public DeleteLayer(layer: Layer): Promise<void> {
        return Promise.resolve();
        // return this._map.then((map: GoogleMapTypes.GoogleMap) => {
        //     map.layers.remove(layer.NativePrimitve);
        // });
    }

    /**
     * Dispaose the map and associated resoures.
     *
     * @returns {void}
     *
     * @memberof GoogleMapService
     */
    public DisposeMap(): void {
        if (this._map == null && this._mapInstance == null) { return; }
        if (this._mapInstance != null) {
            this._mapInstance = null;
            this._map = new Promise<GoogleMapTypes.GoogleMap>((resolve: () => void) => { this._mapResolver = resolve; });
        }
    }

    /**
     * Gets the geo coordinates of the map center
     *
     * @returns {Promise<ILatLong>} - A promise that when fullfilled contains the goe location of the center. See {@link ILatLong}.
     *
     * @memberof GoogleMapService
     */
    public GetCenter(): Promise<ILatLong> {
        return this._map.then((map: GoogleMapTypes.GoogleMap) => {
            const center: GoogleMapTypes.LatLng = map.getCenter();
            return <ILatLong>{
                latitude: center.lat(),
                longitude: center.lng()
            };
        });
    }

    /**
     * Gets the geo coordinates of the map bounding box
     *
     * @returns {Promise<IBox>} - A promise that when fullfilled contains the geo location of the bounding box. See {@link IBox}.
     *
     * @memberof GoogleMapService
     */
    public GetBounds(): Promise<IBox> {
        return this._map.then((map: GoogleMapTypes.GoogleMap) => {
            const box = map.getBounds();
            return <IBox>{
                maxLatitude: Math.max(box.getNorthEast().lat(), box.getSouthWest().lat()),
                maxLongitude: Math.max(box.getNorthEast().lng(), box.getSouthWest().lng()),
                minLatitude: Math.min(box.getNorthEast().lat(), box.getSouthWest().lat()),
                minLongitude: Math.min(box.getNorthEast().lng(), box.getSouthWest().lng()),
                center: { latitude: box.getCenter().lat(), longitude: box.getCenter().lng() },
                padding: 0
            };
        });
    }

    /**
     * Gets the current zoom level of the map.
     *
     * @returns {Promise<number>} - A promise that when fullfilled contains the zoom level.
     *
     * @memberof GoogleMapService
     */
    public GetZoom(): Promise<number> {
        return this._map.then((map: GoogleMapTypes.GoogleMap) => map.getZoom());
    }

    /**
     * Provides a conversion of geo coordinates to pixels on the map control.
     *
     * @param {ILatLong} loc - The geo coordinates to translate.
     * @returns {Promise<IPoint>} - Promise of an {@link IPoint} interface representing the pixels. This promise resolves to null
     * if the goe coordinates are not in the view port.
     *
     * @memberof GoogleMapService
     */
    public LocationToPoint(loc: ILatLong): Promise<IPoint> {
        return this._map.then((m: GoogleMapTypes.GoogleMap) => {
            // let l: Microsoft.Maps.Location = GoogleConversions.TranslateLocation(loc);
            // let p: Microsoft.Maps.Point = <Microsoft.Maps.Point>m.tryLocationToPixel(l, Microsoft.Maps.PixelReference.control);
            // if (p != null) return { x: p.x, y: p.y };
            return null;
        })
    }

    /**
     * Centers the map on a geo location.
     *
     * @param {ILatLong} latLng - GeoCoordinates around which to center the map. See {@link ILatLong}
     * @returns {Promise<void>} - Promise that is fullfilled when the center operations has been completed.
     *
     * @memberof GoogleMapService
     */
    public SetCenter(latLng: ILatLong): Promise<void> {
        return this._map.then((map: GoogleMapTypes.GoogleMap) => {
            const center: GoogleMapTypes.LatLng = GoogleConversions.TranslateLocationObject(latLng);
            map.setCenter(center);
        });
    }

    /**
     * Sets the generic map options.
     *
     * @param {IMapOptions} options - Options to set.
     *
     * @memberof GoogleMapService
     */
    public SetMapOptions(options: IMapOptions) {
        this._map.then((m: GoogleMapTypes.GoogleMap) => {
            const o: GoogleMapTypes.MapOptions = GoogleConversions.TranslateOptions(options);
            m.setOptions(o);
        });
    }

    /**
     * Sets the view options of the map.
     *
     * @param {IMapOptions} options - Options to set.
     *
     * @memberof GoogleMapService
     */
    public SetViewOptions(options: IMapOptions) {
        this._map.then((m: GoogleMapTypes.GoogleMap) => {
            if (options.bounds) {
                m.fitBounds(GoogleConversions.TranslateBounds(options.bounds));
            }
            const o: GoogleMapTypes.MapOptions = GoogleConversions.TranslateOptions(options);
            m.setOptions(o);
        });
    }

    /**
     * Sets the zoom level of the map.
     *
     * @param {number} zoom - Zoom level to set.
     * @returns {Promise<void>} - A Promise that is fullfilled once the zoom operation is complete.
     *
     * @memberof GoogleMapService
     */
    public SetZoom(zoom: number): Promise<void> {
        return this._map.then((map: GoogleMapTypes.GoogleMap) => map.setZoom(zoom));
    }

    /**
     * Creates an event subscription
     *
     * @template E - Generic type of the underlying event.
     * @param {string} eventName - The name of the event (e.g. 'click')
     * @returns {Observable<E>} - An observable of type E that fires when the event occurs.
     *
     * @memberof GoogleMapService
     */
    public SubscribeToMapEvent<E>(eventName: string): Observable<E> {
        const googleEventName: string = GoogleMapEventsLookup[eventName];
        return Observable.create((observer: Observer<E>) => {
            this._map.then((m: GoogleMapTypes.GoogleMap) => {
                m.addListener(googleEventName, (e: any) => {
                    this._zone.run(() => observer.next(e));
                });
            });
        });
    }

    /**
     * Triggers the given event name on the map instance.
     *
     * @param {string} eventName - Event to trigger.
     * @returns {Promise<void>} - A promise that is fullfilled once the event is triggered.
     *
     * @memberof GoogleMapService
     */
    public TriggerMapEvent(eventName: string): Promise<void> {
        return this._map.then((m) => google.maps.event.trigger(m, eventName, null));
    }

}
