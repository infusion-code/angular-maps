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
 */
export interface IClusterOptions extends ILayerOptions {

        /**
         * A callback function that is fired after the clustering for a map view has completed.
         * This is useful if you want to generate a list of locations based on what is in the current view.
         *
         * @memberof IClusterOptions
         */
        callback?: () => void;

        /**
         * Icon information for custom marker icons in the clusters
         *
         * @memberof IClusterOptions
         */
        clusterIconInfo?: IMarkerIconInfo;

        /**
         * The url of the cluster image
         *
         * @memberof IClusterOptions
         */
        imagePath?: string;

        /**
         * The file extension of the cluster image
         *
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
         * @memberof IClusterOptions
         */
        clusteringEnabled?: boolean;

        /**
         * The width and height of the gird cells used for clustering in pixels. Default: 45
         *
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
         * @memberof IClusterOptions
         */
        layerOffset?: IPoint;

        /**
         * Maximum zoom level for the cluster
         *
         * @memberof IClusterOptions
         */
        maxZoom?: number;

        /**
         * The minimum number of pins required to form a cluster
         *
         * @memberof IClusterOptions
         */
        minimumClusterSize?: number;

        /**
         * Determines the cluster placement mode
         *
         * @memberof IClusterOptions
         */
        placementMode?: ClusterPlacementMode;

        /**
         * Options governing the spider cluster behavior if active.
         *
         * @memberof IClusterOptions
         */
        spiderClusterOptions?: ISpiderClusterOptions;

        /**
         * Cluster image styles
         *
         * @memberof IClusterOptions
         */
        styles?: Array<IClusterIconInfo>;

        /**
         * A boolean indicating if the layer is visible or not.
         *
         * @memberof IClusterOptions
         */
        visible?: boolean;

        /**
         * The z-index of the layer.
         *
         * @memberof IClusterOptions
         */
        zIndex?: number;

        /**
         * Whether to zoom in on click.
         *
         * @memberof IClusterOptions
         */
        zoomOnClick?: boolean;

}
