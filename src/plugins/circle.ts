import { plugin } from './type.d';

const rect: plugin = {
	type: 'render',
	action: 'circle',
	draw: function (ctx, shape) {
		const { left, top, width, height, scaleX, scaleY, flipX, flipY, rotate } = shape;
		const centerX = left + (width * scaleX) / 2;
		const centerY = top + (height * scaleY) / 2;
		// const radius =
		// 	Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)) / 2
		const radiusX = (width * scaleX) / 2;
		const radiusY = (height * scaleY) / 2;
		ctx.save();
		ctx.strokeStyle = 'red';
		ctx.lineWidth = 4;
		ctx.beginPath();
		ctx.transform(flipX ? -1 : 1, 0, 0, flipY ? -1 : 1, 0, 0);
		// ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
		ctx.ellipse(flipX ? -centerX : centerX, flipY ? -centerY : centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
		ctx.stroke();
		ctx.closePath();
		ctx.restore();
	},
};
export default rect;
