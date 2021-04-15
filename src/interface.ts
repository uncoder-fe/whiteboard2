export interface StageProps {
	onChange?: (any) => void;
	forwardedRef?: any;
	scale?: number;
	width: number;
	height: number;
	style?: object;
	plugin?: any;
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
