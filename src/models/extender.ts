export class Extender {

    private _obj: any;
    private _proto: any;

    constructor(obj: any) {
        this._obj = obj;
        this._proto = obj.prototype;
    }

    Extend(newObj: any): Extender {

        this.Set('prototype', newObj, this._obj);

        for (const y in this._proto) {
            if ((<any>this._proto)[y] != null) {
                this.Set(y, (this._proto)[y], (<any>this._obj.prototype)[y]);
            }
        }

        return this;
    }

    Set(property: string, newObj: any, obj?: any): Extender {
        if (typeof newObj === 'undefined') {
            return this;
        }

        if (typeof obj === 'undefined') {
            obj = this._proto;
        }

        Object.defineProperty(obj, property, newObj);
    }

    Map(property: string, newProperty: string): Extender {
        this.Set(property, this._proto[newProperty], this._obj.prototype);
        return this;
    }
}