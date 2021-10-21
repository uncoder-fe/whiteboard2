import line from './line';
import pencil from './pencil';
import rect from './rect';
import circle from './circle';
import cube from './cube';
import triangle from './triangle';
const plugins = [
	{ type: 'event', action: 'hand' },
	{ type: 'event', action: 'move' },
	{ type: 'event', action: 'eraser' },
	{ type: 'event', action: 'moveCanvas' },
	line,
	rect,
	circle,
	pencil,
	cube,
	triangle,
];
export default plugins;
