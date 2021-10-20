import { plugin } from './type.d';

const triangle: plugin = {
	type: 'render',
	action: 'triangle',
	draw: function (ctx, shape) {
		const { left, top, width, height, scaleX, scaleY, flipX, flipY, rotate, drawStyle } = shape;
		console.log('shape', left, top, width, height);
		ctx.save();
		for (const style in drawStyle) {
			ctx[style] = drawStyle[style];
		}
		ctx.beginPath();
		ctx.moveTo(left + (width * scaleX) / 2, top);
		ctx.lineTo(left, top + height);
		ctx.lineTo(left + width * scaleX, top + height);
		ctx.closePath();
		ctx.stroke();
		ctx.restore();
	},
};
export default triangle;
