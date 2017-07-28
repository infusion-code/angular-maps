import { ILatLong } from '../interfaces/ilatlong';
import { IMarkerOptions } from '../interfaces/imarker-options';
import { IMarkerIconInfo } from '../interfaces/imarker-icon-info';
import { IPoint } from '../interfaces/ipoint';
import { ISize } from '../interfaces/isize';
import { MarkerTypeId } from '../models/marker-type-id';

/**
 * This interface defines the contract for an icon cache entry.
 *
 * @interface IMarkerIconCacheEntry
 */
interface IMarkerIconCacheEntry {
    /**
     * The icon string of the cache entry.
     *
     * @type {string}
     * @memberof IMarkerIconCacheEntry
     */
    markerIconString: string;

    /**
     * The Size of the icon.
     *
     * @type {ISize}
     * @memberof IMarkerIconCacheEntry
    * */
    markerSize: ISize;
}

/**
 * This class defines the contract for a marker.
 *
 * @export
 * @abstract
 * @class Marker
 */
export abstract class Marker {

    ///
    /// Field definitions
    ///

    /**
     * Used to cache generated markers for performance and reusability.
     *
     * @private
     * @static
     * @type {Map<string, IMarkerIconCacheEntry>}
     * @memberof Marker
     */
    private static MarkerCache: Map<string, IMarkerIconCacheEntry> = new Map<string, IMarkerIconCacheEntry>();

    /**
     * Creates a marker based on the marker info. In turn calls a number of internal members to
     * create the actual marker.
     *
     * @static
     * @param {IMarkerIconInfo} iconInfo - icon information. Depending on the marker type, various properties
     * need to be present. For performance, it is recommended to use an id for markers that are common to facilitate
     * reuse.
     * @param {(string, IMarkerIconInfo) => void} callback - a callback that is invoked on markers that require asyncronous
     * processing during creation. For markers that do not require async processing, this parameter is ignored.
     * @returns {string|Promise<{icon: string, iconInfo: IMarkerIconInfo}>} - a string or a promise for a string containing
     * a data url with the marker image.
     * @memberof Marker
     */
    public static CreateMarker(iconInfo: IMarkerIconInfo): string|Promise<{icon: string, iconInfo: IMarkerIconInfo}> {
        switch (iconInfo.markerType) {
            case MarkerTypeId.CanvasMarker: return Marker.CreateCanvasMarker(iconInfo);
            case MarkerTypeId.DynmaicCircleMarker: return Marker.CreateDynmaicCircleMarker(iconInfo);
            case MarkerTypeId.FontMarker: return Marker.CreateFontBasedMarker(iconInfo);
            case MarkerTypeId.RotatedImageMarker: return Marker.CreateRotatedImageMarker(iconInfo);
            case MarkerTypeId.RoundedImageMarker: return Marker.CreateRoundedImageMarker(iconInfo);
            case MarkerTypeId.ScaledImageMarker: return Marker.CreateScaledImageMarker(iconInfo);
            case MarkerTypeId.Custom: throw Error('Custom Marker Creators are not currently supported.');
        }
        throw Error('Unsupported marker type: ' + iconInfo.markerType);
    }

    /**
     * Creates a canvased based marker using the point collection contained in the iconInfo parameter.
     *
     * @protected
     * @static
     * @param {IMarkerIconInfo} iconInfo - {@link IMarkerIconInfo} containing the information necessary to create the icon.
     * @returns {string} - String with the data url for the marker image.
     *
     * @memberof Marker
     */
    protected static CreateCanvasMarker(iconInfo: IMarkerIconInfo): string {
        if (document == null) { throw Error('Document context (window.document) is required for canvas markers.'); }
        if (iconInfo == null || iconInfo.size == null || iconInfo.points == null) {
            throw Error('IMarkerIconInfo.size, and IMarkerIConInfo.points are required for canvas markers.');
        }
        if (iconInfo.id != null && Marker.MarkerCache.has(iconInfo.id)) {
            const mi: IMarkerIconCacheEntry = Marker.MarkerCache.get(iconInfo.id);
            iconInfo.size = mi.markerSize;
            return mi.markerIconString;
        }

        const c: HTMLCanvasElement = document.createElement('canvas');
        const ctx: CanvasRenderingContext2D = c.getContext('2d');
        c.width = iconInfo.size.width;
        c.height = iconInfo.size.height;
        if (iconInfo.rotation) {
            // Offset the canvas such that we will rotate around the center of our arrow
            ctx.translate(c.width * 0.5, c.height * 0.5);
            // Rotate the canvas by the desired heading
            ctx.rotate(iconInfo.rotation * Math.PI / 180);
            // Return the canvas offset back to it's original position
            ctx.translate(-c.width * 0.5, -c.height * 0.5);
        }

        ctx.fillStyle = iconInfo.color || 'red';

        // Draw a path in the shape of an arrow.
        ctx.beginPath();
        if (iconInfo.drawingOffset) { ctx.moveTo(iconInfo.drawingOffset.x, iconInfo.drawingOffset.y); }
        iconInfo.points.forEach((p: IPoint) => { ctx.lineTo(p.x, p.y) });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        const s: string = c.toDataURL();
        if (iconInfo.id != null) { Marker.MarkerCache.set(iconInfo.id, { markerIconString: s, markerSize: iconInfo.size }); }
        return s;
    }

    /**
     * Creates a circle marker image using information contained in the iconInfo parameter.
     *
     * @protected
     * @static
     * @param {IMarkerIconInfo} iconInfo - {@link IMarkerIconInfo} containing the information necessary to create the icon.
     * @returns {string} - String with the data url for the marker image.
     *
     * @memberof Marker
     */
    protected static CreateDynmaicCircleMarker(iconInfo: IMarkerIconInfo): string {
        if (document == null) { throw Error('Document context (window.document) is required for dynamic circle markers.'); }
        if (iconInfo == null || iconInfo.size == null) { throw Error('IMarkerIconInfo.size is required for dynamic circle markers.'); }
        if (iconInfo.id != null && Marker.MarkerCache.has(iconInfo.id)) {
            const mi: IMarkerIconCacheEntry = Marker.MarkerCache.get(iconInfo.id);
            iconInfo.size = mi.markerSize;
            return mi.markerIconString;
        }

        const strokeWidth: number = iconInfo.strokeWidth || 0;
        // Create an SVG string of a circle with the specified radius and color.
        const svg: Array<string> = [
            '<svg xmlns="http://www.w3.org/2000/svg" width="',
            iconInfo.size.width.toString(),
            '" height="',
            iconInfo.size.width.toString(),
            '"><circle cx="',
            (iconInfo.size.width / 2).toString(),
            '" cy="',
            (iconInfo.size.width / 2).toString(),
            '" r="',
            ((iconInfo.size.width / 2) - strokeWidth).toString(),
            '" stroke="',
            iconInfo.color || 'red',
            '" stroke-width="',
            strokeWidth.toString(),
            '" fill="',
            iconInfo.color || 'red',
            '"/></svg>'
        ];

        const s: string = svg.join('');
        if (iconInfo.id != null) { Marker.MarkerCache.set(iconInfo.id, { markerIconString: s, markerSize: iconInfo.size }); }
        return s;
    }

    /**
     * Creates a font based marker image (such as Font-Awesome), by using information supplied in the parameters (such as Font-Awesome).
     *
     * @protected
     * @static
     * @param {IMarkerIconInfo} iconInfo - {@link IMarkerIconInfo} containing the information necessary to create the icon.
     * @returns {string} - String with the data url for the marker image.
     *
     * @memberof Marker
     */
    protected static CreateFontBasedMarker(iconInfo: IMarkerIconInfo): string {
        if (document == null) { throw Error('Document context (window.document) is required for font based markers'); }
        if (iconInfo == null || iconInfo.fontName == null || iconInfo.fontSize == null) {
            throw Error('IMarkerIconInfo.fontName, IMarkerIconInfo.fontSize and IMarkerIConInfo.text are required for font based markers.');
        }
        if (iconInfo.id != null && Marker.MarkerCache.has(iconInfo.id)) {
            const mi: IMarkerIconCacheEntry = Marker.MarkerCache.get(iconInfo.id);
            iconInfo.size = mi.markerSize;
            return mi.markerIconString;
        }

        const c: HTMLCanvasElement = document.createElement('canvas');
        const ctx: CanvasRenderingContext2D = c.getContext('2d');
        const font: string = iconInfo.fontSize + 'px ' + iconInfo.fontName;
        ctx.font = font

        // Resize canvas based on sie of text.
        const size: TextMetrics = ctx.measureText(iconInfo.text);
        c.width = size.width;
        c.height = iconInfo.fontSize;

        if (iconInfo.rotation) {
            // Offset the canvas such that we will rotate around the center of our arrow
            ctx.translate(c.width * 0.5, c.height * 0.5);
            // Rotate the canvas by the desired heading
            ctx.rotate(iconInfo.rotation * Math.PI / 180);
            // Return the canvas offset back to it's original position
            ctx.translate(-c.width * 0.5, -c.height * 0.5);
        }

        // Reset font as it will be cleared by the resize.
        ctx.font = font;
        ctx.textBaseline = 'top';
        ctx.fillStyle = iconInfo.color || 'red';

        ctx.fillText(iconInfo.text, 0, 0);
        iconInfo.size = { width: c.width, height: c.height };
        const s: string = c.toDataURL();
        if (iconInfo.id != null) { Marker.MarkerCache.set(iconInfo.id, { markerIconString: s, markerSize: iconInfo.size }); }
        return s;
    }

    /**
     * Creates an image marker by applying a roation to a supplied image.
     *
     * @protected
     * @static
     * @param {IMarkerIconInfo} iconInfo - {@link IMarkerIconInfo} containing the information necessary to create the icon.
     * @returns {string|Promise<{icon: string, iconInfo: IMarkerIconInfo}} - a string or a promise for a string containing
     * a data url with the marker image. In case of a cached image, the image will be returned, otherwise the promise.
     *
     * @memberof Marker
     */
    protected static CreateRotatedImageMarker(iconInfo: IMarkerIconInfo): string|Promise<{icon: string, iconInfo: IMarkerIconInfo}> {
        if (document == null) { throw Error('Document context (window.document) is required for rotated image markers'); }
        if (iconInfo == null || iconInfo.rotation == null || iconInfo.url == null) {
            throw Error('IMarkerIconInfo.rotation, IMarkerIconInfo.url are required for rotated image markers.');
        }
        if (iconInfo.id != null && Marker.MarkerCache.has(iconInfo.id)) {
            const mi: IMarkerIconCacheEntry = Marker.MarkerCache.get(iconInfo.id);
            iconInfo.size = mi.markerSize;
            return mi.markerIconString;
        }

        const image: HTMLImageElement = new Image();
        const promise: Promise<{icon: string, iconInfo: IMarkerIconInfo}> =
            new Promise<{icon: string, iconInfo: IMarkerIconInfo}>((resolve, reject) => {
            // Allow cross domain image editting.
            image.crossOrigin = 'anonymous';
            image.src = iconInfo.url;
            if (iconInfo.size) {
                image.width = iconInfo.size.width;
                image.height = iconInfo.size.height;
            }
            image.onload = function () {
                const c: HTMLCanvasElement = document.createElement('canvas');
                const ctx: CanvasRenderingContext2D = c.getContext('2d');
                const rads: number = iconInfo.rotation * Math.PI / 180;

                // Calculate rotated image size.
                c.width = Math.abs(Math.ceil(image.width * Math.cos(rads) + image.height * Math.sin(rads)));
                c.height = Math.abs(Math.ceil(image.width * Math.sin(rads) + image.height * Math.cos(rads)));

                // Move to the center of the canvas.
                ctx.translate(c.width / 2, c.height / 2);
                // Rotate the canvas to the specified angle in degrees.
                ctx.rotate(rads);
                // Draw the image, since the context is rotated, the image will be rotated also.
                ctx.drawImage(image, -image.width / 2, -image.height / 2, image.width, image.height);
                iconInfo.size = { width: c.width, height: c.height };

                const s: string = c.toDataURL();
                if (iconInfo.id != null) { Marker.MarkerCache.set(iconInfo.id, { markerIconString: s, markerSize: iconInfo.size }); }
                resolve({icon: s, iconInfo: iconInfo});
            };
        });
        return promise;
    }

    /**
     * Creates a rounded image marker by applying a circle mask to a supplied image.
     *
     * @protected
     * @static
     * @param {IMarkerIconInfo} iconInfo - {@link IMarkerIconInfo} containing the information necessary to create the icon.
     * @param {(string, IMarkerIconInfo) => void} - Callback invoked once marker generation is complete. The callback
     * parameters are the data uri and the IMarkerIconInfo.
     * @returns {string|Promise<{icon: string, iconInfo: IMarkerIconInfo}>} - a string or a promise for a string containing
     * a data url with the marker image. In case of a cached image, the image will be returned, otherwise the promise.
     *
     * @memberof Marker
     */
    protected static CreateRoundedImageMarker(iconInfo: IMarkerIconInfo): string|Promise<{icon: string, iconInfo: IMarkerIconInfo}> {
        if (document == null) { throw Error('Document context (window.document) is required for rounded image markers'); }
        if (iconInfo == null || iconInfo.size == null || iconInfo.url == null) {
            throw Error('IMarkerIconInfo.size, IMarkerIconInfo.url are required for rounded image markers.');
        }
        if (iconInfo.id != null && Marker.MarkerCache.has(iconInfo.id)) {
            const mi: IMarkerIconCacheEntry = Marker.MarkerCache.get(iconInfo.id);
            iconInfo.size = mi.markerSize;
            return mi.markerIconString;
        }

        const promise: Promise<{icon: string, iconInfo: IMarkerIconInfo}> =
            new Promise<{icon: string, iconInfo: IMarkerIconInfo}>((resolve, reject) => {
            const radius: number = iconInfo.size.width / 2;
            const image: HTMLImageElement = new Image();
            const offset: IPoint = iconInfo.drawingOffset || { x: 0, y: 0 };

            // Allow cross domain image editting.
            image.crossOrigin = 'anonymous';
            image.src = iconInfo.url;
            image.onload = function () {
                const c: HTMLCanvasElement = document.createElement('canvas');
                const ctx: CanvasRenderingContext2D = c.getContext('2d');
                c.width = iconInfo.size.width;
                c.height = iconInfo.size.width;

                // Draw a circle which can be used to clip the image, then draw the image.
                ctx.beginPath();
                ctx.arc(radius, radius, radius, 0, 2 * Math.PI, false);
                ctx.fill();
                ctx.clip();
                ctx.drawImage(image, offset.x, offset.y, iconInfo.size.width, iconInfo.size.width);
                iconInfo.size = { width: c.width, height: c.height };

                const s: string = c.toDataURL();
                if (iconInfo.id != null) { Marker.MarkerCache.set(iconInfo.id, { markerIconString: s, markerSize: iconInfo.size }); }
                resolve({icon: s, iconInfo: iconInfo});
            };
        });
        return promise;
    }

    /**
     * Creates a scaled image marker by scaling a supplied image by a factor using a canvas.
     *
     * @protected
     * @static
     * @param {IMarkerIconInfo} iconInfo - {@link IMarkerIconInfo} containing the information necessary to create the icon.
     * @param {(string, IMarkerIconInfo) => void} - Callback invoked once marker generation is complete. The callback
     * parameters are the data uri and the IMarkerIconInfo.
     * @returns {string|Promise<{icon: string, iconInfo: IMarkerIconInfo}>} - a string or a promise for a string containing
     * a data url with the marker image. In case of a cached image, the image will be returned, otherwise the promise.
     *
     * @memberof Marker
     */
    protected static CreateScaledImageMarker(iconInfo: IMarkerIconInfo): string|Promise<{icon: string, iconInfo: IMarkerIconInfo}> {
        if (document == null) { throw Error('Document context (window.document) is required for scaled image markers'); }
        if (iconInfo == null || iconInfo.scale == null || iconInfo.url == null) {
            throw Error('IMarkerIconInfo.scale, IMarkerIconInfo.url are required for scaled image markers.');
        }
        if (iconInfo.id != null && Marker.MarkerCache.has(iconInfo.id)) {
            const mi: IMarkerIconCacheEntry = Marker.MarkerCache.get(iconInfo.id);
            iconInfo.size = mi.markerSize;
            return mi.markerIconString;
        }
        const promise: Promise<{icon: string, iconInfo: IMarkerIconInfo}> =
            new Promise<{icon: string, iconInfo: IMarkerIconInfo}>((resolve, reject) => {
            const image: HTMLImageElement = new Image();

            // Allow cross domain image editting.
            image.crossOrigin = 'anonymous';
            image.src = iconInfo.url;
            image.onload = function () {
                const c: HTMLCanvasElement = document.createElement('canvas');
                const ctx: CanvasRenderingContext2D = c.getContext('2d');
                c.width = image.width * iconInfo.scale;
                c.height = image.height * iconInfo.scale;

                // Draw a circle which can be used to clip the image, then draw the image.
                ctx.drawImage(image, 0, 0, c.width, c.height);
                iconInfo.size = { width: c.width, height: c.height };

                const s: string = c.toDataURL();
                if (iconInfo.id != null) { Marker.MarkerCache.set(iconInfo.id, { markerIconString: s, markerSize: iconInfo.size }); }
                resolve({icon: s, iconInfo: iconInfo});
            };
        });
        return promise;
    }

    ///
    /// Property definitions
    ///

    /**
     * Indicates that the marker is the first marker in a set.
     *
     * @abstract
     * @type {boolean}
     * @memberof Marker
     */
    public abstract get IsFirst(): boolean;
    public abstract set IsFirst(val: boolean);

    /**
     * Indicates that the marker is the last marker in the set.
     *
     * @abstract
     * @type {boolean}
     * @memberof Marker
     */
    public abstract get IsLast(): boolean;
    public abstract set IsLast(val: boolean);

    /**
     * Gets the Location of the marker
     *
     * @readonly
     * @abstract
     * @type {ILatLong}
     * @memberof Marker
     */
    public abstract get Location(): ILatLong;

    /**
     * Gets the marker metadata.
     *
     * @readonly
     * @abstract
     * @type {Map<string, any>}
     * @memberof Marker
     */
    public abstract get Metadata(): Map<string, any>;

    /**
     * Gets the native primitve implementing the marker (e.g. Microsoft.Maps.Pushpin)
     *
     * @readonly
     * @abstract
     * @type {*}
     * @memberof Marker
     */
    public abstract get NativePrimitve(): any;

    ///
    /// Public methods
    ///

    /**
     * Adds an event listener to the marker.
     *
     * @abstract
     * @param {string} eventType - String containing the event for which to register the listener (e.g. "click")
     * @param {Function} fn - Delegate invoked when the event occurs.
     *
     * @memberof Marker
     */
    public abstract AddListener(eventType: string, fn: Function): void;

    /**
     * Deletes the marker.
     *
     * @abstract
     *
     * @memberof Marker
     */
    public abstract DeleteMarker(): void;

    /**
     * Gets the marker label
     *
     * @abstract
     * @returns {string}
     *
     * @memberof Marker
     */
    public abstract GetLabel(): string;

    /**
     * Gets the marker visibility
     *
     * @abstract
     * @returns {boolean}
     *
     * @memberof Marker
     */
    public abstract GetVisible(): boolean;

    /**
     * Sets the anchor for the marker. Use this to adjust the root location for the marker to accomodate various marker image sizes.
     *
     * @abstract
     * @param {IPoint} anchor - Point coordinates for the marker anchor.
     *
     * @memberof Marker
     */
    public abstract SetAnchor(anchor: IPoint): void;

    /**
     * Sets the draggability of a marker.
     *
     * @abstract
     * @param {boolean} draggable - True to mark the marker as draggable, false otherwise.
     *
     * @memberof Marker
     */
    public abstract SetDraggable(draggable: boolean): void;

    /**
     * Sets the icon for the marker.
     *
     * @abstract
     * @param {string} icon - String containing the icon in various forms (url, data url, etc.)
     *
     * @memberof Marker
     */
    public abstract SetIcon(icon: string): void;

    /**
     * Sets the marker label.
     *
     * @abstract
     * @param {string} label - String containing the label to set.
     *
     * @memberof Marker
     */
    public abstract SetLabel(label: string): void;

    /**
     * Sets the marker position.
     *
     * @abstract
     * @param {ILatLong} latLng - Geo coordinates to set the marker position to.
     *
     * @memberof Marker
     */
    public abstract SetPosition(latLng: ILatLong): void;

    /**
     * Sets the marker title.
     *
     * @abstract
     * @param {string} title - String containing the title to set.
     *
     * @memberof Marker
     */
    public abstract SetTitle(title: string): void;

    /**
     * Sets the marker options.
     *
     * @abstract
     * @param {IMarkerOptions} options - {@link IMarkerOptions} object containing the marker options to set. The supplied options are
     * merged with the underlying marker options.
     * @memberof Marker
     */
    public abstract SetOptions(options: IMarkerOptions): void;

    /**
     * Sets the visiblilty of the marker.
     *
     * @abstract
     * @param {boolean} visible - Boolean which determines if the marker is visible or not.
     *
     * @memberof Marker
     */
    public abstract SetVisible(visible: boolean): void;

}
