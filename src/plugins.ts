const plugins = [
	{
		action: 'rect',
		style: {
			strokeStyle: 'red',
			lineWidth: 4,
		},
		draw: function (ctx, shape) {
			const { left, top, width, height } = shape
			// 这里不需要使用ctx.beginPath()，潜规则？clearRect依然可以生效
			ctx.save()
			for (const i in this.style) {
				ctx[i] = this.style[i]
			}
			ctx.strokeRect(left, top, width, height)
			const image = document.querySelector('#image')
			ctx.drawImage(image, left, top, width, height)
			ctx.restore()
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
			const len = points.length
			const [x, y] = [points[0][0], points[0][1]]
			const [endX, endY] = [points[len - 1][0], points[len - 1][1]]
			path.moveTo(x, y)
			path.lineTo(endX, endY)
			return path
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
			const { left, top, width, height } = shape
			const centerX = left + width / 2
			const centerY = top + height / 2
			// const radius =
			// 	Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)) / 2
			const radiusX = width / 2
			const radiusY = height / 2
			ctx.save()
			for (const i in this.style) {
				ctx[i] = this.style[i]
			}
			ctx.beginPath()
			// ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
			ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2)
			ctx.stroke()
			ctx.restore()
		},
	},
]
export default plugins
