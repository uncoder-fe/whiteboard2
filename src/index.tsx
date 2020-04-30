import React, { useEffect, useRef } from 'react'
import { merge, fromEvent } from 'rxjs'
import { tap, map, switchMap, takeUntil, skipWhile } from 'rxjs/operators'
import { StageProps } from './interface'

import styles from './index.less'

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
	} = props
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
	const hitSprite = (x, y) => {
		const hitArry = history.current.filter((item) => {
			const { left, top, width, height } = item
			if (
				left - rectSize < x &&
				x < left + width + rectSize * 2 &&
				top - rectSize < y &&
				y < top + height + rectSize * 2
			) {
				// 当是框的时候，检测区域增加rectSize的大小，因为要计算拖拽的圆圈
				return true
			}
			return false
		})
		return hitArry
	}
	// 检测命中放大区域
	const hitSpriteGrow = (x, y) => {
		const { left, top, width, height } = history.current.find(
			(item) => item.id === currentShapeId.current,
		)
		if (
			left + width / 2 - rectSize / 2 < x &&
			x < left + width / 2 + rectSize / 2 &&
			top - rectSize / 2 < y &&
			y < top + rectSize / 2
		) {
			// 上中(1)
			return 'topCenter'
		}
		if (
			left + width - rectSize / 2 < x &&
			x < left + width + rectSize / 2 &&
			top - rectSize / 2 < y &&
			y < top + rectSize / 2
		) {
			// 右上(2)
			return 'rightTop'
		}
		if (
			left + width - rectSize / 2 < x &&
			x < left + width + rectSize / 2 &&
			top + height / 2 - rectSize / 2 < y &&
			y < top + height / 2 + rectSize / 2
		) {
			// 右中(3)
			return 'rightCenter'
		}
		if (
			left + width - rectSize / 2 < x &&
			x < left + width + rectSize / 2 &&
			top + height - rectSize / 2 < y &&
			y < top + height + rectSize / 2
		) {
			// 右下(4)
			return 'rightBottom'
		}
		if (
			left + width / 2 - rectSize / 2 < x &&
			x < left + width / 2 + rectSize / 2 &&
			top + height - rectSize / 2 < y &&
			y < top + height + rectSize / 2
		) {
			// 下中(5)
			return 'bottomCenter'
		}
		if (
			left - rectSize / 2 < x &&
			x < left + rectSize / 2 &&
			top + height - rectSize / 2 < y &&
			y < top + height + rectSize / 2
		) {
			// 左下(6)
			return 'leftBottom'
		}
		if (
			left - rectSize / 2 < x &&
			x < left + rectSize / 2 &&
			top + height / 2 - rectSize / 2 < y &&
			y < top + height / 2 + rectSize / 2
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
	const reRender = (arr?: []) => {
		const list = arr || history.current
		const ctx = innerContainer.current.getContext('2d')
		ctx.clearRect(0, 0, width, height)
		for (let i = 0; i < list.length; i++) {
			const { id, type } = list[i]
			if (id === currentShapeId.current) {
				continue
			}
			// 检测是否是新建动作，更新shape的路径信息
			const drawAction = allPlugins.find((item) => item.action === type)
			drawAction.draw(ctx, list[i])
		}
	}
	// 渲染轮廓
	const drawShapeWidthControl = (shape) => {
		const ctx = outerContainer.current.getContext('2d')
		ctx.clearRect(0, 0, width, height)
		// 检测是否是新建动作，更新shape的路径信息
		const drawAction = allPlugins.find((item) => item.action === shape.type)
		drawAction.draw(ctx, shape)
		// 绘制轮廓
		const { left, top, width: widthR, height: heightR } = shape
		ctx.fillStyle = 'rgba(255,125,113,0.2)'
		ctx.fillRect(
			left - rectSize,
			top - rectSize,
			widthR + rectSize * 2,
			heightR + rectSize * 2,
		)
		ctx.fillStyle = 'yellow'
		ctx.beginPath()
		// 上中(1)
		ctx.fillRect(
			left + widthR / 2 - rectSize / 2,
			top - rectSize / 2,
			rectSize,
			rectSize,
		)
		ctx.closePath()
		// 右上(2)
		ctx.fillRect(
			widthR + left - rectSize / 2,
			top - rectSize / 2,
			rectSize,
			rectSize,
		)
		ctx.closePath()
		// 右中(3)
		ctx.fillRect(
			left + widthR - rectSize / 2,
			top + heightR / 2 - rectSize / 2,
			rectSize,
			rectSize,
		)
		ctx.closePath()
		// 右下(4)
		ctx.fillRect(
			left + widthR - rectSize / 2,
			top + heightR - rectSize / 2,
			rectSize,
			rectSize,
		)
		ctx.closePath()
		// 下中(5)
		ctx.fillRect(
			left + widthR / 2 - rectSize / 2,
			top + heightR - rectSize / 2,
			rectSize,
			rectSize,
		)
		ctx.closePath()
		// 左下(6)
		ctx.fillRect(
			left - rectSize / 2,
			top + heightR - rectSize / 2,
			rectSize,
			rectSize,
		)
		ctx.closePath()
		// 左中(7)
		ctx.fillRect(
			left - rectSize / 2,
			top + heightR / 2 - rectSize / 2,
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
	}
	// 计算位置
	const genPosition = (ops) => {
		const { isGrow, disX, disY, top, left, width, height } = ops
		const disXY = disX * (height / width)
		let newLeft = left
		let newTop = top
		let newWidth = width
		let newHeight = height
		if (isGrow) {
			// 某一方向放大或者缩小
			switch (isGrow) {
				case 'topCenter':
					newTop = top + disY
					newHeight = height - disY
					if (newHeight < 0) {
						// 反向运动
						newTop = top + height
						newHeight = Math.abs(newHeight)
					}
					break
				case 'rightTop':
					newTop = top - disXY
					newWidth = width + disX
					newHeight = height + disXY
					if (newHeight < 0) {
						// 反向运动
						newTop = top + height
						newHeight = Math.abs(newHeight)
					}
					if (newWidth < 0) {
						// 反向运动
						newLeft = left + newWidth
						newWidth = Math.abs(newWidth)
					}
					break
				case 'rightCenter':
					newWidth = width + disX
					if (newWidth < 0) {
						// 反向运动
						newLeft = left + newWidth
						newWidth = Math.abs(newWidth)
					}
					break
				case 'rightBottom':
					newWidth = width + disX
					newHeight = height + disX
					if (newWidth < 0) {
						// 反向运动
						newLeft = left + newWidth
						newWidth = Math.abs(newWidth)
					}
					if (newHeight < 0) {
						// 反向运动
						newTop = top + newHeight
						newHeight = Math.abs(newHeight)
					}
					break
				case 'bottomCenter':
					newHeight = height + disY
					if (newHeight < 0) {
						// 反向运动
						newTop = top + newHeight
						newHeight = Math.abs(newHeight)
					}
					break
				case 'leftBottom':
					newLeft = left + disX
					newWidth = width - disX
					newHeight = height - disX
					if (newHeight < 0) {
						// 反向运动
						newTop = top + newHeight
						newHeight = Math.abs(newHeight)
					}
					if (newWidth < 0) {
						// 反向运动
						newLeft = left + width
						newWidth = Math.abs(newWidth)
					}
					break
				case 'leftCenter':
					newLeft = left + disX
					newWidth = width - disX
					if (newWidth < 0) {
						// 反向运动
						newLeft = left + width
						newWidth = Math.abs(newWidth)
					}
					break
				case 'leftTop':
					newLeft = left + disX
					newTop = top + disX
					newWidth = width - disX
					newHeight = height - disX
					if (newWidth < 0) {
						// 反向运动
						newLeft = left + width
						newWidth = Math.abs(newWidth)
					}
					if (newHeight < 0) {
						// 反向运动
						newTop = top + height
						newHeight = Math.abs(newHeight)
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
		return { newLeft, newTop, newWidth, newHeight }
	}
	// 注册清空事件
	const clear = () => {
		history.current = []
		// 回调数据结果
		if (onChange) {
			onChange([])
		}
	}
	// 注册主动获取数据
	const getData = () => {
		return history
	}
	// 注册缩放事件
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
	}
	// 初始化
	useEffect(() => {
		if (getRef) {
			getRef({ clear, getData, scale })
		}
		if (initHistory.length > 0) {
			history.current = [...initHistory]
			reRender()
		}
	}, [])
	// 核心事件流
	useEffect(() => {
		if (action === 'rect' || action === 'circle') {
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
					}
				}
				// 移动
				if (action === 'move') {
					if (currentShapeId.current) {
						// 存在高亮
						const isGrow = hitSpriteGrow(event.x, event.y)
						if (isGrow) {
							const r = history.current.find(
								(item) => item.id === currentShapeId.current,
							)
							shape = JSON.parse(JSON.stringify(r))
						} else {
							// 寻找shape
							const hitArry = hitSprite(event.x, event.y)
							if (hitArry.length > 0) {
								shape = JSON.parse(
									JSON.stringify(hitArry[hitArry.length - 1]),
								)
							}
						}
					} else {
						// 寻找shape
						const hitArry = hitSprite(event.x, event.y)
						if (hitArry.length > 0) {
							shape = JSON.parse(
								JSON.stringify(hitArry[hitArry.length - 1]),
							)
						}
					}
					if (shape) {
						currentShapeId.current = shape.id
						// 从真实区域删除这个shape
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
								if (!shape) {
									return
								}
								// 检测是否是新建动作，更新shape坐标和大小信息
								if (action === 'rect' || action === 'circle') {
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
									shape.left = left
									shape.top = top
									shape.width = widthR
									shape.height = heightR
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
									// 回调数据结果
									if (onChange) {
										onChange(history.current)
									}
								}
								// 移动
								if (action === 'move' && points.length > 1) {
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
										newWidth,
										newHeight,
									} = genPosition({
										isGrow,
										disX,
										disY,
										top: shapeR.top,
										left: shapeR.left,
										width: shapeR.width,
										height: shapeR.height,
									})
									shapeR.left = newLeft
									shapeR.top = newTop
									shapeR.width = newWidth
									shapeR.height = newHeight
									// console.log(shape)
									reRender()
									// 回调数据结果
									if (onChange) {
										onChange(history)
									}
								}
							}),
						),
					),
				)
			}),
		)
		const sub = source.subscribe((context: { shape: any; points: any }) => {
			const { shape, points = [] } = context
			if (points.length < 0 || !shape) {
				return
			}
			// 复制一份数据进行处理
			const cloneShape = JSON.parse(JSON.stringify(shape))
			// 检测是否是新建动作
			if (action === 'rect' || action === 'circle') {
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
			} else if (action === 'move') {
				// 计算新的位置
				const isGrow = hitSpriteGrow(points[0][0], points[0][1])
				const disX = points[points.length - 1][0] - points[0][0]
				const disY = points[points.length - 1][1] - points[0][1]
				const { newLeft, newTop, newWidth, newHeight } = genPosition({
					isGrow,
					disX,
					disY,
					top: shape.top,
					left: shape.left,
					width: shape.width,
					height: shape.height,
				})
				cloneShape.left = newLeft
				cloneShape.top = newTop
				cloneShape.width = newWidth
				cloneShape.height = newHeight
				drawShapeWidthControl(cloneShape)
			}
		})
		// 注册滑动手势变化流
		let source2 = merge($mousemove, $touchmove).pipe(map((event) => event))
		const sub2 = source2.subscribe((position: { x: number; y: number }) => {
			if (currentShapeId.current) {
				const sl = hitSprite(position.x, position.y)
				if (sl.length > 0) {
					const pointer = hitSpriteGrow(position.x, position.y)
					if (pointer) {
						outerContainer.current.style.cursor = CURSOR[pointer]
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
