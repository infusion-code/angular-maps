import { ILineOptions } from './iline-options';
import { Marker } from '../models/marker';

export interface ISpiderClusterOptions {
    /**
     * Minimium number of pushpins in cluster before switching from circle to spiral spider layout.
     * @type {number}
     * @memberof ISpiderClusterOptions
     */
    circleSpiralSwitchover?: number;

    /**
     * When true (default), any view or map change will collapse an expanded cluster. When false, clusters collapse only
     * on click on the cluster or opening another cluster.
     *
     * @type {boolean}
     * @memberof ISpiderClusterOptions
     */
    collapseClusterOnMapChange?: boolean;

    /**
     * When 1 or less (default) exploded spider clusters are collapsed on the first click outside the cluster.
     * Otherwise, the number of clicks necessary is controlled by this property. This is useful when dealing
     * with info boxes or other interactive map behavior where you might want to hid the info box on the first
     * click and the cluster on the second.
     *
     * @type {number}
     * @memberof ISpiderClusterOptions
     */
    collapseClusterOnNthClick?: number;

    /**
     * When true, invokes the click hander (if it exists) on the underlying markers on hover when
     * exploded into a spider. This is useful for info boxes, as infoboxes might cover up some
     * markers clicking outside the marker will collapse the spider.
     *
     * @type {boolean}
     * @memberof ISpiderClusterOptions
     */
    invokeClickOnHover?: boolean;

    /**
     * A callback function that is fired when an individual pin is clicked.
     * If the pin is part of a cluster, the cluster will also be returned in the callback.
     *
     * @param marker Marker. The marker that was selected.
     * @param clusterMarker Marker. The cluster marker that was exploded into a spider.
     * @memberof ISpiderClusterOptions
     */
    markerSelected?: (marker: Marker, clusterMarker: Marker) => void;

    /**
     * A callback that is fired when a pin is unselected or a spider cluster is collapsed.
     *
     * @memberof ISpiderClusterOptions
     */
    markerUnSelected?: () => void;

    /**
     * The minium pixel distance between pushpins and the cluster, when rendering spider layout as a circle.
     *
     * @type {number}
     * @memberof ISpiderClusterOptions
     */
    minCircleLength?: number;

    /**
     * The minium angle between pushpins in the spiral.
     *
     * @type {number}
     * @memberof ISpiderClusterOptions
     */
    minSpiralAngleSeperation?: number;

    /**
     * A factor that is used to grow the pixel distance of each pushpin from the center in the spiral.
     *
     * @type {number}
     * @memberof ISpiderClusterOptions
     */
    spiralDistanceFactor?: number;

    /**
     * Style of the stick connecting the pins to cluster.
     *
     * @type {ILineOptions}
     * @memberof ISpiderClusterOptions
     */
    stickStyle?: ILineOptions;

    /**
     * Style of the sticks when a pin is hovered.
     *
     * @type {ILineOptions}
     * @memberof ISpiderClusterOptions
     */
    stickHoverStyle?: ILineOptions;

    /**
     * A boolean indicating if the cluster layer is visible or not.
     *
     * @type {boolean}
     * @memberof ISpiderClusterOptions
     */
    visible?: boolean;
}
