import React, { useEffect, useRef } from 'react'
import { merge, fromEvent } from 'rxjs'
import { tap, map, switchMap, takeUntil, skipWhile } from 'rxjs/operators'
import { StageProps } from './interface'

import styles from './index.less'
// 预设缩放按钮矩形的大小
const rectSize = 20
// 默认插件
const defaultPlugin = [
	{
		action: 'hand',
	},
	{
		action: 'move',
	},
	{
		action: 'pencil',
		style: {
			strokeStyle: 'blue',
			lineWidth: 10,
		},
		draw: function (ctx, points) {
			ctx.beginPath()
			ctx.moveTo()
			ctx.stroke()
			// ctx.fill()
			ctx.restore()
		},
	},
]
// 鼠标形状
const CURSOR = {
	topCenter: 'n-resize', // 上中(1)
	rightTop: 'ne-resize', // 右上(2)
	rightCenter: 'e-resize', // 右中(3)
	rightBottom: 'se-resize', // 右下(4)
	bottomCenter: 's-resize', // 下中(5)
	leftBottom: 'sw-resize', // 左下(6)
	leftCenter: 'w-resize', // 左中(7)
	leftTop: 'nw-resize', // 左上(8)
	default: 'default',
	move: 'move',
}
// 计算shape位置
const genShapePosition = (ops) => {
	let {
		isGrow,
		disX,
		disY,
		left,
		top,
		width,
		height,
		scaleX,
		scaleY,
		flipX,
		flipY,
	} = ops
	const disXtoY = disX * (height / width)
	let newLeft = left
	let newTop = top
	let newScaleX = scaleX
	let newScaleY = scaleY
	let newFlipX = flipX
	let newFlipY = flipY
	let increaseX = 0
	let increaseY = 0
	if (isGrow && (disX !== 0 || disY !== 0)) {
		// 某一方向放大或者缩小
		increaseX = Math.abs(disX) / width
		increaseY = Math.abs(disY) / height
		switch (isGrow) {
			case 'topCenter':
				if (disY < 0) {
					// 增加
					newScaleY = scaleY + increaseY
					newTop = top + disY
				} else if (disY > 0 && disY < height * scaleY) {
					// 减少
					newScaleY = scaleY - increaseY
					newTop = top + disY
				} else if (disY > 0) {
					// 反向
					newScaleY = Math.abs(disY - height * scaleY) / height
					newTop = top + height * scaleY
					newFlipY = !newFlipY
				}
				break
			case 'rightTop':
				if (disX > 0) {
					// 增加
					newScaleX = scaleX + increaseX
					newScaleY = newScaleX
					newTop = top - disXtoY
				} else if (disX < 0 && disX > -width * scaleX) {
					// 减小
					newScaleX = scaleX - increaseX
					newScaleY = newScaleX
					newTop = top + height * increaseX
				} else if (disX < 0) {
					// 反向
					newScaleX =
						Math.abs(Math.abs(disX) - width * scaleX) / width
					newScaleY = newScaleX
					newLeft = left - (Math.abs(disX) - width * scaleX)
					newTop = top + height * scaleY
					newFlipX = !newFlipX
					newFlipY = !newFlipY
				}
				break
			case 'rightCenter':
				// 计算变化
				if (disX > 0) {
					// 增加
					newScaleX = scaleX + increaseX
				} else if (disX < 0 && disX > -(width * scaleX)) {
					// 减少
					newScaleX = scaleX - increaseX
				} else if (disX < 0) {
					// 减小致反向运动
					newScaleX =
						Math.abs(Math.abs(disX) - width * scaleX) / width
					newLeft = left - (Math.abs(disX) - width * scaleX)
					newFlipX = !newFlipX
				}
				break
			case 'rightBottom':
				if (disX > 0) {
					// 增加
					newScaleX = scaleX + increaseX
					newScaleY = newScaleX
				} else if (disX < 0 && disX > -width * scaleX) {
					// 减小
					newScaleX = scaleX - increaseX
					newScaleY = newScaleX
				} else if (disX < 0) {
					// 反向
					newScaleX =
						Math.abs(Math.abs(disX) - width * scaleX) / width
					newScaleY = newScaleX
					newLeft = left - (Math.abs(disX) - width * scaleX)
					newTop = top - (Math.abs(disXtoY) - height * scaleY)
					newFlipX = !newFlipX
					newFlipY = !newFlipY
				}
				break
			case 'bottomCenter':
				if (disY > 0) {
					// 增加
					newScaleY = scaleY + increaseY
				} else if (disY < 0 && disY > -height * scaleY) {
					// 减小
					newScaleY = scaleY - increaseY
				} else if (disY < 0) {
					// 反向
					newScaleY =
						Math.abs(Math.abs(disY) - height * scaleY) / height
					newTop = top - (Math.abs(disY) - height * scaleY)
					newFlipY = !newFlipY
				}
				break
			case 'leftBottom':
				if (disX < 0) {
					// 增加
					newScaleX = scaleX + increaseX
					newScaleY = newScaleX
					newLeft = left + disX
				} else if (disX > 0 && disX < width) {
					// 减少
					newScaleX = Math.abs(scaleX - increaseX)
					newScaleY = newScaleX
					newLeft = left + disX
				} else if (disX > 0) {
					// 反向
					newScaleX = Math.abs(disX - width * scaleX) / width
					newScaleY = newScaleX
					newLeft = left + width * scaleX
					newTop = top - Math.abs(disXtoY - height * scaleY)
					newFlipX = !newFlipX
					newFlipY = !newFlipY
				}
				break
			case 'leftCenter':
				if (disX < 0) {
					// 增加
					newScaleX = scaleX + increaseX
					newLeft = left + disX
				} else if (disX > 0 && disX < width * scaleX) {
					// 减少
					newScaleX = Math.abs(scaleX - increaseX)
					newLeft = left + disX
				} else if (disX > 0) {
					// 当前系数增量
					newScaleX = Math.abs(disX - width * scaleX) / width
					// 减少致反向运动
					newLeft = left + width * scaleX
					newFlipX = !newFlipX
				}
				break
			case 'leftTop':
				if (disX < 0) {
					// 增加
					newScaleX = scaleX + increaseX
					newScaleY = newScaleX
					newLeft = left - Math.abs(disX)
					newTop = top - Math.abs(disXtoY)
				} else if (disX > 0 && disX < width) {
					// 减少
					newScaleX = scaleX - increaseX
					newScaleY = newScaleX
					newLeft = left + disX
					newTop = top + disXtoY
				} else if (disX > 0) {
					// 反向
					newScaleX = (disX - width * scaleX) / width
					newScaleY = newScaleX
					newLeft = left + width * scaleX
					newTop = top + height * scaleY
					newFlipX = !newFlipX
					newFlipY = !newFlipY
				}
				break
			default:
				break
		}
	} else {
		// 移动
		newLeft = left + disX
		newTop = top + disY
	}
	return { newLeft, newTop, newScaleX, newScaleY, newFlipX, newFlipY }
}
// 原点坐标计算
function getVertex(maxWidth, maxHeight, width, height, x, y) {
	let newX = x
	let newY = y
	const minX = -(maxWidth - width) / 2
	const minY = -(maxHeight - height) / 2
	const maxX = maxWidth - width - (maxWidth - width) / 2
	const maxY = maxHeight - height - (maxHeight - height) / 2
	if (x > maxX) {
		newX = maxX
	}
	if (x < minX) {
		newX = minX
	}
	if (y > maxY) {
		newY = maxY
	}
	if (y < minY) {
		newY = minY
	}
	return [newX, newY]
}
// 辅助线
function helpAxis(ctx, x, y, width, height, sizeX, sizeY) {
	ctx.save()
	ctx.setLineDash([2, 6])
	ctx.strokeStyle = 'yellow'
	ctx.lineWidth = 4
	ctx.beginPath()
	ctx.moveTo(x + width / 2, y)
	ctx.lineTo(x + width / 2, y + height)
	ctx.moveTo(x, height / 2 + y)
	ctx.lineTo(x + width, height / 2 + y)
	ctx.stroke()
	ctx.strokeRect(x, y, sizeX, sizeY)
	ctx.strokeRect(x + sizeX, y + sizeY, sizeX, sizeY)
	ctx.strokeRect(x - sizeX, y - sizeY, sizeX, sizeY)
	ctx.restore()
}
// 主台
function Stage(props: StageProps) {
	const {
		action,
		getRef,
		onChange,
		height,
		width,
		style = {},
		plugins = [],
		initHistory = [],
		imgUrl,
		maxWidth = width + 200,
		maxHeight = height + 200,
		helpLine = false,
	} = props
	// 原始坐标系，viewport
	const axisOrigin = useRef([0, 0])
	// 绘制动作组
	const allPlugins: any = [...defaultPlugin, ...plugins]
	// 存储记录
	const history = useRef([])
	// canvas容器
	const outerContainer = useRef(null)
	const innerContainer = useRef(null)
	// 当前选中的shape
	const currentShapeId = useRef(null)
	// 检测是否命中精灵
	const hitSprite = (ox, oy) => {
		const x = ox - axisOrigin.current[0]
		const y = oy - axisOrigin.current[1]
		const hitArry = history.current.filter((item) => {
			const { left, top, width, height, scaleX, scaleY } = item
			if (
				left - rectSize < x &&
				x < left + width * scaleX + rectSize * 2 &&
				top - rectSize < y &&
				y < top + height * scaleY + rectSize * 2
			) {
				// 当是框的时候，检测区域增加rectSize的大小，因为要计算拖拽的圆圈
				return true
			}
			return false
		})
		return hitArry
	}
	// 检测命中放大区域
	const hitSpriteGrow = (ox, oy) => {
		const x = ox - axisOrigin.current[0]
		const y = oy - axisOrigin.current[1]
		const findShape = history.current.find(
			(item) => item.id === currentShapeId.current,
		)
		if (!findShape) {
			return null
		}
		const { left, top, width, height, scaleX, scaleY } = findShape
		if (
			left + (width * scaleX) / 2 - rectSize / 2 < x &&
			x < left + (width * scaleX) / 2 + rectSize / 2 &&
			top - rectSize / 2 < y &&
			y < top + rectSize / 2
		) {
			// 上中(1)
			return 'topCenter'
		}
		if (
			left + width * scaleX - rectSize / 2 < x &&
			x < left + width * scaleX + rectSize / 2 &&
			top - rectSize / 2 < y &&
			y < top + rectSize / 2
		) {
			// 右上(2)
			return 'rightTop'
		}
		if (
			left + width * scaleX - rectSize / 2 < x &&
			x < left + width * scaleX + rectSize / 2 &&
			top + (height * scaleY) / 2 - rectSize / 2 < y &&
			y < top + (height * scaleY) / 2 + rectSize / 2
		) {
			// 右中(3)
			return 'rightCenter'
		}
		if (
			left + width * scaleX - rectSize / 2 < x &&
			x < left + width * scaleX + rectSize / 2 &&
			top + height * scaleY - rectSize / 2 < y &&
			y < top + height * scaleY + rectSize / 2
		) {
			// 右下(4)
			return 'rightBottom'
		}
		if (
			left + (width * scaleX) / 2 - rectSize / 2 < x &&
			x < left + (width * scaleX) / 2 + rectSize / 2 &&
			top + height * scaleY - rectSize / 2 < y &&
			y < top + height * scaleY + rectSize / 2
		) {
			// 下中(5)
			return 'bottomCenter'
		}
		if (
			left - rectSize / 2 < x &&
			x < left + rectSize / 2 &&
			top + height * scaleY - rectSize / 2 < y &&
			y < top + height * scaleY + rectSize / 2
		) {
			// 左下(6)
			return 'leftBottom'
		}
		if (
			left - rectSize / 2 < x &&
			x < left + rectSize / 2 &&
			top + (height * scaleY) / 2 - rectSize / 2 < y &&
			y < top + (height * scaleY) / 2 + rectSize / 2
		) {
			// 左中(7)
			return 'leftCenter'
		}
		if (
			left - rectSize / 2 < x &&
			x < left + rectSize / 2 &&
			top - rectSize / 2 < y &&
			y < top + rectSize / 2
		) {
			// 左上(8)
			return 'leftTop'
		}
		return null
	}
	// 重新渲染
	const reRender = (arr?: [], ap?: [number, number]) => {
		const list = arr || history.current
		const ctx = innerContainer.current.getContext('2d')
		const ox = ap ? ap[0] : axisOrigin.current[0]
		const oy = ap ? ap[1] : axisOrigin.current[1]
		ctx.save()
		ctx.setTransform(1, 0, 0, 1, ox, oy)
		ctx.clearRect(
			-(maxWidth - width) / 2,
			-(maxHeight - height) / 2,
			maxWidth,
			maxHeight,
		)
		if (helpLine) {
			helpAxis(
				ctx,
				0,
				0,
				width,
				height,
				(maxWidth - width) / 2,
				(maxHeight - height) / 2,
			)
		}
		for (let i = 0; i < list.length; i++) {
			const { id, type } = list[i]
			if (id === currentShapeId.current) {
				continue
			}
			// 检测是否是新建动作，更新shape的路径信息
			const drawAction = allPlugins.find((item) => item.action === type)
			drawAction.draw(ctx, list[i])
		}
		ctx.restore()
	}
	// 渲染轮廓
	const drawShapeWidthControl = (shape) => {
		const ctx = outerContainer.current.getContext('2d')
		ctx.save()
		ctx.setTransform(
			1,
			0,
			0,
			1,
			axisOrigin.current[0],
			axisOrigin.current[1],
		)
		ctx.clearRect(
			-(maxWidth - width) / 2,
			-(maxHeight - height) / 2,
			maxWidth,
			maxHeight,
		)
		// 检测是否是新建动作，更新shape的路径信息
		const drawAction = allPlugins.find((item) => item.action === shape.type)
		drawAction.draw(ctx, shape)
		// 绘制轮廓
		const {
			left,
			top,
			width: widthR,
			height: heightR,
			scaleX,
			scaleY,
		} = shape
		ctx.fillStyle = 'rgba(255,125,113,0.2)'
		ctx.fillRect(
			left - rectSize,
			top - rectSize,
			widthR * scaleX + rectSize * 2,
			heightR * scaleY + rectSize * 2,
		)
		ctx.fillStyle = 'yellow'
		ctx.beginPath()
		// 上中(1)
		ctx.fillRect(
			left + (widthR * scaleX) / 2 - rectSize / 2,
			top - rectSize / 2,
			rectSize,
			rectSize,
		)
		ctx.closePath()
		// 右上(2)
		ctx.fillRect(
			widthR * scaleX + left - rectSize / 2,
			top - rectSize / 2,
			rectSize,
			rectSize,
		)
		ctx.closePath()
		// 右中(3)
		ctx.fillRect(
			left + widthR * scaleX - rectSize / 2,
			top + (heightR * scaleY) / 2 - rectSize / 2,
			rectSize,
			rectSize,
		)
		ctx.closePath()
		// 右下(4)
		ctx.fillRect(
			left + widthR * scaleX - rectSize / 2,
			top + heightR * scaleY - rectSize / 2,
			rectSize,
			rectSize,
		)
		ctx.closePath()
		// 下中(5)
		ctx.fillRect(
			left + (widthR * scaleX) / 2 - rectSize / 2,
			top + heightR * scaleY - rectSize / 2,
			rectSize,
			rectSize,
		)
		ctx.closePath()
		// 左下(6)
		ctx.fillRect(
			left - rectSize / 2,
			top + heightR * scaleY - rectSize / 2,
			rectSize,
			rectSize,
		)
		ctx.closePath()
		// 左中(7)
		ctx.fillRect(
			left - rectSize / 2,
			top + (heightR * scaleY) / 2 - rectSize / 2,
			rectSize,
			rectSize,
		)
		ctx.closePath()
		// 左上(8)
		ctx.fillRect(
			left - rectSize / 2,
			top - rectSize / 2,
			rectSize,
			rectSize,
		)
		ctx.closePath()
		ctx.restore()
	}
	// 注册清空事件
	const clear = () => {
		history.current = []
		// 回调数据结果
		if (onChange) {
			onChange([])
		}
	}
	// 注册放大/缩小事件
	const scale = (m) => {
		if (!currentShapeId.current) {
			return
		}
		const ctx = outerContainer.current.getContext('2d')
		ctx.clearRect(0, 0, width, height)
		const scaleFactor = m === 'enlarge' ? 1.2 : 0.8
		const shape = history.current.find(
			(item) => item.id === currentShapeId.current,
		)
		// 缩放
		const widthR = shape.width * scaleFactor
		const heightR = shape.height * scaleFactor
		shape.left = shape.left + (shape.width - widthR) / 2
		shape.top = shape.top + (shape.height - heightR) / 2
		shape.width = widthR
		shape.height = heightR
		drawShapeWidthControl(shape)
		reRender()
		// 回调数据结果
		if (onChange) {
			onChange(history.current)
		}
	}
	// 初始化
	useEffect(() => {
		if (getRef) {
			getRef({ clear, scale })
		}
		if (initHistory.length > 0) {
			history.current = [...initHistory]
			reRender()
		}
	}, [])
	// 核心事件流
	useEffect(() => {
		if (
			action === 'rect' ||
			action === 'circle' ||
			action === 'moveCanvas'
		) {
			// 切换为绘图模式时，清空
			currentShapeId.current = null
			const ctx = outerContainer.current.getContext('2d')
			ctx.clearRect(0, 0, width, height)
			reRender()
		}
		// 设置事件能穿透到下面的元素
		if (action && action != 'hand') {
			// 注意Safari不支持bounding-box`
			outerContainer.current.parentNode.style.pointerEvents =
				'bounding-box'
		} else {
			outerContainer.current.parentNode.style.pointerEvents = 'none'
		}
		// 检测是否是新建动作，更新shape的路径信息
		const drawAction = allPlugins.find((item) => item.action === action)
		// 鼠标和触控事件合并
		const $mousedown = fromEvent(outerContainer.current, 'mousedown').pipe(
			map((event: any) => {
				event.preventDefault()
				return {
					x: event.offsetX,
					y: event.offsetY,
					target: event.target,
				}
			}),
		)
		const $mousemove = fromEvent(outerContainer.current, 'mousemove').pipe(
			map((event: any) => {
				event.preventDefault()
				return {
					x: event.offsetX,
					y: event.offsetY,
					target: event.target,
				}
			}),
		)
		const $mouseup = fromEvent(window, 'mouseup')
		const $touchstart = fromEvent(
			outerContainer.current,
			'touchstart',
		).pipe(
			skipWhile((event: any) => event.touches.length >= 2),
			map((event: any) => {
				event.preventDefault()
				const { clientX, clientY, target } = event.changedTouches[0]
				const {
					top,
					left,
				} = outerContainer.current.getBoundingClientRect()
				return {
					x: clientX - left,
					y: clientY - top,
					target,
				}
			}),
		)
		const $touchmove = fromEvent(outerContainer.current, 'touchmove').pipe(
			skipWhile((event: any) => event.touches.length >= 2),
			map((event: any) => {
				event.preventDefault()
				const { clientX, clientY, target } = event.changedTouches[0]
				const {
					top,
					left,
				} = outerContainer.current.getBoundingClientRect()
				return {
					x: clientX - left,
					y: clientY - top,
					target,
				}
			}),
		)
		const $touchend = fromEvent(window, 'touchend')
		// 注册点击事件流
		let source = merge($mousedown, $touchstart).pipe(
			map((event: { x: number; y: number }) => {
				let shape = null
				// 检测是否是新建动作
				if (action === 'rect' || action === 'circle') {
					shape = {
						id: Math.random().toString(36).slice(2),
						type: action,
						points: [],
						left: event.x,
						top: event.y,
						width: 0,
						height: 0,
						scaleX: 1,
						scaleY: 1,
						flipX: false,
						flipY: false,
					}
				}
				// 移动
				if (action === 'move') {
					// 存在高亮，判定是不是缩放区域
					const isGrow = hitSpriteGrow(event.x, event.y)
					if (isGrow) {
						const r = history.current.find(
							(item) => item.id === currentShapeId.current,
						)
						shape = JSON.parse(JSON.stringify(r))
					} else {
						// 重新寻找新shape
						const hitArry = hitSprite(event.x, event.y)
						if (hitArry.length > 0) {
							// 继续使用旧的
							if (
								hitArry.some(
									(item) =>
										item.id === currentShapeId.current,
								)
							) {
								const r = history.current.find(
									(item) =>
										item.id === currentShapeId.current,
								)
								shape = JSON.parse(JSON.stringify(r))
							} else {
								// 全新
								shape = JSON.parse(
									JSON.stringify(hitArry[hitArry.length - 1]),
								)
							}
						}
					}
					if (shape) {
						currentShapeId.current = shape.id
						// 从真实区域删除这个shape的渲染
						reRender()
						// 把这个shape渲染到事件屏操作
						drawShapeWidthControl(shape)
					}
				}
				return [event.x, event.y, shape]
			}),
			switchMap(([startX, startY, shape]) => {
				// 存储从落下到移动的所有点
				let points = []
				if (action) {
					points.push([startX, startY])
				}
				return merge($mousemove, $touchmove).pipe(
					map((event: { x: number; y: number }) => {
						const { x: moveX, y: moveY } = event
						points.push([moveX, moveY])
						return { points, shape }
					}),
					takeUntil(
						merge($mouseup, $touchend).pipe(
							tap(() => {
								// 检测是否是新建动作，更新shape坐标和大小信息
								if (
									(action === 'rect' ||
										action === 'circle') &&
									shape
								) {
									// 更新矩形区域大小，在这更新减少在绘制过程中的计算导致的性能消耗
									const left = Math.min(
										shape.left,
										points[points.length - 1][0],
									)
									const top = Math.min(
										shape.top,
										points[points.length - 1][1],
									)
									const widthR = Math.abs(
										points[points.length - 1][0] -
											shape.left,
									)
									const heightR = Math.abs(
										points[points.length - 1][1] -
											shape.top,
									)
									shape.left = left - axisOrigin.current[0]
									shape.top = top - axisOrigin.current[1]
									shape.width = widthR
									shape.height = heightR
									shape.points = points
									// 清空事件屏
									const ctx = outerContainer.current.getContext(
										'2d',
									)
									ctx.clearRect(0, 0, width, height)
									// 更新历史
									history.current = [
										...history.current,
										shape,
									]
									// 绘制到真实区域
									reRender()
								}
								// 移动
								if (
									action === 'move' &&
									points.length > 1 &&
									shape
								) {
									const shapeR = history.current.find(
										(item) => item.id === shape.id,
									)
									// 更新矩形区域大小，在这更新减少在绘制过程中的计算导致的性能消耗
									const isGrow = hitSpriteGrow(
										points[0][0],
										points[0][1],
									)
									const disX =
										points[points.length - 1][0] -
										points[0][0]
									const disY =
										points[points.length - 1][1] -
										points[0][1]
									const {
										newLeft,
										newTop,
										newScaleX,
										newScaleY,
										newFlipX,
										newFlipY,
									} = genShapePosition({
										isGrow,
										disX,
										disY,
										top: shapeR.top,
										left: shapeR.left,
										width: shapeR.width,
										height: shapeR.height,
										scaleX: shapeR.scaleX,
										scaleY: shapeR.scaleY,
										flipX: shapeR.flipX,
										flipY: shapeR.flipY,
									})
									shapeR.left = newLeft
									shapeR.top = newTop
									shapeR.scaleX = newScaleX
									shapeR.scaleY = newScaleY
									shapeR.flipX = newFlipX
									shapeR.flipY = newFlipY
									// console.log(shape)
									reRender()
								}
								// 更新坐标系
								if (action === 'moveCanvas') {
									const disX =
										points[points.length - 1][0] -
										points[0][0]
									const disY =
										points[points.length - 1][1] -
										points[0][1]
									const cp = getVertex(
										maxWidth,
										maxHeight,
										width,
										height,
										axisOrigin.current[0] + disX,
										axisOrigin.current[1] + disY,
									)
									axisOrigin.current[0] = cp[0]
									axisOrigin.current[1] = cp[1]
									reRender()
								}
								// 回调数据结果
								if (onChange) {
									onChange(history.current)
								}
							}),
						),
					),
				)
			}),
		)
		const sub = source.subscribe((context: { shape: any; points: any }) => {
			const { shape, points = [] } = context
			if (points.length < 0) {
				return
			}
			// 复制一份数据进行处理
			const cloneShape = JSON.parse(JSON.stringify(shape))
			const disX = points[points.length - 1][0] - points[0][0]
			const disY = points[points.length - 1][1] - points[0][1]
			// 检测是否是新建动作
			if ((action === 'rect' || action === 'circle') && shape) {
				const ctx = outerContainer.current.getContext('2d')
				ctx.clearRect(0, 0, width, height)
				const left = Math.min(shape.left, points[points.length - 1][0])
				const top = Math.min(shape.top, points[points.length - 1][1])
				const widthR = Math.abs(
					points[points.length - 1][0] - shape.left,
				)
				const heightR = Math.abs(
					points[points.length - 1][1] - shape.top,
				)
				// 更新信息
				cloneShape.left = left
				cloneShape.top = top
				cloneShape.width = widthR
				cloneShape.height = heightR
				drawAction.draw(ctx, cloneShape)
			}
			// 移动
			if (action === 'move' && shape) {
				// 计算新的位置
				const isGrow = hitSpriteGrow(points[0][0], points[0][1])
				const {
					newLeft,
					newTop,
					newScaleX,
					newScaleY,
					newFlipX,
					newFlipY,
				} = genShapePosition({
					isGrow,
					disX,
					disY,
					top: shape.top,
					left: shape.left,
					width: shape.width,
					height: shape.height,
					scaleX: shape.scaleX,
					scaleY: shape.scaleY,
					flipX: shape.flipX,
					flipY: shape.flipY,
				})
				cloneShape.left = newLeft
				cloneShape.top = newTop
				cloneShape.scaleX = newScaleX
				cloneShape.scaleY = newScaleY
				cloneShape.flipX = newFlipX
				cloneShape.flipY = newFlipY
				drawShapeWidthControl(cloneShape)
			}
			// 更新坐标系
			if (action === 'moveCanvas') {
				const axisOriginClone = JSON.parse(
					JSON.stringify(axisOrigin.current),
				)
				const cp = getVertex(
					maxWidth,
					maxHeight,
					width,
					height,
					axisOriginClone[0] + disX,
					axisOriginClone[1] + disY,
				)
				axisOriginClone[0] = cp[0]
				axisOriginClone[1] = cp[1]
				reRender(null, axisOriginClone)
			}
		})
		// 注册滑动手势变化流，放到上面流
		let source2 = merge($mousemove, $touchmove).pipe(map((event) => event))
		const sub2 = source2.subscribe((position: { x: number; y: number }) => {
			if (currentShapeId.current) {
				const sl = hitSprite(position.x, position.y)
				if (sl.length > 0) {
					const isGrow = hitSpriteGrow(position.x, position.y)
					if (isGrow) {
						outerContainer.current.style.cursor = CURSOR[isGrow]
					} else {
						outerContainer.current.style.cursor = CURSOR['move']
					}
				} else {
					outerContainer.current.style.cursor = CURSOR['default']
				}
			}
		})
		return function cleanup() {
			sub.unsubscribe()
			sub2.unsubscribe()
			source = null
			source2 = null
		}
	}, [action])
	return (
		<div
			className={styles.stage}
			style={{ height, width, background: 'transparent', ...style }}
		>
			<img src={imgUrl} alt="底图" />
			<canvas ref={innerContainer} height={height} width={width} />
			<canvas ref={outerContainer} height={height} width={width} />
		</div>
	)
}

export default Stage
