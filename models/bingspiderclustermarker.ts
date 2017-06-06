import { BingMarker } from './bingmarker';
import { SpiderClusterMarker } from './spiderclustermarker';

export class BingSpiderClusterMarker extends BingMarker implements SpiderClusterMarker {

    /** The parent pushpin in which the spider pushpin is derived from. */
    public ParentMarker: BingMarker;

    /** The stick that connects the spider pushpin to the cluster. */
    public Stick: Microsoft.Maps.Polyline;

}
