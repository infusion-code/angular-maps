﻿import { IClusterIconInfo } from '../../interfaces/icluster-icon-info';
import { IMarkerIconInfo } from '../../interfaces/imarker-icon-info';
import { MarkerService } from '../marker.service';
import { IClusterOptions } from '../../interfaces/icluster-options';
import { Injectable, NgZone } from '@angular/core';
import { IMarkerOptions } from '../../interfaces/imarker-options';
import { Marker } from '../../models/marker';
import { Layer } from '../../models/layer';
import { MarkerTypeId } from '../../models/marker-type-id';
import { ClusterClickAction } from '../../models/cluster-click-action';
import { ClusterLayerDirective } from '../../components/cluster-layer';
import { ClusterService } from '../cluster.service';
import { MapService } from '../map.service';
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
    protected _layers: Map<number, Promise<Layer>> = new Map<number, Promise<Layer>>();
    protected _layerStyles: Map<number, Array<GoogleMapTypes.ClusterStyle>> = new Map<number, Array<GoogleMapTypes.ClusterStyle>>();

    ///
    /// Static methods
    ///

    /**
     * Creates the cluster icon from the styles
     *
     * @param styles
     * @returns - Promise that when resolved contains an Array of IClusterIconInfo objects
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
                            const o: IMarkerIconInfo = style.iconInfo;
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
                                const o: IMarkerIconInfo = x.iconInfo;
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
            }
        });
        return i;
    }

    ///
    /// Constructors
    ///

    /**
     * Creates an instance of GoogleClusterService.
     * @param _mapService
     * @param _zone
     * @memberof GoogleClusterService
     */
    constructor(_mapService: MapService, _zone: NgZone) {
        super(_mapService, _zone);
    }

    /**
     * Adds the cluster layer to the map
     *
     * @param layer
     * @memberof GoogleClusterService
     */
    public AddLayer(layer: ClusterLayerDirective): void {
        const options: IClusterOptions = {
            id: layer.Id,
            visible: layer.Visible,
            clusteringEnabled: layer.ClusteringEnabled,
            zoomOnClick: layer.ClusterClickAction === ClusterClickAction.ZoomIntoCluster
        };
        if (layer.GridSize) { options.gridSize = layer.GridSize; }
        if (layer.MinimumClusterSize) { options.minimumClusterSize = layer.MinimumClusterSize; }
        if (layer.Styles) { options.styles = layer.Styles; }
        if (layer.UseDynamicSizeMarkers) {
            options.styles = null;
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
            };
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
            };
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
        this._layers.set(layer.Id, layerPromise);
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
    }

    /**
     * Create a marker in the cluster
     *
     * @param layer
     * @param options
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
    }

    /**
     * Starts the clustering
     *
     * @param layer
     * @memberof GoogleClusterService
     */
    public StartClustering(layer: ClusterLayerDirective): Promise<void> {
        return Promise.resolve();
    }

    /**
     * Stops the clustering
     *
     * @param layer
     * @memberof GoogleClusterService
     */
    public StopClustering(layer: ClusterLayerDirective): Promise<void> {
        return Promise.resolve();
    }

    /**
     * Adds a polygon to the layer.
     *
     * @abstract
     * @param layer - The id of the layer to which to add the polygon.
     * @param options - Polygon options defining the polygon.
     * @returns - A promise that when fullfilled contains the an instance of the Polygon model.
     *
     * @memberof GoogleClusterService
     */
    public CreatePolygon(layer: number, options: IPolygonOptions): Promise<Polygon> {
        throw (new Error('Polygons are not supported in clustering layers. You can only use markers.'));
    }

    /**
     * Creates an array of unbound polygons. Use this method to create arrays of polygons to be used in bulk
     * operations.
     *
     * @param layer - The id of the layer to which to add the polygon.
     * @param options - Polygon options defining the polygons.
     * @returns - A promise that when fullfilled contains the an arrays of the Polygon models.
     *
     * @memberof GoogleClusterService
     */
    public CreatePolygons(layer: number, options: Array<IPolygonOptions>): Promise<Array<Polygon>> {
        throw (new Error('Polygons are not supported in clustering layers. You can only use markers.'));
    }

    /**
     * Adds a polyline to the layer.
     *
     * @abstract
     * @param layer - The id of the layer to which to add the line.
     * @param options - Polyline options defining the line.
     * @returns - A promise that when fullfilled contains the an instance of the Polyline (or an
     * array of polygons for complex paths) model.
     *
     * @memberof GoogleClusterService
     */
    public CreatePolyline(layer: number, options: IPolylineOptions): Promise<Polyline|Array<Polyline>> {
        throw (new Error('Polylines are not supported in clustering layers. You can only use markers.'));
    }

    /**
     * Creates an array of unbound polylines. Use this method to create arrays of polylines to be used in bulk
     * operations.
     *
     * @param layer - The id of the layer to which to add the polylines.
     * @param options - Polyline options defining the polylines.
     * @returns - A promise that when fullfilled contains the an arrays of the Polyline models.
     *
     * @memberof GoogleClusterService
     */
    public CreatePolylines(layer: number, options: Array<IPolylineOptions>): Promise<Array<Polyline|Array<Polyline>>> {
        throw (new Error('Polylines are not supported in clustering layers. You can only use markers.'));
    }
}
