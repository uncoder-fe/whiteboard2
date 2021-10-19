export function getAngle(startX, startY, moveX, moveY) {
	const RAD_DEG = Math.PI / 180;
	const dx = moveX - startX;
	const dy = moveY - startY;
	// Calculate rotation.
	const angle = Math.atan2(dx, dy) / RAD_DEG;
	const rotate = ((angle + 360) % 360) - 180;
	return { angle, rotate };
}

export function getRotateAngle(centerPoint, startPoint, endPoint) {
	const [centerX, centerY] = centerPoint;
	const [rotateStartX, rotateStartY] = startPoint;
	const [touchX, touchY] = endPoint;
	// 两个向量
	const v1 = [rotateStartX - centerX, rotateStartY - centerY];
	const v2 = [touchX - centerX, touchY - centerY];
	// 公式的分子
	const numerator = v1[0] * v2[1] - v1[1] * v2[0];
	// 公式的分母
	const denominator =
		Math.sqrt(Math.pow(v1[0], 2) + Math.pow(v1[1], 2)) * Math.sqrt(Math.pow(v2[0], 2) + Math.pow(v2[1], 2));
	const sin = numerator / denominator;
	return Math.asin(sin);
}

export function getRotateAngle2(center, end) {
	const r = Math.atan2(end.y - center.y, end.x - center.x) + Math.PI / 2;
	return r;
}

// 计算shape位置
export const genShapePosition = (ops) => {
	const { isGrow, disX, disY, shape } = ops;
	const { left, top, width, height, scaleX, scaleY, flipX, flipY, offsetX = 0, offsetY = 0, angle } = shape;
	let newLeft = left;
	let newTop = top;
	let newScaleX = scaleX;
	let newScaleY = scaleY;
	let newFlipX = flipX;
	let newFlipY = flipY;
	let newOffsetX = offsetX;
	let newOffsetY = offsetY;
	let increaseX = 0;
	let increaseY = 0;
	let newAngle = angle;
	if (isGrow && (disX !== 0 || disY !== 0)) {
		// 某一方向放大或者缩小
		increaseX = parseFloat((Math.abs(disX) / width).toFixed(4));
		increaseY = parseFloat((Math.abs(disY) / height).toFixed(4));
		switch (isGrow) {
			case 'rotateCenter':
				console.log('旋转');
				break;
			case 'topCenter':
				if (disY < 0) {
					// 增加
					newScaleY = scaleY + increaseY;
					newTop = top - height * increaseY;
				} else if (disY > 0 && disY < height * scaleY) {
					// 减少
					newScaleY = scaleY - increaseY;
					newTop = top + height * increaseY;
				} else if (disY > 0) {
					// 反向
					newScaleY = increaseY - scaleY;
					newTop = top + height * scaleY;
					newFlipY = !newFlipY;
				}
				break;
			case 'rightTop':
				if (disX > 0) {
					// 增加
					newScaleX = scaleX + increaseX;
					newScaleY = scaleY + (scaleY / scaleX) * increaseX;
					newTop = top - height * (scaleY / scaleX) * increaseX;
				} else if (disX < 0 && disX > -width * scaleX) {
					// 减小
					newScaleX = Math.abs(scaleX - increaseX);
					newScaleY = scaleY - (scaleY / scaleX) * increaseX;
					newTop = top + height * (scaleY / scaleX) * increaseX;
				} else if (disX < 0) {
					// 反向
					newScaleX = increaseX - scaleX;
					newScaleY = (scaleY / scaleX) * newScaleX;
					newLeft = left - width * newScaleX;
					newTop = top + height * scaleY;
					newFlipX = !newFlipX;
					newFlipY = !newFlipY;
				}
				break;
			case 'rightCenter':
				// 计算变化
				if (disX > 0) {
					// 增加
					newScaleX = scaleX + increaseX;
				} else if (disX < 0 && disX > -(width * scaleX)) {
					// 减少
					newScaleX = Math.abs(scaleX - increaseX);
				} else if (disX < 0) {
					// 反向
					newScaleX = increaseX - scaleX;
					newLeft = left - width * newScaleX;
					newFlipX = !newFlipX;
				}
				break;
			case 'rightBottom':
				if (disX > 0) {
					// 增加
					newScaleX = scaleX + increaseX;
					newScaleY = scaleY + (scaleY / scaleX) * increaseX;
				} else if (disX < 0 && disX > -width * scaleX) {
					// 减小
					newScaleX = Math.abs(scaleX - increaseX);
					newScaleY = scaleY - (scaleY / scaleX) * increaseX;
				} else if (disX < 0) {
					// 反向
					newScaleX = increaseX - scaleX;
					newScaleY = (scaleY / scaleX) * newScaleX;
					newLeft = left - width * newScaleX;
					newTop = top - height * newScaleY;
					newFlipX = !newFlipX;
					newFlipY = !newFlipY;
				}
				break;
			case 'bottomCenter':
				if (disY > 0) {
					// 增加
					newScaleY = scaleY + increaseY;
				} else if (disY < 0 && disY > -height * scaleY) {
					// 减小
					newScaleY = scaleY - increaseY;
				} else if (disY < 0) {
					// 反向
					newScaleY = increaseY - scaleY;
					newTop = top - height * newScaleY;
					newFlipY = !newFlipY;
				}
				break;
			case 'leftBottom':
				if (disX < 0) {
					// 增加
					newScaleX = scaleX + increaseX;
					newScaleY = scaleY + (scaleY / scaleX) * increaseX;
					newLeft = left - width * increaseX;
				} else if (disX > 0 && disX < width * scaleX) {
					// 减少
					newScaleX = Math.abs(scaleX - increaseX);
					newScaleY = scaleY - (scaleY / scaleX) * increaseX;
					newLeft = left + width * increaseX;
				} else if (disX > 0) {
					// 反向
					newScaleX = increaseX - scaleX;
					newScaleY = (scaleY / scaleX) * newScaleX;
					newLeft = left + width * scaleX;
					newTop = Math.abs(top - height * newScaleY);
					newFlipX = !newFlipX;
					newFlipY = !newFlipY;
				}
				break;
			case 'leftCenter':
				if (disX < 0) {
					// 增加
					newScaleX = scaleX + increaseX;
					newLeft = left - width * increaseX;
				} else if (disX > 0 && disX < width * scaleX) {
					// 减少
					newScaleX = Math.abs(scaleX - increaseX);
					newLeft = left + width * increaseX;
				} else if (disX > 0) {
					// 反向
					newScaleX = increaseX - scaleX;
					newLeft = left + width * scaleX;
					newFlipX = !newFlipX;
				}
				break;
			case 'leftTop':
				if (disX < 0) {
					// 增加
					newScaleX = scaleX + increaseX;
					newScaleY = scaleY + (scaleY / scaleX) * increaseX;
					newLeft = left - width * increaseX;
					newTop = top - height * (scaleY / scaleX) * increaseX;
				} else if (disX > 0 && disX < width * scaleX) {
					// 减少
					newScaleX = scaleX - increaseX;
					newScaleY = scaleY - (scaleY / scaleX) * increaseX;
					newLeft = left + width * increaseX;
					newTop = top + height * (scaleY / scaleX) * increaseX;
				} else if (disX > 0) {
					// 反向
					newScaleX = increaseX - scaleX;
					newScaleY = (scaleY / scaleX) * newScaleX;
					newLeft = left + width * scaleX;
					newTop = top + height * scaleY;
					newFlipX = !newFlipX;
					newFlipY = !newFlipY;
				}
				break;
			default:
				break;
		}
	} else {
		// 移动
		newOffsetX = offsetX + disX;
		newOffsetY = offsetY + disY;
	}
	return {
		left: newLeft,
		top: newTop,
		scaleX: newScaleX,
		scaleY: newScaleY,
		flipX: newFlipX,
		flipY: newFlipY,
		offsetX: newOffsetX,
		offsetY: newOffsetY,
	};
};

// shape转图片，坐标点转图片
export function pointsToBase64(shape) {
	const { points, height, width, type } = shape;
	const len = points.length;
	const padding = 0;
	// 这里脱离原shape的坐标，只为了找到原点（0，0），获取偏移量
	const left = Math.min(...points.map((point) => point[0])) || 0;
	const top = Math.min(...points.map((point) => point[1])) || 0;
	const offsetX = left - padding;
	const offsetY = top - padding;
	const canvas = document.createElement('canvas');
	canvas.setAttribute('width', `${width}px`);
	canvas.setAttribute('height', `${height}px`);
	const ctx = canvas.getContext('2d');
	// 填充透明背景
	ctx.fillStyle = 'rgba(255, 255, 255, 0)';
	// 线条颜色
	ctx.strokeStyle = 'black';
	ctx.lineWidth = 2;
	ctx.lineCap = 'round';
	ctx.beginPath();
	if (type === 'line') {
		ctx.moveTo(points[0][0] - offsetX, points[0][1] - offsetY);
		ctx.lineTo(points[len - 1][0] - offsetX, points[len - 1][1] - offsetY);
	} else {
		for (let i = 0; i < len; i++) {
			const start = points[i];
			const end = points[i + 1];
			if (end) {
				ctx.moveTo(start[0] - offsetX, start[1] - offsetY);
				ctx.lineTo(end[0] - offsetX, end[1] - offsetY);
			}
		}
	}
	ctx.closePath();
	ctx.stroke();
	const base64 = canvas.toDataURL('image/png', 1.0);
	// console.log('base64', base64);
	return base64;
}
