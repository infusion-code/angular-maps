import { ILatLong } from "../interfaces/ilatlong";
import { IMarkerOptions } from "../interfaces/Imarkeroptions";
import { IMarkerIconInfo } from "../interfaces/imarkericoninfo";
import { IPoint } from "../interfaces/ipoint";
import { ISize } from "../interfaces/isize";
import { MarkerTypeId } from "../models/markertypeid";

export abstract class Marker {

    public abstract get Location(): ILatLong;
    public abstract get NativePrimitve(): any;

    public abstract AddListener(eventType: string, fn: Function): void;
    public abstract DeleteMarker(): void;
    public abstract GetLabel(): string;
    public abstract SetAnchor(anchor: IPoint): void;
    public abstract SetDraggable(draggable: boolean): void;
    public abstract SetIcon(icon: string): void;
    public abstract SetLabel(label: string): void;
    public abstract SetPosition(latLng: ILatLong): void;
    public abstract SetTitle(title: string): void;
    public abstract SetOptions(options: IMarkerOptions): void;


    public static CreateMarker(iconInfo: IMarkerIconInfo): string {

        switch (iconInfo.markerType) {

            case MarkerTypeId.CanvasMarker:
                return Marker.CreateCanvasMarker(iconInfo);
            case MarkerTypeId.DynmaicCircleMarker:
                return Marker.CreateDynmaicCircleMarker(iconInfo);
            case MarkerTypeId.FontMarker:
                return Marker.CreateFontBasedMarker(iconInfo);
            case MarkerTypeId.RotatedImageMarker:
                return Marker.CreateRotatedImageMarker(iconInfo);
            case MarkerTypeId.RoundedImageMarker:
                return Marker.CreateRoundedImageMarker(iconInfo);
            case MarkerTypeId.ScaledImageMarker:
                return Marker.CreateScaledImageMarker(iconInfo);

        }
        throw Error("Unsupported marker type: " + iconInfo.markerType);
    }

    protected static CreateCanvasMarker(iconInfo: IMarkerIconInfo): string {
        if (document == null) throw Error("Document context (window.document) is required for canvas markers.");
        if (iconInfo == null || iconInfo.size == null || iconInfo.points == null) throw Error("IMarkerIconInfo.size, and IMarkerIConInfo.points are required for canvas markers.");

        let c: HTMLCanvasElement = document.createElement('canvas');
        let ctx: CanvasRenderingContext2D = c.getContext('2d');
        c.width = iconInfo.size.width;
        c.height = iconInfo.size.height;
        if (iconInfo.rotation) {
            //Offset the canvas such that we will rotate around the center of our arrow
            ctx.translate(c.width * 0.5, c.height * 0.5);
            //Rotate the canvas by the desired heading
            ctx.rotate(iconInfo.rotation * Math.PI / 180);
            //Return the canvas offset back to it's original position
            ctx.translate(-c.width * 0.5, -c.height * 0.5);
        }

        ctx.fillStyle = iconInfo.color || "red";

        //Draw a path in the shape of an arrow.
        ctx.beginPath();
        if (iconInfo.drawingOffset) ctx.moveTo(iconInfo.drawingOffset.x, iconInfo.drawingOffset.y);
        iconInfo.points.forEach((p: IPoint) => { ctx.lineTo(p.x, p.y) });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        return c.toDataURL();
    }

    protected static CreateDynmaicCircleMarker(iconInfo: IMarkerIconInfo): string {
        if (document == null) throw Error("Document context (window.document) is required for dynamic circle markers.");
        if (iconInfo == null || iconInfo.size == null) throw Error("IMarkerIconInfo.size is required for dynamic circle markers.");

        let strokeWidth: number = iconInfo.strokeWidth || 0;
        //Create an SVG string of a circle with the specified radius and color.
        let svg: Array<string> = [
            '<svg xmlns="http://www.w3.org/2000/svg" width="',
            iconInfo.size.width.toString(),
            '" height="',
            iconInfo.size.width.toString(),
            '"><circle cx="',
            (iconInfo.size.width/2).toString(),
            '" cy="',
            (iconInfo.size.width/2).toString(),
            '" r="',
            ((iconInfo.size.width/2) - strokeWidth).toString(),
            '" stroke="',
            iconInfo.color || "red",
            '" stroke-width="',
            strokeWidth.toString(),
            '" fill="',
            iconInfo.color || "red",
            '"/></svg>'
        ];
        return svg.join("");
    }

    protected static CreateFontBasedMarker(iconInfo: IMarkerIconInfo): string {
        if (document == null) throw Error("Document context (window.document) is required for font based markers");
        if (iconInfo == null || iconInfo.fontName == null || iconInfo.fontSize == null) throw Error("IMarkerIconInfo.fontName, IMarkerIconInfo.fontSize and IMarkerIConInfo.text are required for font based markers.");

        let c: HTMLCanvasElement = document.createElement('canvas');
        let ctx: CanvasRenderingContext2D = c.getContext('2d');
        let font: string = iconInfo.fontSize + 'px ' + iconInfo.fontName;
        ctx.font = font

        //Resize canvas based on sie of text.
        let size: TextMetrics = ctx.measureText(iconInfo.text);
        c.width = size.width;
        c.height = iconInfo.fontSize;

        if (iconInfo.rotation) {
            //Offset the canvas such that we will rotate around the center of our arrow
            ctx.translate(c.width * 0.5, c.height * 0.5);
            //Rotate the canvas by the desired heading
            ctx.rotate(iconInfo.rotation * Math.PI / 180);
            //Return the canvas offset back to it's original position
            ctx.translate(-c.width * 0.5, -c.height * 0.5);
        }

        //Reset font as it will be cleared by the resize.
        ctx.font = font;
        ctx.textBaseline = 'top';
        ctx.fillStyle = iconInfo.color || "red";

        ctx.fillText(iconInfo.text, 0, 0);
        iconInfo.size = { width: c.width, height: c.height };
        return c.toDataURL();
    }

    protected static CreateRotatedImageMarker(iconInfo: IMarkerIconInfo): string {
        if (document == null) throw Error("Document context (window.document) is required for rotated image markers");
        if (iconInfo == null || iconInfo.rotation == null || iconInfo.url == null || iconInfo.callback == null) throw Error("IMarkerIconInfo.rotation, IMarkerIconInfo.url and IMarkerIConInfo.callback are required for rotated image markers.");

        let image: HTMLImageElement = new Image();

        //Allow cross domain image editting.
        image.crossOrigin = 'anonymous';
        image.src = iconInfo.url;
        if (iconInfo.size) {
            image.width = iconInfo.size.width;
            image.height = iconInfo.size.height;
        }
        image.onload = function () {
            let c: HTMLCanvasElement = document.createElement('canvas');
            let ctx: CanvasRenderingContext2D = c.getContext('2d');
            let rads: number = iconInfo.rotation * Math.PI / 180;

            //Calculate rotated image size.
            c.width = Math.abs(Math.ceil(image.width * Math.cos(rads) + image.height * Math.sin(rads)));
            c.height = Math.abs(Math.ceil(image.width * Math.sin(rads) + image.height * Math.cos(rads)));

            //Move to the center of the canvas.
            ctx.translate(c.width / 2, c.height / 2);
            //Rotate the canvas to the specified angle in degrees.
            ctx.rotate(rads);
            //Draw the image, since the context is rotated, the image will be rotated also.
            ctx.drawImage(image, -image.width / 2, -image.height / 2);
            iconInfo.size = { width: c.width, height: c.height };
            iconInfo.callback(c.toDataURL(), iconInfo);
        };
        return "";
    }

    protected static CreateRoundedImageMarker(iconInfo: IMarkerIconInfo): string {
        if (document == null) throw Error("Document context (window.document) is required for rounded image markers");
        if (iconInfo == null || iconInfo.size == null || iconInfo.url == null || iconInfo.callback == null) throw Error("IMarkerIconInfo.size, IMarkerIconInfo.url and IMarkerIConInfo.callback are required for rounded image markers.");

        let radius: number = iconInfo.size.width/2;
        let image: HTMLImageElement = new Image();
        let offset: IPoint = iconInfo.drawingOffset || { x: 0, y: 0 };

        //Allow cross domain image editting.
        image.crossOrigin = 'anonymous';
        image.src = iconInfo.url;
        image.onload = function () {
            let c: HTMLCanvasElement = document.createElement('canvas');
            let ctx: CanvasRenderingContext2D = c.getContext('2d');
            c.width = iconInfo.size.width;
            c.height = iconInfo.size.width;

            //Draw a circle which can be used to clip the image, then draw the image.
            ctx.beginPath();
            ctx.arc(radius, radius, radius, 0, 2 * Math.PI, false);
            ctx.fill();
            ctx.clip();
            ctx.drawImage(image, offset.x, offset.y, iconInfo.size.width, iconInfo.size.width);
            iconInfo.size = { width: c.width, height: c.height };
            iconInfo.callback(c.toDataURL(), iconInfo);
        };
        return "";
    }

    protected static CreateScaledImageMarker(iconInfo: IMarkerIconInfo): string {
        if (document == null) throw Error("Document context (window.document) is required for scaled image markers");
        if (iconInfo == null || iconInfo.scale == null || iconInfo.url == null || iconInfo.callback == null) throw Error("IMarkerIconInfo.scale, IMarkerIconInfo.url and IMarkerIConInfo.callback are required for scaled image markers.");
        let image: HTMLImageElement = new Image();

        //Allow cross domain image editting.
        image.crossOrigin = 'anonymous';
        image.src = iconInfo.url;
        image.onload = function () {
            let c: HTMLCanvasElement = document.createElement('canvas');
            let ctx: CanvasRenderingContext2D = c.getContext('2d');
            c.width = image.width * iconInfo.scale;
            c.height = image.height * iconInfo.scale;

            //Draw a circle which can be used to clip the image, then draw the image.
            ctx.drawImage(image, 0, 0, c.width, c.height);
            iconInfo.size = { width: c.width, height: c.height };
            iconInfo.callback(c.toDataURL(), iconInfo);
        };
        return "";
    }

}