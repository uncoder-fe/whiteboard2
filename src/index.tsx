import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import { merge, fromEvent } from 'rxjs';
import { tap, map, switchMap, takeUntil, skipWhile } from 'rxjs/operators';
import { RECTSIZE, CURSOR } from './common/enum';
import plugins from './plugins';
import { genShapePosition, getAngle, getRotateAngle2, shapeToBase64 } from './util';
import { StageProps } from './interface';

import styles from './index.less';
// 主台
function Stage(props: StageProps) {
	const { onChange, height, width, style = {}, plugin = [], initHistory = [], helpLine = false } = props;
	const [action, setAction] = useState('');
	// 原始坐标系，viewport
	const axisOrigin = useRef([0, 0]);
	// 存储记录
	const history = useRef([]);
	// canvas的ref
	const outerContainer = useRef(null);
	const innerContainer = useRef(null);
	// 当前选中的shape
	const currentShapeId = useRef(null);
	// 辅助线
	const drawHelpAxis = (ctx, x, y) => {
		ctx.save();
		ctx.setLineDash([8, 18]);
		ctx.strokeStyle = '#5fea19';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(x + width / 2, y);
		ctx.lineTo(x + width / 2, y + height);
		ctx.moveTo(x, height / 2 + y);
		ctx.lineTo(x + width, height / 2 + y);
		ctx.stroke();
		ctx.strokeRect(x, y, width, height);
		ctx.fillText('(0,0)', x, y + 10);
		ctx.restore();
	};
	// 检测是否命中精灵
	const hitSprite = (ox, oy) => {
		const x = ox - axisOrigin.current[0];
		const y = oy - axisOrigin.current[1];
		const hitArry = history.current.filter((item) => {
			const { left, top, width, height, scaleX, scaleY, offsetX = 0, offsetY = 0 } = item;
			if (
				left - RECTSIZE + offsetX < x &&
				x < left + width * scaleX + RECTSIZE * 2 + offsetX &&
				top - RECTSIZE + offsetY < y &&
				y < top + height * scaleY + RECTSIZE * 2 + offsetY
			) {
				// 当是框的时候，检测区域增加RECTSIZE的大小，因为要计算拖拽的圆圈
				return true;
			}
			return false;
		});
		return hitArry;
	};
	// 检测命中放大/缩小区域
	const hitSpriteGrow = (ox, oy) => {
		const x = ox - axisOrigin.current[0];
		const y = oy - axisOrigin.current[1];
		const findShape = history.current.find((item) => item.id === currentShapeId.current);
		if (!findShape) return null;
		const { left, top, width, height, scaleX, scaleY, offsetX, offsetY } = findShape;
		if (
			left + (width * scaleX) / 2 - RECTSIZE / 2 + offsetX < x &&
			x < left + (width * scaleX) / 2 + RECTSIZE / 2 + offsetX &&
			top - RECTSIZE / 2 - 70 < y &&
			y < top + RECTSIZE / 2 - 70
		) {
			// 旋转
			return 'rotateCenter';
		}
		if (
			left + (width * scaleX) / 2 - RECTSIZE / 2 + offsetX < x &&
			x < left + (width * scaleX) / 2 + RECTSIZE / 2 + offsetX &&
			top - RECTSIZE / 2 + offsetY < y &&
			y < top + RECTSIZE / 2 + offsetY
		) {
			// 上中(1)
			return 'topCenter';
		}
		if (
			left + width * scaleX - RECTSIZE / 2 + offsetX < x &&
			x < left + width * scaleX + RECTSIZE / 2 + offsetX &&
			top - RECTSIZE / 2 + offsetY < y &&
			y < top + RECTSIZE / 2 + offsetY
		) {
			// 右上(2)
			return 'rightTop';
		}
		if (
			left + width * scaleX - RECTSIZE / 2 + offsetX < x &&
			x < left + width * scaleX + RECTSIZE / 2 + offsetX &&
			top + (height * scaleY) / 2 - RECTSIZE / 2 + offsetY < y &&
			y < top + (height * scaleY) / 2 + RECTSIZE / 2 + offsetY
		) {
			// 右中(3)
			return 'rightCenter';
		}
		if (
			left + width * scaleX - RECTSIZE / 2 + offsetX < x &&
			x < left + width * scaleX + RECTSIZE / 2 + offsetX &&
			top + height * scaleY - RECTSIZE / 2 + offsetY < y &&
			y < top + height * scaleY + RECTSIZE / 2 + offsetY
		) {
			// 右下(4)
			return 'rightBottom';
		}
		if (
			left + (width * scaleX) / 2 - RECTSIZE / 2 + offsetX < x &&
			x < left + (width * scaleX) / 2 + RECTSIZE / 2 + offsetX &&
			top + height * scaleY - RECTSIZE / 2 + offsetY < y &&
			y < top + height * scaleY + RECTSIZE / 2 + offsetY
		) {
			// 下中(5)
			return 'bottomCenter';
		}
		if (
			left - RECTSIZE / 2 + offsetX < x &&
			x < left + RECTSIZE / 2 + offsetX &&
			top + height * scaleY - RECTSIZE / 2 + offsetY < y &&
			y < top + height * scaleY + RECTSIZE / 2 + offsetY
		) {
			// 左下(6)
			return 'leftBottom';
		}
		if (
			left - RECTSIZE / 2 + offsetX < x &&
			x < left + RECTSIZE / 2 + offsetX &&
			top + (height * scaleY) / 2 - RECTSIZE / 2 + offsetY < y &&
			y < top + (height * scaleY) / 2 + RECTSIZE / 2 + offsetY
		) {
			// 左中(7)
			return 'leftCenter';
		}
		if (
			left - RECTSIZE / 2 + offsetX < x &&
			x < left + RECTSIZE / 2 + offsetX &&
			top - RECTSIZE / 2 + offsetY < y &&
			y < top + RECTSIZE / 2 + offsetY
		) {
			// 左上(8)
			return 'leftTop';
		}
		return null;
	};
	// 重新渲染
	const reRender = (newAxis?: [number, number]) => {
		const list = history.current;
		const ctx = innerContainer.current.getContext('2d');
		const ox = newAxis ? newAxis[0] : axisOrigin.current[0];
		const oy = newAxis ? newAxis[1] : axisOrigin.current[1];
		ctx.save();
		// 设定坐标系
		ctx.setTransform(1, 0, 0, 1, ox, oy);
		// 清空画布
		ctx.clearRect(-ox, -oy, width, height);
		// 辅助线绘制
		if (helpLine) drawHelpAxis(ctx, 0, 0);
		// 重新渲染所有精灵
		for (let i = 0; i < list.length; i++) {
			const { id, type, base64 } = list[i];
			if (id === currentShapeId.current) continue;
			// 检测是否是新建动作，更新shape的路径信息
			const drawAction = plugins.find((item) => item.action === type);
			drawAction.draw(ctx, list[i]);
			// 在内存中加载图像数据
			if (['line', 'pencil'].includes(type)) {
				let image = document.getElementById(`${id}`) as any;
				if (!image && base64) {
					image = new Image();
					image.src = base64;
					image.setAttribute('id', id);
					document.querySelector('#cache-images').appendChild(image);
				}
			}
		}
		ctx.restore();
	};
	// 渲染六角定位点
	const drawShapeWithControl = (shape) => {
		const ctx = outerContainer.current.getContext('2d');
		ctx.save();
		ctx.setTransform(1, 0, 0, 1, axisOrigin.current[0], axisOrigin.current[1]);
		ctx.clearRect(-axisOrigin.current[0], -axisOrigin.current[1], width, height);
		// 检测是否是新建动作，更新shape的路径信息
		const drawAction = plugins.find((item) => item.action === shape.type);
		drawAction.draw(ctx, shape);
		// 绘制轮廓
		const { left, top, width: widthR, height: heightR, scaleX, scaleY, offsetX = 0, offsetY = 0 } = shape;
		ctx.fillStyle = 'rgba(255,125,113,0.2)';
		ctx.fillRect(
			left - RECTSIZE + offsetX,
			top - RECTSIZE + offsetY,
			widthR * scaleX + RECTSIZE * 2,
			heightR * scaleY + RECTSIZE * 2,
		);
		ctx.fillStyle = 'yellow';
		ctx.beginPath();
		// 旋转按钮
		ctx.fillRect(
			left + (widthR * scaleX) / 2 - RECTSIZE / 2 + offsetX,
			top - RECTSIZE / 2 - 70 + offsetY,
			RECTSIZE,
			RECTSIZE,
		);
		// 上中(1)
		ctx.fillRect(
			left + (widthR * scaleX) / 2 - RECTSIZE / 2 + offsetX,
			top - RECTSIZE / 2 + offsetY,
			RECTSIZE,
			RECTSIZE,
		);
		ctx.closePath();
		// 右上(2)
		ctx.fillRect(widthR * scaleX + left - RECTSIZE / 2 + offsetX, top - RECTSIZE / 2 + offsetY, RECTSIZE, RECTSIZE);
		ctx.closePath();
		// 右中(3)
		ctx.fillRect(
			left + widthR * scaleX - RECTSIZE / 2 + offsetX,
			top + (heightR * scaleY) / 2 - RECTSIZE / 2 + offsetY,
			RECTSIZE,
			RECTSIZE,
		);
		ctx.closePath();
		// 右下(4)
		ctx.fillRect(
			left + widthR * scaleX - RECTSIZE / 2 + offsetX,
			top + heightR * scaleY - RECTSIZE / 2 + offsetY,
			RECTSIZE,
			RECTSIZE,
		);
		ctx.closePath();
		// 下中(5)
		ctx.fillRect(
			left + (widthR * scaleX) / 2 - RECTSIZE / 2 + offsetX,
			top + heightR * scaleY - RECTSIZE / 2 + offsetY,
			RECTSIZE,
			RECTSIZE,
		);
		ctx.closePath();
		// 左下(6)
		ctx.fillRect(
			left - RECTSIZE / 2 + offsetX,
			top + heightR * scaleY - RECTSIZE / 2 + offsetY,
			RECTSIZE,
			RECTSIZE,
		);
		ctx.closePath();
		// 左中(7)
		ctx.fillRect(
			left - RECTSIZE / 2 + offsetX,
			top + (heightR * scaleY) / 2 - RECTSIZE / 2 + offsetY,
			RECTSIZE,
			RECTSIZE,
		);
		ctx.closePath();
		// 左上(8)
		ctx.fillRect(left - RECTSIZE / 2 + offsetX, top - RECTSIZE / 2 + offsetY, RECTSIZE, RECTSIZE);
		ctx.closePath();
		ctx.restore();
	};
	// 注册清空事件
	const clean = () => {
		history.current = [];
		// 重绘，顺便清空
		reRender();
		// 手动清空outerCanvas
		const ctxOuter = outerContainer.current.getContext('2d');
		ctxOuter.setTransform(1, 0, 0, 1, axisOrigin.current[0], axisOrigin.current[1]);
		ctxOuter.clearRect(-axisOrigin.current[0], -axisOrigin.current[1], width, height);
		// 回调数据结果
		if (onChange) onChange([]);
	};
	// 注册放大/缩小事件
	const scale = (type) => {
		if (!currentShapeId.current) return;
		const shape = history.current.find((item) => item.id === currentShapeId.current);
		if (shape.scaleX < 0.5 && type !== 'enlarge') return;
		const ctx = outerContainer.current.getContext('2d');
		ctx.clearRect(0, 0, width, height);
		const scaleFactor = 0.1;
		shape.scaleX = shape.scaleX + (type === 'enlarge' ? 1 : -1) * scaleFactor;
		shape.scaleY = shape.scaleY + (type === 'enlarge' ? 1 : -1) * scaleFactor * (shape.scaleY / shape.scaleX);
		shape.left = shape.left + ((type === 'enlarge' ? -1 : 1) * (scaleFactor * shape.width)) / 2;
		shape.top =
			shape.top +
			((type === 'enlarge' ? -1 : 1) * (scaleFactor * (shape.scaleY / shape.scaleX) * shape.height)) / 2;
		drawShapeWithControl(shape);
		reRender();
		// 回调数据结果
		if (onChange && history.current.length) onChange(history.current);
	};
	useImperativeHandle(props.forwardedRef, () => ({
		clean,
		scale,
		selectAction: (nextAction) => setAction(nextAction),
	}));
	// 初始化
	useEffect(() => {
		if (initHistory.length > 0) {
			history.current = [...initHistory];
		}
		reRender();
	}, []);
	// 核心事件流
	useEffect(() => {
		if (['rect', 'circle', 'moveCanvas'].includes(action)) {
			// 切换为绘图模式时，清空
			currentShapeId.current = null;
			const ctx = outerContainer.current.getContext('2d');
			ctx.clearRect(0, 0, width, height);
			reRender();
		}
		// 设置事件能穿透到下面的元素
		if (action && action != 'hand') {
			// 注意Safari不支持bounding-box`
			outerContainer.current.parentNode.style.pointerEvents = 'bounding-box';
		} else {
			outerContainer.current.parentNode.style.pointerEvents = 'none';
		}
		// 检测是否是新建动作，更新shape的路径信息
		const drawAction = plugins.find((item) => item.action === action);
		// 鼠标和触控事件合并
		const $mousedown = fromEvent(outerContainer.current, 'mousedown').pipe(
			map((event: any) => {
				event.preventDefault();
				return {
					x: event.offsetX,
					y: event.offsetY,
					target: event.target,
				};
			}),
		);
		const $mousemove = fromEvent(outerContainer.current, 'mousemove').pipe(
			map((event: any) => {
				event.preventDefault();
				return {
					x: event.offsetX,
					y: event.offsetY,
					target: event.target,
				};
			}),
		);
		const $mouseup = fromEvent(window, 'mouseup');
		const $touchstart = fromEvent(outerContainer.current, 'touchstart').pipe(
			skipWhile((event: any) => event.touches.length >= 2),
			map((event: any) => {
				event.preventDefault();
				const { clientX, clientY, target } = event.changedTouches[0];
				const { top, left } = outerContainer.current.getBoundingClientRect();
				return {
					x: clientX - left,
					y: clientY - top,
					target,
				};
			}),
		);
		const $touchmove = fromEvent(outerContainer.current, 'touchmove').pipe(
			skipWhile((event: any) => event.touches.length >= 2),
			map((event: any) => {
				event.preventDefault();
				const { clientX, clientY, target } = event.changedTouches[0];
				const { top, left } = outerContainer.current.getBoundingClientRect();
				return {
					x: clientX - left,
					y: clientY - top,
					target,
				};
			}),
		);
		const $touchend = fromEvent(window, 'touchend');
		// 注册点击事件流
		let source = merge($mousedown, $touchstart).pipe(
			map((event: { x: number; y: number }) => {
				let shape = null;
				// 检测是否是新建动作
				if (['circle', 'rect', 'line', 'pencil'].includes(action)) {
					shape = {
						id: Math.random().toString(36).slice(2),
						type: action,
						points: [],
						left: event.x,
						top: event.y,
						width: 0,
						height: 0,
						offsetX: 0,
						offsetY: 0,
						scaleX: 1,
						scaleY: 1,
						flipX: false,
						flipY: false,
						rotate: 0,
						base64: '',
					};
				}
				// 移动
				if (action === 'move') {
					// 存在高亮，判定是不是缩放区域
					const isGrow = hitSpriteGrow(event.x, event.y);
					if (isGrow) {
						const currentShape = history.current.find((item) => item.id === currentShapeId.current);
						shape = JSON.parse(JSON.stringify(currentShape));
					} else {
						// 重新寻找新shape
						const hitArry = hitSprite(event.x, event.y);
						if (hitArry.length > 0) {
							// 命中的是同一个
							if (hitArry.some((item) => item.id === currentShapeId.current)) {
								const currentShape = history.current.find((item) => item.id === currentShapeId.current);
								shape = JSON.parse(JSON.stringify(currentShape));
							} else {
								// 命中的是非当前已存在的，取最后一个
								shape = JSON.parse(JSON.stringify(hitArry[hitArry.length - 1]));
							}
						}
					}
					if (shape) {
						currentShapeId.current = shape.id;
						// 从真实区域删除这个shape的渲染
						reRender();
						// 把这个shape渲染到事件屏操作
						drawShapeWithControl(shape);
					}
				}
				return [event.x, event.y, shape];
			}),
			switchMap(([startX, startY, shape]) => {
				// 存储从落下到移动的所有点
				let points = [];
				if (action) {
					points.push([startX, startY]);
				}
				return merge($mousemove, $touchmove).pipe(
					map((event: { x: number; y: number }) => {
						const { x: moveX, y: moveY } = event;
						points.push([moveX, moveY]);
						return { points, shape };
					}),
					takeUntil(
						merge($mouseup, $touchend).pipe(
							tap(() => {
								// 检测是否是新建动作，更新shape坐标和大小信息
								if (['rect', 'circle', 'line', 'pencil'].includes(action) && shape) {
									// 更新矩形区域大小，在此处更新减少在绘制过程中的计算导致的性能消耗
									let left = Math.min(shape.left, points[points.length - 1][0]);
									let top = Math.min(shape.top, points[points.length - 1][1]);
									let widthR = Math.abs(points[points.length - 1][0] - shape.left);
									let heightR = Math.abs(points[points.length - 1][1] - shape.top);
									if (action === 'pencil') {
										// 铅笔的话，大小，左上角顶点特殊处理
										left = Math.min(...points.map((point) => point[0]));
										top = Math.min(...points.map((point) => point[1]));
										const right = Math.max(...points.map((point) => point[1]));
										const bottom = Math.max(...points.map((point) => point[1]));
										widthR = Math.abs(right - left);
										heightR = Math.abs(bottom - top);
									}
									shape.left = left - axisOrigin.current[0];
									shape.top = top - axisOrigin.current[1];
									shape.width = widthR;
									shape.height = heightR;
									shape.points = points;
									if (['line', 'pencil'].includes(action)) {
										shape.base64 = shapeToBase64(shape);
									}
									// 清空事件屏
									const ctx = outerContainer.current.getContext('2d');
									ctx.clearRect(0, 0, width, height);
									// 更新历史
									history.current = [...history.current, shape];
									// 绘制到真实区域
									reRender();
								}
								// 移动
								if (action === 'move' && points.length > 1 && shape) {
									const shapeR = history.current.find((item) => item.id === shape.id);
									// 更新矩形区域大小，在此处更新减少在绘制过程中的计算导致的性能消耗
									const isGrow = hitSpriteGrow(points[0][0], points[0][1]);
									const disX = points[points.length - 1][0] - points[0][0];
									const disY = points[points.length - 1][1] - points[0][1];
									const newShape = genShapePosition({
										isGrow,
										disX,
										disY,
										shape: shapeR,
									});
									// TODO：按照ID更新
									shapeR.left = newShape.left;
									shapeR.top = newShape.top;
									shapeR.scaleX = newShape.scaleX;
									shapeR.scaleY = newShape.scaleY;
									shapeR.flipX = newShape.flipX;
									shapeR.flipY = newShape.flipY;
									shapeR.offsetX = newShape.offsetX;
									shapeR.offsetY = newShape.offsetY;
									// console.log(shape)
									reRender();
								}
								// 更新坐标系
								if (action === 'moveCanvas') {
									const disX = points[points.length - 1][0] - points[0][0];
									const disY = points[points.length - 1][1] - points[0][1];
									axisOrigin.current[0] = axisOrigin.current[0] + disX;
									axisOrigin.current[1] = axisOrigin.current[1] + disY;
									reRender();
								}
								// 回调数据结果
								if (onChange && history.current.length) {
									onChange(history.current);
								}
							}),
						),
					),
				);
			}),
		);
		const sub = source.subscribe((context: { shape: any; points: any }) => {
			const { shape, points = [] } = context;
			if (points.length < 0) return;
			// 复制一份数据进行处理
			const cloneShape = JSON.parse(JSON.stringify(shape));
			const disX = points[points.length - 1][0] - points[0][0];
			const disY = points[points.length - 1][1] - points[0][1];
			// 检测是否是新建动作
			if (['rect', 'circle', 'line', 'pencil'].includes(action) && shape) {
				const ctx = outerContainer.current.getContext('2d');
				ctx.clearRect(0, 0, width, height);
				let left = Math.min(shape.left, points[points.length - 1][0]);
				let top = Math.min(shape.top, points[points.length - 1][1]);
				let widthR = Math.abs(points[points.length - 1][0] - shape.left);
				let heightR = Math.abs(points[points.length - 1][1] - shape.top);
				if (action === 'pencil') {
					// 铅笔的话，大小，左上角顶点特殊处理
					left = Math.min(...points.map((point) => point[0]));
					top = Math.min(...points.map((point) => point[1]));
					const right = Math.max(...points.map((point) => point[1]));
					const bottom = Math.max(...points.map((point) => point[1]));
					widthR = Math.abs(right - left);
					heightR = Math.abs(bottom - top);
				}
				// 更新信息
				cloneShape.left = left;
				cloneShape.top = top;
				cloneShape.width = widthR;
				cloneShape.height = heightR;
				cloneShape.points = points;
				try {
					drawAction.draw(ctx, cloneShape);
				} catch (error) {
					console.log(error);
				}
			}
			// 移动
			if (action === 'move' && shape) {
				// 计算新的位置
				const isGrow = hitSpriteGrow(points[0][0], points[0][1]);
				if (isGrow === 'rotateCenter') {
					const center = {
						x: shape.left + (shape.width * shape.scaleX) / 2,
						y: shape.top + (shape.height * shape.scaleY) / 2,
					};
					// 旋转
					const rotate = getRotateAngle2(center, {
						x: points[points.length - 1][0],
						y: points[points.length - 1][1],
					});
					cloneShape.rotate = rotate;
					drawShapeWithControl(cloneShape);
				} else {
					const newShape = genShapePosition({
						isGrow,
						disX,
						disY,
						shape,
					});
					cloneShape.left = newShape.left;
					cloneShape.top = newShape.top;
					cloneShape.scaleX = newShape.scaleX;
					cloneShape.scaleY = newShape.scaleY;
					cloneShape.flipX = newShape.flipX;
					cloneShape.flipY = newShape.flipY;
					cloneShape.offsetX = newShape.offsetX;
					cloneShape.offsetY = newShape.offsetY;
					drawShapeWithControl(cloneShape);
				}
			}
			// 更新坐标系
			if (action === 'moveCanvas') {
				const axisOriginTemp = JSON.parse(JSON.stringify(axisOrigin.current));
				axisOriginTemp[0] = axisOriginTemp[0] + disX;
				axisOriginTemp[1] = axisOriginTemp[1] + disY;
				reRender(axisOriginTemp);
			}
		});
		return function cleanup() {
			sub.unsubscribe();
			source = null;
		};
	}, [action]);
	return (
		<div className={styles.stage} style={{ height, width, background: 'transparent', ...style }}>
			<div style={{ display: 'none' }} id="cache-images"></div>
			<canvas ref={innerContainer} height={height} width={width} />
			<canvas ref={outerContainer} height={height} width={width} />
		</div>
	);
}
const WrappedComponent = forwardRef((props: StageProps, ref) => {
	return <Stage {...props} forwardedRef={ref} />;
});
export default WrappedComponent;
