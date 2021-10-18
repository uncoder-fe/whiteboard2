import { plugin } from './type.d';

const pencil: plugin = {
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
			offsetX,
			offsetY,
			base64,
			points,
		} = shape;
		if (!base64) {
			const len = points.length;
			ctx.save();
			ctx.strokeStyle = 'blue';
			ctx.lineWidth = 2;
			ctx.beginPath();
			for (let i = 0; i < len; i++) {
				const start = points[i];
				const end = points[i + 1];
				if (end) {
					ctx.moveTo(start[0] + offsetX, start[1] + offsetY);
					ctx.lineTo(end[0]+ offsetX, end[1] + offsetY);
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
			ctx.drawImage(
				image,
				flipX ? -(left + width * scaleX + offsetX) : left + offsetX,
				flipY ? -(top + height * scaleY + offsetY) : top + offsetY,
				width * scaleX,
				height * scaleY,
			);
			ctx.restore();
		}
	},
};

export default pencil;
