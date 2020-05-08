export interface StageProps {
    action: string;
    onChange?: Function;
    getRef?: Function;
    scale?: number;
    width: number;
    height: number;
    maxWidth?: number;
    maxHeight?: number;
    imgUrl?: string;
    style?: object;
    plugins?: any;
    initHistory?: any;
    generateImageBackgroundColor?: string;
    resetDefaultStyle?: {
        drawStyle: {
            stroke: string;
            strokeWidth: number;
        };
        eraserStyle: {
            strokeWidth: number;
        };
    };
    helpLine?: boolean;
}
// definition.d.ts
declare module '*.png';
declare module '*.less';
