const plugins = [
	{
		action: 'rect',
		style: {
			strokeStyle: 'blue',
			lineWidth: 4,
		},
		draw: function (ctx, shape) {
			// console.log(shape)
			const { left, top, width, height, scaleX, scaleY, flipX, flipY, rotate } = shape;
			ctx.save();
			ctx.transform(flipX ? -1 : 1, 0, 0, flipY ? -1 : 1, 0, 0);
			for (const i in this.style) {
				ctx[i] = this.style[i];
			}
			ctx.strokeRect(
				flipX ? -(left + width * scaleX) : left,
				flipY ? -(top + height * scaleY) : top,
				width * scaleX,
				height * scaleY,
			);
			ctx.rotate(rotate);
			// 测试图
			const image = document.querySelector('#image');
			ctx.drawImage(
				image,
				flipX ? -(left + width * scaleX) : left,
				flipY ? -(top + height * scaleY) : top,
				width * scaleX,
				height * scaleY,
			);
			ctx.restore();
		},
	},
	{
		action: 'line',
		// style: {
		// 	stroke: 'red',
		// 	'stroke-width': 2,
		// 	fill: 'blue',
		// 	'stroke-dasharray': "4 4"
		// },
		draw: function (path, points) {
			const len = points.length;
			const [x, y] = [points[0][0], points[0][1]];
			const [endX, endY] = [points[len - 1][0], points[len - 1][1]];
			path.moveTo(x, y);
			path.lineTo(endX, endY);
			return path;
		},
	},
	{
		action: 'circle',
		style: {
			strokeStyle: 'red',
			lineWidth: 4,
			fill: 'none',
		},
		draw: function (ctx, shape) {
			const { left, top, width, height, scaleX, scaleY, flipX, flipY } = shape;
			const centerX = left + (width * scaleX) / 2;
			const centerY = top + (height * scaleY) / 2;
			// const radius =
			// 	Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)) / 2
			const radiusX = (width * scaleX) / 2;
			const radiusY = (height * scaleY) / 2;
			ctx.beginPath();
			ctx.save();
			ctx.transform(flipX ? -1 : 1, 0, 0, flipY ? -1 : 1, 0, 0);
			for (const i in this.style) {
				ctx[i] = this.style[i];
			}
			// ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
			ctx.ellipse(flipX ? -centerX : centerX, flipY ? -centerY : centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
			ctx.stroke();
			ctx.restore();
		},
	},
];
export default plugins;
