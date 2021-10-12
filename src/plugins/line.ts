import { plugin } from './type.d';

const line: plugin = {
	action: 'line',
	draw: (ctx, shape) => {
		const { points, offsetX, offsetY } = shape;
		const len = points.length;
		const [x, y] = [points[0][0], points[0][1]];
		const [endX, endY] = [points[len - 1][0], points[len - 1][1]];
		ctx.save();
		ctx.strokeStyle = 'green';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(x + offsetX, y + offsetY);
		ctx.lineTo(endX + offsetX, endY + offsetY);
		ctx.stroke();
		ctx.closePath();
		ctx.restore();
	},
};

export default line;
