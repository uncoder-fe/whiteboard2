import { plugin } from './type.d';

const line: plugin = {
	action: 'line',
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
		} else {
			// 渲染图片，异步拿取，在更改原点时候，渲染异常
			// const image = await new Promise((resolve, reject) => {
			// 	const img = new Image();
			// 	img.src = base64;
			// 	img.onload = function(){
			// 		resolve(this);
			// 	};
			// });
			let image = document.getElementById(`${id}`) as any;
			if (!image) {
				// 兼容：：：手工新建的直线，采用
				image = await new Promise((resolve, reject) => {
					const img = new Image();
					img.src = base64;
					img.onload = function(){
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

export default line;
