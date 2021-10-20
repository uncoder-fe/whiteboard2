import { plugin } from './type.d';

const pencil: plugin = {
	type: 'render',
	action: 'pencil',
	draw: async (ctx, shape) => {
		const {
			id,
			left,
			top,
			height,
			width,
			scaleX,
			scaleY,
			flipX,
			flipY,
			rotate,
			base64,
			points,
			drawStyle,
		} = shape;
		if (!base64) {
			const len = points.length;
			ctx.save();
			for (const style in drawStyle) {
				ctx[style] = drawStyle[style];
			}
			ctx.beginPath();
			for (let i = 0; i < len; i++) {
				const start = points[i];
				const end = points[i + 1];
				if (end) {
					// ctx.moveTo(start[0], start[1]);
					// ctx.lineTo(end[0], end[1]);
					ctx.quadraticCurveTo(start[0], start[1], end[0], end[1]);
				}
			}
			ctx.stroke();
			ctx.closePath();
			ctx.restore();
		} else {
			let image = document.getElementById(`${id}`) as any;
			if (!image) {
				image = await new Promise((resolve, reject) => {
					const img = new Image();
					img.src = base64;
					img.onload = function () {
						resolve(this);
					};
				});
			}
			ctx.save();
			// 控制镜像反转
			ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
			if (rotate) {
				ctx.translate(left + (width * scaleX) / 2, top + (height * scaleY) / 2);
				ctx.rotate(rotate);
				ctx.translate(-(left + (width * scaleX) / 2), -(top + (height * scaleY) / 2));
			}
			const x = flipX ? -(left + width * scaleX) : left;
			const y = flipY ? -(top + height * scaleY) : top;
			// 扩展大小，防止线条切边，4
			const v = drawStyle.lineWidth * 2;
			ctx.drawImage(image, x - v, y - v, width * scaleX, height * scaleY);
			ctx.restore();
		}
	},
};

export default pencil;
