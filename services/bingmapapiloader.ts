import { Injectable, Optional } from "@angular/core";
import { MapAPILoader, WindowRef, DocumentRef } from "./mapapiloader";

/**
 * Protocol enumeration
 * 
 * @export
 * @enum {number}
 */
export enum ScriptProtocol {
    HTTP,
    HTTPS,
    AUTO
}

/**
 * Bing Maps V8 specific loader configuration to be used with the {@link BingMapAPILoader} 
 * 
 * @export
 * @class BingMapAPILoaderConfig
 */
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

/**
 * Default loader configuration.
 */
const DEFAULT_CONFIGURATION = new BingMapAPILoaderConfig();

/**
 * Bing Maps V8 implementation for the {@link MapAPILoader} service. 
 * 
 * @export
 * @class BingMapAPILoader
 * @extends {MapAPILoader}
 */
@Injectable()
export class BingMapAPILoader extends MapAPILoader {

    ///
    /// Field defintitions. 
    ///
    private _scriptLoadingPromise: Promise<void>;

    ///
    /// Property declarations. 
    ///

    /**
     * Gets the loader configuration. 
     * 
     * @readonly
     * @type {BingMapAPILoaderConfig}
     * @memberof BingMapAPILoader
     */
    public get Config(): BingMapAPILoaderConfig { return this._config; }

    /**
     * Creates an instance of BingMapAPILoader.
     * @param {BingMapAPILoaderConfig} _config  - The loader configuration. 
     * @param {WindowRef} _windowRef - An instance of {@link WindowRef}. Necessary because Bing Map V8 interacts with the window object. 
     * @param {DocumentRef} _documentRef - An instance of {@link DocumentRef}. Necessary because Bing Map V8 interacts with the document object. 
     * 
     * @memberof BingMapAPILoader
     */
    constructor( @Optional() private _config: BingMapAPILoaderConfig, private _windowRef: WindowRef, private _documentRef: DocumentRef) {
        super();
        if (this._config === null || this._config === undefined) {
            this._config = DEFAULT_CONFIGURATION;
        }
    }

    ///
    /// Public methods and MapAPILoader implementation. 
    ///

    /**
     * Loads the necessary resources for Bing Maps V8.
     * 
     * @returns {Promise<void>} 
     * 
     * @memberof BingMapAPILoader
     */
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

    ///
    /// Private methods
    ///

    /**
     * Gets the Bing Map V8 scripts url for injections into the header. 
     * 
     * @private
     * @param {string} callbackName - Name of the function to be called when the Bing Maps V8 scripts are loaded. 
     * @returns {string} - The url to be used to load the Bing Map scripts. 
     * 
     * @memberof BingMapAPILoader
     */
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