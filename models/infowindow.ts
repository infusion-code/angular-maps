import { ILatLong } from '../interfaces/ilatlong';
import { IInfoWindowOptions } from '../interfaces/iinfowindowoptions';

export abstract class InfoWindow {
    public abstract get NativePrimitve(): any;

    public abstract Close(): void ;
    public abstract GetPosition(): ILatLong;
    public abstract Open(): void ;
    public abstract SetOptions(options: IInfoWindowOptions): void;
    public abstract SetPosition(position: ILatLong): void ;
}
