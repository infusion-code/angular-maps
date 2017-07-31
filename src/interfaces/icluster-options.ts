import { IClusterIconInfo } from './icluster-icon-info';
import { IPoint } from './ipoint';
import { ILayerOptions } from './ilayer-options';
import { IMarkerIconInfo } from './imarker-icon-info';
import { ISpiderClusterOptions } from './ispider-cluster-options';
import { Marker } from '../models/marker';
import { ClusterPlacementMode } from '../models/cluster-placement-mode';

/**
 * This interfaces defined options governing clustering layers.
 *
 * @export
 * @interface IClusterOptions
 * @extends {ILayerOptions}
 */
export interface IClusterOptions extends ILayerOptions {

        /**
         * A callback function that is fired after the clustering for a map view has completed.
         * This is useful if you want to generate a list of locations based on what is in the current view.
         *
         * @type () => void
         * @memberof IClusterOptions
         */
        callback?: () => void;

        /**
         * Icon information for custom marker icons in the clusters
         *
         * @type {IMarkerIconInfo}
         * @memberof IClusterOptions
         */
        clusterIconInfo?: IMarkerIconInfo;

        /**
         * The url of the cluster image
         *
         * @type {string}
         * @memberof IClusterOptions
         */
        imagePath?: string;

        /**
         * The file extension of the cluster image
         *
         * @type {string}
         * @memberof IClusterOptions
         */
        imageExtension?: string;

        /**
         * A callback function that allows you to process a clustered pushpin before it is added to a layer.
         * This is useful if you want to add events or set style options on the clustered pushpin.
         */
        clusteredPinCallback?: (marker: any) => void;

        /**
         * Indicates if the layer should cluster the locations or not. Default: true
         *
         * @type {boolean}
         * @memberof IClusterOptions
         */
        clusteringEnabled?: boolean;

        /**
         * The width and height of the gird cells used for clustering in pixels. Default: 45
         *
         * @type {number}
         * @memberof IClusterOptions
         */
        gridSize?: number;

        /**
         * Offsets the placement of clustered pushpins by a set number of pixels.
         * This option is only available when the placement type is set to GridCenter.
         * This is useful if you have multiple cluster layers on the map and you want to
         * offset the clustered pushpins between the layers so that they are visible,
         * otherwise the clusters from the different layers would overlap completely.
         *
         * @type {IPoint}
         * @memberof IClusterOptions
         */
        layerOffset?: IPoint;

        /**
         * Maximum zoom level for the cluster
         *
         * @type {number}
         * @memberof IClusterOptions
         */
        maxZoom?: number;

        /**
         * The minimum number of pins required to form a cluster
         *
         * @type {number}
         * @memberof IClusterOptions
         */
        minimumClusterSize?: number;

        /**
         * Determines the cluster placement mode
         *
         * @type {ClusterPlacementMode}
         * @memberof IClusterOptions
         */
        placementMode?: ClusterPlacementMode;

        /**
         * Options governing the spider cluster behavior if active.
         *
         * @type {ISpiderClusterOptions}
         * @memberof IClusterOptions
         */
        spiderClusterOptions?: ISpiderClusterOptions;

        /**
         * Cluster image styles
         *
         * @type {Array<IClusterIconInfo>}
         * @memberof IClusterOptions
         */
        styles?: Array<IClusterIconInfo>;

        /**
         * A boolean indicating if the layer is visible or not.
         *
         * @type {boolean}
         * @memberof IClusterOptions
         */
        visible?: boolean;

        /**
         * The z-index of the layer.
         *
         * @type {number}
         * @memberof IClusterOptions
         */
        zIndex?: number;

        /**
         * Whether to zoom in on click.
         *
         * @type {number}
         * @memberof IClusterOptions
         */
        zoomOnClick?: boolean;

}
