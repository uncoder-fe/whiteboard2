import { plugin } from './type.d';

const rect: plugin = {
	action: 'rect',
	draw: function (ctx, shape, points) {
		const { left, top, width, height, scaleX, scaleY, flipX, flipY, rotate, offsetX, offsetY } = shape;
		ctx.save();
		ctx.strokeStyle = 'blue';
		ctx.lineWidth = 10;
		// 控制镜像反转
		ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
		if (rotate) {
			ctx.translate(left + (width * scaleX) / 2, top + (height * scaleY) / 2);
			ctx.rotate(rotate);
			ctx.translate(-(left + (width * scaleX) / 2), -(top + (height * scaleY) / 2));
		}
		ctx.strokeRect(
			flipX ? -(left + width * scaleX + offsetX) : left + offsetX,
			flipY ? -(top + height * scaleY + offsetY) : top + offsetY,
			width * scaleX,
			height * scaleY,
		);
		ctx.restore();
	},
};
export default rect;