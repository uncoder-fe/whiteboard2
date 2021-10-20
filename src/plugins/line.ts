import { plugin } from './type.d';

const line: plugin = {
	action: 'line',
	draw: async (ctx, shape) => {
		const { id, left, top, height, width, scaleX, scaleY, flipX, flipY, rotate, base64, points, drawStyle } = shape;
		if (!base64) {
			const len = points.length;
			const [x, y] = [points[0][0], points[0][1]];
			const [endX, endY] = [points[len - 1][0], points[len - 1][1]];
			ctx.save();
			for (const style in drawStyle) {
				ctx[style] = drawStyle[style];
			}
			ctx.beginPath();
			ctx.moveTo(x, y);
			ctx.lineTo(endX, endY);
			ctx.stroke();
			ctx.closePath();
			ctx.restore();
		} else {
			// 优先从缓存读取图片
			let image = document.getElementById(`${id}`) as any;
			if (!image) {
				// 渲染图片，异步拿取，在更改原点时候，渲染异常
				image = await new Promise((resolve, reject) => {
					const img = new Image();
					img.src = base64;
					img.onload = function () {
						resolve(this);
					};
				});
			}
			const x = flipX ? -(left + width * scaleX) : left;
			const y = flipY ? -(top + height * scaleY) : top;
			ctx.save();
			// 控制镜像反转
			ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
			if (rotate) {
				ctx.translate(left + (width * scaleX) / 2, top + (height * scaleY) / 2);
				ctx.rotate(rotate);
				ctx.translate(-(left + (width * scaleX) / 2), -(top + (height * scaleY) / 2));
			}
			// 扩展大小，防止线条切边，4
			const v = drawStyle.lineWidth * 2;
			ctx.drawImage(image, x - v, y - v, width * scaleX, height * scaleY);
			ctx.restore();
		}
	},
};

export default line;
