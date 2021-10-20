import { plugin } from './type.d';

const rect: plugin = {
	type: 'render',
	action: 'rect',
	draw: function (ctx, shape) {
		const { left, top, width, height, scaleX, scaleY, flipX, flipY, rotate, drawStyle } = shape;
		ctx.save();
		for (const style in drawStyle) {
			ctx[style] = drawStyle[style];
		}
		// 控制镜像反转
		ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
		if (rotate) {
			ctx.translate(left + (width * scaleX) / 2, top + (height * scaleY) / 2);
			ctx.rotate(rotate);
			ctx.translate(-(left + (width * scaleX) / 2), -(top + (height * scaleY) / 2));
		}
		ctx.strokeRect(
			flipX ? -(left + width * scaleX) : left,
			flipY ? -(top + height * scaleY) : top,
			width * scaleX,
			height * scaleY,
		);
		ctx.restore();
	},
};
export default rect;
