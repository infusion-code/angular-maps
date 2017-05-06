import { Injectable, Optional } from "@angular/core";
import { MapAPILoader, WindowRef, DocumentRef } from "./mapapiloader";

export enum ScriptProtocol {
    HTTP,
    HTTPS,
    AUTO
}

@Injectable()
export class BingMapAPILoaderConfig  {

    ///
    /// API key for bing maps
    /// 
    apiKey: string = "";

    ///
    /// Host and Path used for the `<script>` tag.
    ///
    hostAndPath: string = "www.bing.com/api/maps/mapcontrol";

    ///
    /// Protocol used for the `<script>` tag.
    ///
    protocol: ScriptProtocol = ScriptProtocol.HTTPS;

    ///
    /// The branch to be used. Leave empty for production. Use experimental
    ///
    branch: string = "";
}

const DEFAULT_CONFIGURATION = new BingMapAPILoaderConfig();

@Injectable()
export class BingMapAPILoader extends MapAPILoader {

    private _scriptLoadingPromise: Promise<void>;

    public get Config(): BingMapAPILoaderConfig { return this._config; }

    constructor( @Optional() private _config: BingMapAPILoaderConfig, private _windowRef: WindowRef, private _documentRef: DocumentRef) {
        super();
        if (this._config === null || this._config === undefined) {
            this._config = DEFAULT_CONFIGURATION;
        }
    }

    public Load(): Promise<void> {
        if (this._scriptLoadingPromise) {
            return this._scriptLoadingPromise;
        }

        const script = this._documentRef.GetNativeDocument().createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.defer = true;
        const callbackName: string = `angular2bingmaps${new Date().getMilliseconds()}`;
        script.src = this.GetScriptSrc(callbackName);

        this._scriptLoadingPromise = new Promise<void>((resolve: Function, reject: Function) => {
            (<any>this._windowRef.GetNativeWindow())[callbackName] = () => {
                resolve();
            };
            script.onerror = (error: Event) => { reject(error); };
        });
        this._documentRef.GetNativeDocument().head.appendChild(script);
        return this._scriptLoadingPromise;
    }

    private GetScriptSrc(callbackName: string): string {
        let protocolType: ScriptProtocol = (this._config && this._config.protocol) || DEFAULT_CONFIGURATION.protocol;
        let protocol: string;

        switch (protocolType) {
            case ScriptProtocol.AUTO:
                protocol = '';
                break;
            case ScriptProtocol.HTTP:
                protocol = 'http:';
                break;
            case ScriptProtocol.HTTPS:
                protocol = 'https:';
                break;
        }

        const hostAndPath: string = this._config.hostAndPath || DEFAULT_CONFIGURATION.hostAndPath;
        const queryParams: { [key: string]: string } = {
            callback: callbackName
        };
        if (this._config.branch != "") queryParams["branch"] = this._config.branch;
        const params: string = Object.keys(queryParams)
            .map((k: string, i: number) => {
                let param = (i === 0) ? '?' : '&';
                return param += `${k}=${queryParams[k]}`;
            })
            .join('');
        return `${protocol}//${hostAndPath}${params}`;
    }
}