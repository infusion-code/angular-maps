﻿﻿import { IClusterIconInfo } from '../../interfaces/icluster-icon-info';
import { IMarkerIconInfo } from '../../interfaces/imarker-icon-info';
import { MarkerService } from './../marker.service';
import { IClusterOptions } from './../../interfaces/icluster-options';
import { Injectable, NgZone } from '@angular/core';
import { IMarkerOptions } from './../../interfaces/imarker-options';
import { Marker } from './../../models/marker';
import { Layer } from './../../models/layer';
import { MarkerTypeId } from './../../models/marker-type-id';
import { ClusterLayerDirective } from './../../components/cluster-layer';
import { ClusterService } from './../cluster.service';
import { MapService } from './../map.service';
import { GoogleLayerBase } from './google-layer-base';
import { IPolygonOptions } from '../../interfaces/ipolygon-options';
import { IPolylineOptions } from '../../interfaces/ipolyline-options';
import { Polygon } from '../../models/polygon';
import { Polyline } from '../../models/polyline';
import * as GoogleMapTypes from './google-map-types';

@Injectable()
export class GoogleClusterService extends GoogleLayerBase implements ClusterService {

    ///
    /// Field declarations
    ///
    protected _layers: Map<ClusterLayerDirective, Promise<Layer>> = new Map<ClusterLayerDirective, Promise<Layer>>();
    protected _layerStyles: Map<number, Array<GoogleMapTypes.ClusterStyle>> = new Map<number, Array<GoogleMapTypes.ClusterStyle>>();

    ///
    /// Static methods
    ///

    /**
     * Creates the cluster icon from the styles
     *
     * @param {Array<IClusterIconInfo>} styles
     * @returns {Promise<Array<IClusterIconInfo>>} - Promise that when resolved contains an Array of IClusterIconInfo objects
     * containing the hydrated cluster icons.
     * @memberof GoogleClusterService
     */
    public static CreateClusterIcons(styles: Array<IClusterIconInfo>): Promise<Array<IClusterIconInfo>> {
        const i: Promise<Array<IClusterIconInfo>> = new Promise<Array<IClusterIconInfo>>((resolve, reject) => {
            const pa = new Array<Promise<{icon: string, iconInfo: IMarkerIconInfo}>>();
            styles.forEach((style, index) => {
                if (style.iconInfo) {
                    const s: string|Promise<{icon: string, iconInfo: IMarkerIconInfo}> = Marker.CreateMarker(style.iconInfo);
                    if (typeof(s) === 'string') {
                        style.url = s;
                        if (style.width == null) {
                            style.width = style.iconInfo.size.width;
                            style.height = style.iconInfo.size.height;
                        }
                        if (style.iconInfo.markerOffsetRatio && style.iconInfo.size && style.anchor == null) {
                            const o: IMarkerIconInfo = style.iconInfo
                            style.anchor = [
                                o.size.width * o.markerOffsetRatio.x,
                                o.size.height * o.markerOffsetRatio.y
                            ];
                        }
                        delete style.iconInfo;
                    }
                    else {
                        s.then(x => {
                            style.url = x.icon;
                            if (style.width == null) {
                                style.width = x.iconInfo.size.width;
                                style.height = x.iconInfo.size.height;
                            }
                            if (x.iconInfo.markerOffsetRatio && x.iconInfo.size && style.anchor == null) {
                                const o: IMarkerIconInfo = x.iconInfo
                                style.anchor = [
                                    o.size.width * o.markerOffsetRatio.x,
                                    o.size.height * o.markerOffsetRatio.y
                                ];
                            }
                            delete style.iconInfo;
                        });
                        pa.push(s);
                    }
                }
            });
            if (pa.length === 0) { resolve(styles); }
            else {
                Promise.all(pa).then(() => {
                    resolve(styles);
                });
            };
        });
        return i;
    }

    ///
    /// Constructors
    ///

    /**
     * Creates an instance of GoogleClusterService.
     * @param {MapService} _mapService
     * @param {NgZone} _zone
     * @memberof GoogleClusterService
     */
    constructor(_mapService: MapService, private _zone: NgZone) {
        super(_mapService);
    }

    /**
     * Adds the cluster layer to the map
     *
     * @param {ClusterLayerDirective} layer
     * @memberof GoogleClusterService
     */
    public AddLayer(layer: ClusterLayerDirective): void {
        const options: IClusterOptions = {
            id: layer.Id,
            zoomOnClick: layer.ZoomOnClick
        };
        if (layer.GridSize) { options.gridSize = layer.GridSize; }
        if (layer.MinimumClusterSize) { options.minimumClusterSize = layer.MinimumClusterSize; }
        if (layer.Styles) { options.styles = layer.Styles; }
        if (layer.UseDynamicSizeMarkers) {
            options.styles = null
            // do not to attempt to setup styles here as the dynamic call back will generate them.
        }
        else {
            options.styles = [{
                height: 30,
                width: 35,
                textColor: 'white',
                textSize: 11,
                backgroundPosition: 'center',
                iconInfo: {
                    markerType: MarkerTypeId.FontMarker,
                    fontName: 'FontAwesome',
                    fontSize: 30,
                    color: 'green',
                    text: '\uF111'
                }
            }];
        }
        const dynamicClusterCallback = (markers: Array<GoogleMapTypes.Marker>, numStyles: number,
            clusterer: GoogleMapTypes.MarkerClusterer) => {
            // dynamically ensure that the necessary style for this cluster icon exists and
            // the clusterer is already hooked up to the styles array via pointer, so we only
            // need to update the style. Since the clusterer re-renders a cluster icon is the
            // the marker count changes, we will only need to retain the current icon as opposed
            // to all cluster icon.
            const styles: Array<GoogleMapTypes.ClusterStyle> = this._layerStyles.get(layer.Id);
            const iconInfo: IMarkerIconInfo = {
                markerType: MarkerTypeId.None
            }
            const icon: string = layer.CustomMarkerCallback(<any>markers, iconInfo);
            styles[0] = {
                url: `\"data:image/svg+xml;utf8,${icon}\"`,
                height: iconInfo.size.height,
                width: iconInfo.size.width,
                textColor: 'white',
                textSize: 11,
                backgroundPosition: 'center',
            };
            return {
                text: markers.length.toString(),
                index: 1
            }
        };
        const resetStyles = (clusterer: GoogleMapTypes.MarkerClusterer) => {
            if (this._layerStyles.has(layer.Id)) { this._layerStyles.get(layer.Id).splice(0); }
            else {
                const styles: Array<GoogleMapTypes.ClusterStyle> = new Array<GoogleMapTypes.ClusterStyle>();
                styles.push({});
                this._layerStyles.set(layer.Id, styles);
                clusterer.setStyles(styles);
                    // this is important for dynamic styles as the pointer to this array gets passed
                    // around key objects in the clusterer. Therefore, it must be initialized here in order for
                    // updates to the styles to be visible.
                    // also, we need to add at least one style to prevent the default styles from being picked up.
            }
        };

        const layerPromise = this._mapService.CreateClusterLayer(options);
        this._layers.set(layer, layerPromise);
        layerPromise.then(l => {
            const clusterer: GoogleMapTypes.MarkerClusterer = <GoogleMapTypes.MarkerClusterer>l.NativePrimitve;
            if (options.styles) {
                const s  = GoogleClusterService.CreateClusterIcons(options.styles);
                s.then(x => {
                    clusterer.setStyles(<Array<GoogleMapTypes.ClusterStyle>>x);
                });
            }
            else {
                resetStyles(clusterer);
                this._mapService.MapPromise.then((m: GoogleMapTypes.GoogleMap) => {
                    m.addListener('zoom_changed', () => {
                        resetStyles(clusterer);
                    });
                });
                clusterer.setCalculator((m, n) => {
                    return dynamicClusterCallback(m, n, clusterer);
                });
            }
        });
    };

    /**
     * Returns the native layer
     *
     * @param {ClusterLayerDirective} layer
     * @returns {Promise<Layer>}
     * @memberof GoogleClusterService
     */
    public GetNativeLayer(layer: ClusterLayerDirective): Promise<Layer> {
        return this._layers.get(layer);
    };

    /**
     * Delets the native layer
     *
     * @param {ClusterLayerDirective} layer
     * @returns {Promise<void>}
     * @memberof GoogleClusterService
     */
    public DeleteLayer(layer: ClusterLayerDirective): Promise<void> {
        this._layers.delete(layer);
        return Promise.resolve();
    };

    /**
     * Create a marker in the cluster
     *
     * @param {number} layer
     * @param {IMarkerOptions} options
     * @returns {Promise<Marker>}
     * @memberof GoogleClusterService
     */
    public CreateMarker(layer: number, options: IMarkerOptions): Promise<Marker> {
        const p: Promise<Layer> = this.GetLayerById(layer);
        if (p == null) { throw (new Error(`Layer with id ${layer} not found in Layer Map`)); }

        return p.then((l: Layer) => {
            return this._mapService.CreateMarker(options)
                .then((marker: Marker) => {
                    marker.IsFirst = options.isFirst;
                    marker.IsLast = options.isLast;
                    l.AddEntity(marker);
                    return marker;
                });
        });
    };

    /**
     * Starts the clustering
     *
     * @param {ClusterLayerDirective} layer
     * @returns {Promise<void>}
     * @memberof GoogleClusterService
     */
    public StartClustering(layer: ClusterLayerDirective): Promise<void> {
        return Promise.resolve();
    }

    /**
     * Stops the clustering
     *
     * @param {ClusterLayerDirective} layer
     * @returns {Promise<void>}
     * @memberof GoogleClusterService
     */
    public StopClustering(layer: ClusterLayerDirective): Promise<void> {
        return Promise.resolve();
    }

    /**
     * Adds a polygon to the layer.
     *
     * @abstract
     * @param {number} layer - The id of the layer to which to add the polygon.
     * @param {IPolygonOptions} options - Polygon options defining the polygon.
     * @returns {Promise<Polygon>} - A promise that when fullfilled contains the an instance of the Polygon model.
     *
     * @memberof GoogleClusterService
     */
    public CreatePolygon(layer: number, options: IPolygonOptions): Promise<Polygon> {
        throw (new Error('Polygons are not supported in clustering layers. You can only use markers.'));
    }

    /**
     * Adds a polyline to the layer.
     *
     * @abstract
     * @param {number} layer - The id of the layer to which to add the line.
     * @param {IPolylineOptions} options - Polyline options defining the line.
     * @returns {Promise<Polyline|Array<Polyline>} - A promise that when fullfilled contains the an instance of the Polyline (or an
     * array of polygons for complex paths) model.
     *
     * @memberof GoogleClusterService
     */
    public CreatePolyline(layer: number, options: IPolylineOptions): Promise<Polyline|Array<Polyline>> {
        throw (new Error('Polylines are not supported in clustering layers. You can only use markers.'));
    }
}
