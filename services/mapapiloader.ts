import { Injectable } from "@angular/core";


///
/// Abstract implementation. USed for defintion only and as a base to implement your 
/// own provider.
///
@Injectable()
export abstract class MapAPILoader {

    abstract Load(): Promise<void>;

}

///
/// Window Reference service to assist with abstracting the availability of window. Needed for AOT and 
/// Server Side rendering
///
@Injectable()
export class WindowRef {
    public get IsAvailable(): boolean {
        return !(typeof (window) == "undefined");
    }

    public GetNativeWindow(): any {
        if (typeof (window) == "undefined") return null;
        return window;
    }
}


///
/// Document Reference service to assist with abstracting the availability of document. Needed for AOT and 
/// Server Side rendering
///
@Injectable()
export class DocumentRef {
    public get IsAvailable(): boolean {
        return !(typeof (document) == "undefined");
    }

    public GetNativeDocument(): any {
        if (typeof (document) == "undefined") return null;
        return document;
    }
}