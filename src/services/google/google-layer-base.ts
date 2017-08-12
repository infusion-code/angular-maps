import { IMarkerOptions } from './../../interfaces/imarker-options';
import { IMarkerIconInfo } from './../../interfaces/imarker-icon-info';
import { Marker } from './../../models/marker';
import { Layer } from './../../models/layer';
import { MarkerTypeId } from './../../models/marker-type-id';
import { MapService } from './../map.service';
import { MapLayerDirective } from './../../components/map-layer';
import { LayerService } from './../layer.service';
import { GoogleMapService } from './google-map.service';
import { GoogleConversions } from './google-conversions';
import { GoogleMarker } from './../../models/google/google-marker';
import * as GoogleMapTypes from './google-map-types';

declare var google: any;

/**
 * This abstract partially implements the contract for the {@link LayerService}
 * and {@link ClusterService} for the Google Maps archtiecture. It serves
 * as the base class for basic layer ({@link GoogleLayerService}) and cluster layer ({@link GoogleClusterLayer}).
 *
 * @export
 * @abstract
 * @class GoogleLayerBase
 */
export abstract class GoogleLayerBase {

    ///
    /// Field declarations
    ///
    protected abstract _layers: Map<number, Promise<Layer>>;

    ///
    /// Constructor
    ///

    /**
     * Creates an instance of GoogleLayerBase.
     * @param {MapService} _mapService - Concrete {@link MapService} implementation for Google Maps.
     * An instance of {@link GoogleMapService}.
     *
     * @memberof GoogleLayerBase
     */
    constructor(protected _mapService: MapService) { }

    ///
    /// Public methods
    ///

    /**
     * Adds a layer to the map.
     *
     * @abstract
     * @param {MapLayerDirective} layer - MapLayerDirective component object.
     * Generally, MapLayerDirective will be injected with an instance of the
     * LayerService and then self register on initialization.
     *
     * @memberof GoogleLayerBase
     */
    public abstract AddLayer(layer: MapLayerDirective): void;

    /**
     * Returns the Layer model represented by this layer.
     *
     * @abstract
     * @param {MapLayerDirective} layer - MapLayerDirective component object for which to retrieve the layer model.
     * @returns {Promise<Layer>} - A promise that when resolved contains the Layer model.
     *
     * @memberof GoogleLayerBase
     */
    public abstract GetNativeLayer(layer: MapLayerDirective): Promise<Layer>;

    /**
     * Deletes the layer
     *
     * @abstract
     * @param {MapLayerDirective} layer - MapLayerDirective component object for which to retrieve the layer.
     * @returns {Promise<void>} - A promise that is fullfilled when the layer has been removed.
     *
     * @memberof GoogleLayerBase
     */
    public abstract DeleteLayer(layer: MapLayerDirective): Promise<void>;

    /**
     * Creates a marker in the layer.
     *
     * @param {number} layer - The Id of the layer in which to create the marker.
     * @param {IMarkerOptions} options - {@link IMarkerOptions} object containing the marker properties.
     * @returns {Promise<Marker>} - A promise that when fullfilled contains the {@link Marker} model for the created marker.
     *
     * @memberof GoogleLayerBase
     */
    public CreateMarker(layer: number, options: IMarkerOptions): Promise<Marker> {
        const mp: Promise<GoogleMapTypes.GoogleMap> = this._mapService.MapPromise;
        const lp: Promise<Layer> = this._layers.get(layer);

        return Promise.all([mp, lp]).then(([map, l]) => {
            const payload = (x: GoogleMapTypes.MarkerOptions): GoogleMarker => {
                const marker = new google.maps.Marker(x);
                if (options.metadata) { options.metadata.forEach((val: any, key: string) => marker.Metadata.set(key, val)); }
                marker.setMap(map);
                const m = new GoogleMarker(marker);
                m.IsFirst = options.isFirst;
                m.IsLast = options.isLast;
                if (options.metadata) { options.metadata.forEach((val: any, key: string) => m.Metadata.set(key, val)); }
                l.AddEntity(m);
                return m;
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
    };

    /**
     * Creates an array of unbound markers. Use this method to create arrays of markers to be used in bulk
     * operations.
     *
     * @param {Array<IMarkerOptions>} options - Marker options defining the markers.
     * @param {IMarkerIconInfo} markerIcon - Optional information to generate custom markers. This will be applied to all markers.
     * @returns {Promise<Array<Marker>>} - A promise that when fullfilled contains the an arrays of the Marker models.
     *
     * @memberof GoogleLayerBase
     */
    public CreateMarkers(options: Array<IMarkerOptions>, markerIcon?: IMarkerIconInfo): Promise<Array<Marker>> {
        const payload = (icon: string): Array<GoogleMarker> => {
            const t0 = performance.now();
            const markers: Array<GoogleMarker> = options.map(mo => {
                const o: GoogleMapTypes.MarkerOptions = GoogleConversions.TranslateMarkerOptions(mo);
                if (icon && icon !== '') { o.icon = icon; }
                const pushpin = new google.maps.Marker(o);
                const marker: GoogleMarker = new GoogleMarker(pushpin);
                marker.IsFirst = mo.isFirst;
                marker.IsLast = mo.isLast;
                if (mo.metadata) { mo.metadata.forEach((val: any, key: string) => marker.Metadata.set(key, val)); }
                return marker;
            });
            const t1 = performance.now();
            console.log(`${t1 - t0}`);
            return markers;
        };
        const p: Promise<Array<Marker>> = new Promise<Array<Marker>>((resolve, reject) => {
            if (markerIcon && markerIcon.markerType) {
                const s = Marker.CreateMarker(markerIcon);
                if (typeof(s) === 'string') { resolve(payload(s)); }
                else {
                    return s.then(x => {
                        resolve(payload(x.icon));
                    });
                }
            }
            else {
                resolve (payload(null));
            }
        });
        return p;
    }

    ///
    /// Protected methods
    ///

    /**
     * Gets the layer based on its id.
     *
     * @protected
     * @param {number} id - Layer Id.
     * @returns {Promise<Layer>}  - A promise that when fullfilled contains the {@link Layer} model for the layer.
     *
     * @memberof GoogleLayerBase
     */
    protected GetLayerById(id: number): Promise<Layer> {
        let p: Promise<Layer>;
        this._layers.forEach((l: Promise<Layer>, k: number) => { if (k === id) { p = l; } });
        return p;
    }

}
