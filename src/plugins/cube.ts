import { plugin } from './type.d';

const cube: plugin = {
	type: 'render',
	action: 'cube',
	draw: function (ctx, shape) {
		const { left, top, width, height, scaleX, scaleY, flipX, flipY, rotate } = shape;
		const x = (width * scaleX) / 2;
		const y = (width * scaleX) / 2;
		const z = (width * scaleX) / 2;
		const points = [
			[0, 0],
			[x, 0],
			[x, -y],
			[0, -y],
			[z * Math.cos((45 * Math.PI) / 180), -z * Math.sin((45 * Math.PI) / 180)],
			[z * Math.cos((45 * Math.PI) / 180), -y - z * Math.sin((45 * Math.PI) / 180)],
			[x + z * Math.cos((45 * Math.PI) / 180), -z * Math.sin((45 * Math.PI) / 180)],
			[x + z * Math.cos((45 * Math.PI) / 180), -y - z * Math.sin((45 * Math.PI) / 180)],
		];
		const faces = [
			[points[4], points[5], points[7], points[6]], //后
			[points[0], points[4], points[6], points[1]], //下
			[points[0], points[3], points[5], points[4]], //左
			[points[1], points[2], points[7], points[6]], //右
			[points[2], points[3], points[5], points[7]], //上
			[points[0], points[3], points[2], points[1]], //前
		];
		ctx.save();
		ctx.translate(left, top + y);
		for (let i = 0; i < faces.length; i++) {
			const p = faces[i];
			ctx.beginPath();
			for (let j = 0; j < p.length; j++) {
				if (j == 0) {
					ctx.moveTo(p[j][0], p[j][1]);
				} else {
					ctx.lineTo(p[j][0], p[j][1]);
				}
			}
			ctx.closePath();
			ctx.stroke();
		}
		ctx.restore();
	},
};
export default cube;
