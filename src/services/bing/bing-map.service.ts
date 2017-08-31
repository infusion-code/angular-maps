import { Injectable, NgZone } from '@angular/core';
import { Observer } from 'rxjs/Observer';
import { Observable } from 'rxjs/Observable';

import { MapService } from './../map.service';
import { MapAPILoader } from './../mapapiloader';
import { BingMapAPILoader, BingMapAPILoaderConfig } from './bing-map.api-loader.service';
import { BingConversions } from './bing-conversions';
import { Marker } from './../../models/marker';
import { Polygon } from './../../models/polygon';
import { Polyline } from './../../models/polyline';
import { MarkerTypeId } from './../../models/marker-type-id';
import { InfoWindow } from './../../models/info-window'
import { BingMarker } from './../../models/bing/bing-marker';
import { Layer } from './../../models/layer';
import { BingLayer } from './../../models/bing/bing-layer';
import { BingClusterLayer } from './../../models/bing/bing-cluster-layer';
import { BingInfoWindow } from './../../models/bing/bing-info-window';
import { BingPolygon } from './../../models/bing/bing-polygon';
import { BingPolyline } from './../../models/bing/bing-polyline';
import { MixinMapLabelWithOverlayView } from './../../models/bing/bing-label';
import { MixinCanvasOverlay } from './../../models/bing/bing-canvas-overlay';
import { BingCanvasOverlay } from './../../models/bing/bing-canvas-overlay';
import { CanvasOverlay } from './../../models/canvas-overlay';
import { ILayerOptions } from './../../interfaces/ilayer-options';
import { IClusterOptions } from './../../interfaces/icluster-options';
import { IMapOptions } from './../../interfaces/imap-options';
import { ILatLong } from './../../interfaces/ilatlong';
import { IPoint } from './../../interfaces/ipoint';
import { ISize } from './../../interfaces/isize';
import { IMarkerOptions } from './../../interfaces/imarker-options';
import { IMarkerIconInfo } from './../../interfaces/imarker-icon-info';
import { IInfoWindowOptions } from './../../interfaces/iinfo-window-options';
import { IPolygonOptions } from './../../interfaces/ipolygon-options';
import { IPolylineOptions } from './../../interfaces/ipolyline-options';
import { IBox } from '../../interfaces/ibox';

import { BingMapEventsLookup } from '../../models/bing/bing-events-lookup';

/**
 * Concrete implementation of the MapService abstract implementing a Bin Map V8 provider
 *
 * @export
 * @class BingMapService
 * @implements {MapService}
 */
@Injectable()
export class BingMapService implements MapService {
    ///
    /// Field Declarations
    ///

    private _map: Promise<Microsoft.Maps.Map>;
    private _mapInstance: Microsoft.Maps.Map;
    private _mapResolver: (value?: Microsoft.Maps.Map) => void;
    private _config: BingMapAPILoaderConfig;

    ///
    /// Property Definitions
    ///


    /**
     * Gets the Bing Map control instance underlying the implementation
     *
     * @readonly
     * @type {Microsoft.Maps.Map}
     * @memberof BingMapService
     */
    public get MapInstance(): Microsoft.Maps.Map { return this._mapInstance; }

    /**
     * Gets a Promise for a Bing Map control instance underlying the implementation. Use this instead of {@link MapInstance} if you
     * are not sure if and when the instance will be created.
     * @readonly
     * @type {Promise<Microsoft.Maps.Map>}
     * @memberof BingMapService
     */
    public get MapPromise(): Promise<Microsoft.Maps.Map> { return this._map; }

    /**
     * Gets the maps physical size.
     *
     * @readonly
     * @abstract
     * @type {ISize}
     * @memberof BingMapService
     */
    public get MapSize(): ISize {
        if (this.MapInstance) {
            const s: ISize = { width: this.MapInstance.getWidth(), height: this.MapInstance.getHeight() };
            return s;
        }
        return null;
    }

    ///
    /// Constructor
    ///

    /**
     * Creates an instance of BingMapService.
     * @param {MapAPILoader} _loader MapAPILoader instance implemented for Bing Maps. This instance will generally be injected.
     * @param {NgZone} _zone NgZone object to enable zone aware promises. This will generally be injected.
     *
     * @memberof BingMapService
     */
    constructor(private _loader: MapAPILoader, private _zone: NgZone) {
        this._map = new Promise<Microsoft.Maps.Map>((resolve: () => void) => { this._mapResolver = resolve; });
        this._config = (<BingMapAPILoader>this._loader).Config;
    }

    ///
    /// Public methods and MapService interface implementation
    ///

    /**
     * Creates a canvas overlay layer to perform custom drawing over the map with out
     * some of the overhead associated with going through the Map objects.
     * @param  {HTMLCanvasElements => void} drawCallback A callback function that is triggered when the canvas is ready to be
     * rendered for the current map view.
     * @returns {Promise<CanvasOverlay>} - Promise of a {@link CanvasOverlay} object.
     * @memberof BingMapService
     */
    public CreateCanvasOverlay(drawCallback: (canvas: HTMLCanvasElement) => void): Promise<CanvasOverlay> {
        return this._map.then((map: Microsoft.Maps.Map) => {
            const overlay: BingCanvasOverlay = new BingCanvasOverlay(drawCallback);
            map.layers.insert(overlay);
            return overlay;
        });
    }

    /**
     * Creates a Bing map cluster layer within the map context
     *
     * @param {IClusterOptions} options - Options for the layer. See {@link IClusterOptions}.
     * @returns {Promise<Layer>} - Promise of a {@link Layer} object, which models the underlying Microsoft.Maps.ClusterLayer object.
     *
     * @memberof BingMapService
     */
    public CreateClusterLayer(options: IClusterOptions): Promise<Layer> {
        return this._map.then((map: Microsoft.Maps.Map) => {
            const p: Promise<Layer> = new Promise<Layer>(resolve => {
                Microsoft.Maps.loadModule('Microsoft.Maps.Clustering', () => {
                    const o: Microsoft.Maps.IClusterLayerOptions = BingConversions.TranslateClusterOptions(options);
                    const layer: Microsoft.Maps.ClusterLayer = new Microsoft.Maps.ClusterLayer(new Array<Microsoft.Maps.Pushpin>(), o);
                    let bl: BingClusterLayer;
                    map.layers.insert(layer);
                    bl = new BingClusterLayer(layer, this);
                    bl.SetOptions(options);
                    resolve(bl);
                });
            });
            return p;
        });
    }

    /**
     * Creates an information window for a map position
     *
     * @param {IInfoWindowOptions} [options] - Infowindow options. See {@link IInfoWindowOptions}
     * @returns {Promise<InfoWindow>} - Promise of a {@link InfoWindow} object, which models the underlying Microsoft.Maps.Infobox object.
     *
     * @memberof BingMapService
     */
    public CreateInfoWindow(options?: IInfoWindowOptions): Promise<InfoWindow> {
        return this._map.then((map: Microsoft.Maps.Map) => {
            let loc: Microsoft.Maps.Location;
            if (options.position == null) {
                loc = map.getCenter();
            } else {
                loc = new Microsoft.Maps.Location(options.position.latitude, options.position.longitude);
            }
            const infoBox: Microsoft.Maps.Infobox = new Microsoft.Maps.Infobox(loc, BingConversions.TranslateInfoBoxOptions(options));
            infoBox.setMap(map);
            return new BingInfoWindow(infoBox);
        });
    }

    /**
     * Creates a map layer within the map context
     *
     * @param {ILayerOptions} options - Options for the layer. See {@link ILayerOptions}
     * @returns {Promise<Layer>} - Promise of a {@link Layer} object, which models the underlying Microsoft.Maps.Layer object.
     *
     * @memberof BingMapService
     */
    public CreateLayer(options: ILayerOptions): Promise<Layer> {
        return this._map.then((map: Microsoft.Maps.Map) => {
            const layer: Microsoft.Maps.Layer = new Microsoft.Maps.Layer(options.id.toString());
            map.layers.insert(layer);
            return new BingLayer(layer, this);
        });
    }

    /**
     * Creates a map instance
     *
     * @param {HTMLElement} el - HTML element to host the map.
     * @param {IMapOptions} mapOptions - Map options
     * @returns {Promise<void>} - Promise fullfilled once the map has been created.
     *
     * @memberof BingMapService
     */
    public CreateMap(el: HTMLElement, mapOptions: IMapOptions): Promise<void> {
        return this._loader.Load().then(() => {
            // apply mixins
            MixinMapLabelWithOverlayView();
            MixinCanvasOverlay();

            // map startup...
            if (this._mapInstance != null) {
                this.DisposeMap();
            }
            const o: Microsoft.Maps.IMapLoadOptions = BingConversions.TranslateLoadOptions(mapOptions);
            if (!o.credentials) {
                o.credentials = this._config.apiKey;
            }
            const map = new Microsoft.Maps.Map(el, o);
            this._mapInstance = map;
            this._mapResolver(map);
            return;
        });
    }

    /**
     * Creates a Bing map marker within the map context
     *
     * @param {IMarkerOptions} [options=<IMarkerOptions>{}] - Options for the marker. See {@link IMarkerOptions}.
     * @returns {Promise<Marker>} - Promise of a {@link Marker} object, which models the underlying Microsoft.Maps.PushPin object.
     *
     * @memberof BingMapService
     */
    public CreateMarker(options: IMarkerOptions = <IMarkerOptions>{}): Promise<Marker> {
        const payload = (icon: string, map: Microsoft.Maps.Map): BingMarker => {
            const loc: Microsoft.Maps.Location = BingConversions.TranslateLocation(options.position);
            const o: Microsoft.Maps.IPushpinOptions = BingConversions.TranslateMarkerOptions(options);
            if (icon && icon !== '') { o.icon = icon; }
            const pushpin: Microsoft.Maps.Pushpin = new Microsoft.Maps.Pushpin(loc, o);
            const marker: BingMarker = new BingMarker(pushpin, map, null);
            if (options.metadata) { options.metadata.forEach((v, k) => marker.Metadata.set(k, v)); }
            map.entities.push(pushpin);
            return marker;
        }
        return this._map.then((map: Microsoft.Maps.Map) => {
            if (options.iconInfo && options.iconInfo.markerType) {
                const s = Marker.CreateMarker(options.iconInfo);
                if (typeof(s) === 'string') { return(payload(s, map)); }
                else {
                    return s.then(x => {
                        return(payload(x.icon, map));
                    });
                }
            }
            else {
                return (payload(null, map));
            }
        });
    }

    /**
     * Creates a polygon within the Bing Maps V8 map context
     *
     * @abstract
     * @param {IPolygonOptions} options - Options for the polygon. See {@link IPolygonOptions}.
     * @returns {Promise<Polygon>} - Promise of a {@link Polygon} object, which models the underlying native polygon.
     *
     * @memberof MapService
     */
    public CreatePolygon(options: IPolygonOptions): Promise<Polygon> {
        return this._map.then((map: Microsoft.Maps.Map) => {
            const locs: Array<Array<Microsoft.Maps.Location>> = BingConversions.TranslatePaths(options.paths);
            const o: Microsoft.Maps.IPolylineOptions = BingConversions.TranslatePolygonOptions(options);
            const poly: Microsoft.Maps.Polygon = new Microsoft.Maps.Polygon(locs, o);
            map.entities.push(poly);

            const p = new BingPolygon(poly, map, null);
            if (options.title && options.title !== '') { p.Title = options.title; }
            if (options.showLabel != null) { p.ShowLabel = options.showLabel; }
            if (options.showTooltip != null) { p.ShowTooltip = options.showTooltip; }
            if (options.labelMaxZoom != null) { p.LabelMaxZoom = options.labelMaxZoom; }
            if (options.labelMinZoom != null) { p.LabelMinZoom = options.labelMinZoom; }
            return p;
        });
    }

    /**
     * Creates a polyline within the Bing Maps V8 map context
     *
     * @abstract
     * @param {IPolylinenOptions} options - Options for the polyline. See {@link IPolylineOptions}.
     * @returns {Promise<Polyline>} - Promise of a {@link Polyline} object (or an array thereof for complex paths),
     * which models the underlying native polygon.
     *
     * @memberof MapService
     */
    public CreatePolyline(options: IPolylineOptions): Promise<Polyline|Array<Polyline>> {
        let polyline: Microsoft.Maps.Polyline;
        return this._map.then((map: Microsoft.Maps.Map) => {
            const o: Microsoft.Maps.IPolylineOptions = BingConversions.TranslatePolylineOptions(options);
            const locs: Array<Array<Microsoft.Maps.Location>> = BingConversions.TranslatePaths(options.path);
            if (options.path && options.path.length > 0 && !Array.isArray(options.path[0])) {
                polyline = new Microsoft.Maps.Polyline(locs[0], o);
                map.entities.push(polyline);

                const pl = new BingPolyline(polyline, map, null);
                if (options.title && options.title !== '') { pl.Title = options.title; }
                if (options.showTooltip != null) { pl.ShowTooltip = options.showTooltip; }
                return pl;
            }
            else {
                const lines: Array<Polyline> = new Array<Polyline>();
                locs.forEach(p => {
                    polyline = new Microsoft.Maps.Polyline(p, o);
                    map.entities.push(polyline);

                    const pl = new BingPolyline(polyline, map, null);
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
     * @param {Layer} layer - Layer to delete. See {@link Layer}. This method expects the Bing specific Layer model implementation.
     * @returns {Promise<void>} - Promise fullfilled when the layer has been removed.
     *
     * @memberof BingMapService
     */
    public DeleteLayer(layer: Layer): Promise<void> {
        return this._map.then((map: Microsoft.Maps.Map) => {
            map.layers.remove(layer.NativePrimitve);
        });
    }

    /**
     * Dispaose the map and associated resoures.
     *
     * @returns {void}
     *
     * @memberof BingMapService
     */
    public DisposeMap(): void {
        if (this._map == null && this._mapInstance == null) {
            return;
        }
        if (this._mapInstance != null) {
            this._mapInstance.dispose();
            this._mapInstance = null;
            this._map = new Promise<Microsoft.Maps.Map>((resolve: () => void) => { this._mapResolver = resolve; });
        }
    }

    /**
     * Gets the geo coordinates of the map center
     *
     * @returns {Promise<ILatLong>} - A promise that when fullfilled contains the goe location of the center. See {@link ILatLong}.
     *
     * @memberof BingMapService
     */
    public GetCenter(): Promise<ILatLong> {
        return this._map.then((map: Microsoft.Maps.Map) => {
            const center = map.getCenter();
            return <ILatLong>{
                latitude: center.latitude,
                longitude: center.longitude
            };
        });
    }

    /**
     * Gets the geo coordinates of the map bounding box
     *
     * @returns {Promise<IBox>} - A promise that when fullfilled contains the goe location of the bounding box. See {@link IBox}.
     *
     * @memberof BingMapService
     */
    public GetBounds(): Promise<IBox> {
        return this._map.then((map: Microsoft.Maps.Map) => {
            const box = map.getBounds();
            return <IBox> {
                maxLatitude: box.getNorth(),
                maxLongitude: box.crossesInternationalDateLine() ? box.getWest() : box.getEast(),
                minLatitude: box.getSouth(),
                minLongitude: box.crossesInternationalDateLine() ?  box.getEast() : box.getWest(),
                center: { latitude: box.center.latitude, longitude: box.center.longitude },
                padding: 0
            };
        });
    }

    /**
     * Gets the current zoom level of the map.
     *
     * @returns {Promise<number>} - A promise that when fullfilled contains the zoom level.
     *
     * @memberof BingMapService
     */
    public GetZoom(): Promise<number> {
        return this._map.then((map: Microsoft.Maps.Map) => map.getZoom());
    }

    /**
     * Provides a conversion of geo coordinates to pixels on the map control.
     *
     * @param {ILatLong} loc - The geo coordinates to translate.
     * @returns {Promise<IPoint>} - Promise of an {@link IPoint} interface representing the pixels. This promise resolves to null
     * if the goe coordinates are not in the view port.
     *
     * @memberof BingMapService
     */
    public LocationToPoint(loc: ILatLong): Promise<IPoint> {
        return this._map.then((m: Microsoft.Maps.Map) => {
            const l: Microsoft.Maps.Location = BingConversions.TranslateLocation(loc);
            const p: Microsoft.Maps.Point = <Microsoft.Maps.Point>m.tryLocationToPixel(l, Microsoft.Maps.PixelReference.control);
            if (p != null) {
                return { x: p.x, y: p.y };
            }
            return null;
        })
    }

    /**
     * Provides a conversion of geo coordinates to pixels on the map control.
     *
     * @param {ILatLong} loc - The geo coordinates to translate.
     * @returns {Promise<Array<IPoint>>} - Promise of an {@link IPoint} interface array representing the pixels.
     *
     * @memberof BingMapService
     */
    public LocationsToPoints(locs: Array<ILatLong>): Promise<Array<IPoint>> {
        return this._map.then((m: Microsoft.Maps.Map) => {
            const l = locs.map(loc => BingConversions.TranslateLocation(loc));
            const p: Array<Microsoft.Maps.Point> = <Array<Microsoft.Maps.Point>>m.tryLocationToPixel(l,
                Microsoft.Maps.PixelReference.control);
            return p ? p : new Array<IPoint>();
        })
    }

    /**
     * Centers the map on a geo location.
     *
     * @param {ILatLong} latLng - GeoCoordinates around which to center the map. See {@link ILatLong}
     * @returns {Promise<void>} - Promise that is fullfilled when the center operations has been completed.
     *
     * @memberof BingMapService
     */
    public SetCenter(latLng: ILatLong): Promise<void> {
        return this._map.then((map: Microsoft.Maps.Map) => map.setView({
            center: BingConversions.TranslateLocation(latLng)
        }));
    }

    /**
     * Sets the generic map options.
     *
     * @param {IMapOptions} options - Options to set.
     *
     * @memberof BingMapService
     */
    public SetMapOptions(options: IMapOptions) {
        this._map.then((m: Microsoft.Maps.Map) => {
            const o: Microsoft.Maps.IMapOptions = BingConversions.TranslateOptions(options);
            m.setOptions(o);
        });
    }

    /**
     * Sets the view options of the map.
     *
     * @param {IMapOptions} options - Options to set.
     *
     * @memberof BingMapService
     */
    public SetViewOptions(options: IMapOptions) {
        this._map.then((m: Microsoft.Maps.Map) => {
            const o: Microsoft.Maps.IViewOptions = BingConversions.TranslateViewOptions(options);
            m.setView(o);
        });
    }

    /**
     * Sets the zoom level of the map.
     *
     * @param {number} zoom - Zoom level to set.
     * @returns {Promise<void>} - A Promise that is fullfilled once the zoom operation is complete.
     *
     * @memberof BingMapService
     */
    public SetZoom(zoom: number): Promise<void> {
        return this._map.then((map: Microsoft.Maps.Map) => map.setView({
            zoom: zoom
        }));
    }

    /**
     * Creates an event subscription
     *
     * @template E - Generic type of the underlying event.
     * @param {string} eventName - The name of the event (e.g. 'click')
     * @returns {Observable<E>} - An observable of tpye E that fires when the event occurs.
     *
     * @memberof BingMapService
     */
    public SubscribeToMapEvent<E>(eventName: string): Observable<E> {
        const eventNameTranslated = BingMapEventsLookup[eventName];
        return Observable.create((observer: Observer<E>) => {
            this._map.then((m: Microsoft.Maps.Map) => {
                Microsoft.Maps.Events.addHandler(m, eventNameTranslated, (e: any) => {
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
     * @memberof BingMapService
     */
    public TriggerMapEvent(eventName: string): Promise<void> {
        return this._map.then((m) => Microsoft.Maps.Events.invoke(m, eventName, null));
    }

}
