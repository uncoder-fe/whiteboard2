import line from './line';
import pencil from './pencil';
import rect from './rect';
import circle from './circle';
import cube from './cube';
import triangle from './triangle';
const plugins = [
	{ type: 'event', action: 'hand' },
	{ type: 'event', action: 'move' },
	line,
	rect,
	circle,
	pencil,
	cube,
	triangle,
];
export default plugins;
