// 默认插件
export const defaultPlugin = [
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
			ctx.beginPath();
			ctx.moveTo();
			ctx.stroke();
			// ctx.fill()
			ctx.restore();
		},
	},
];

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
		Math.sqrt(Math.pow(v1[0], 2) + Math.pow(v1[1], 2)) *
		Math.sqrt(Math.pow(v2[0], 2) + Math.pow(v2[1], 2));
	const sin = numerator / denominator;
	return Math.asin(sin);
}
// 计算shape位置
export const genShapePosition = (ops) => {
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
		angle,
	} = ops;
	let newLeft = left;
	let newTop = top;
	let newScaleX = scaleX;
	let newScaleY = scaleY;
	let newFlipX = flipX;
	let newFlipY = flipY;
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
		newLeft = left + disX;
		newTop = top + disY;
	}
	return { newLeft, newTop, newScaleX, newScaleY, newFlipX, newFlipY };
};
// 原点坐标计算
export function getVertex(maxWidth, maxHeight, width, height, x, y) {
	let newX = x;
	let newY = y;
	const minX = -(maxWidth - width) / 2;
	const minY = -(maxHeight - height) / 2;
	const maxX = maxWidth - width - (maxWidth - width) / 2;
	const maxY = maxHeight - height - (maxHeight - height) / 2;
	if (x > maxX) {
		newX = maxX;
	}
	if (x < minX) {
		newX = minX;
	}
	if (y > maxY) {
		newY = maxY;
	}
	if (y < minY) {
		newY = minY;
	}
	return [newX, newY];
}
// 辅助线
export function helpAxis(ctx, x, y, width, height, sizeX, sizeY) {
	ctx.save();
	ctx.setLineDash([2, 6]);
	ctx.strokeStyle = 'yellow';
	ctx.lineWidth = 4;
	ctx.beginPath();
	ctx.moveTo(x + width / 2, y);
	ctx.lineTo(x + width / 2, y + height);
	ctx.moveTo(x, height / 2 + y);
	ctx.lineTo(x + width, height / 2 + y);
	ctx.stroke();
	ctx.strokeRect(x, y, sizeX, sizeY);
	ctx.strokeRect(x + sizeX, y + sizeY, sizeX, sizeY);
	ctx.strokeRect(x - sizeX, y - sizeY, sizeX, sizeY);
	ctx.restore();
}
