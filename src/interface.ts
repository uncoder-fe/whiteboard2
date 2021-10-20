export interface drawStyleI {
	strokeStyle?: string;
	lineWidth?: number;
	lineCap?: string;
	lineJoin?: string;
}


export interface StageProps {
	onChange?: (any) => void;
	forwardedRef?: any;
	scale?: number;
	width: number;
	height: number;
	initHistory?: any;
	helpLine?: boolean;
	drawStyle?: drawStyleI;
}
