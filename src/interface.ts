export interface StageProps {
    action: string;
    onChange?: Function;
    getRef?: Function;
    scale?: number;
    width: number;
    height: number;
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
}
// definition.d.ts
declare module '*.png';
declare module '*.less';