import line from './line';
import pencil from './pencil';
import rect from './rect';
import circle from './circle';
import cube from './cube';
const plugins = [{ action: 'hand' }, { action: 'move' }, line, rect, circle, pencil, cube];
export default plugins;
