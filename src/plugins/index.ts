import line from './line';
import pencil from './pencil';
import rect from './rect';
import circle from './circle';
const plugins = [{ action: 'hand' }, { action: 'move' }, line, rect, circle, pencil];
export default plugins;
