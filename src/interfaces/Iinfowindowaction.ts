export interface IInfoWindowAction {
    label?: string;
    icon?: string;
    eventHandler: (args?: any) => void;
}
