import React, { useRef } from 'react';
import ReactDOM from 'react-dom';
import Stage from '../index';
import icon from '../default.jpg';
import './app.css';

const App = () => {
	const cRef = useRef(null);
	return (
		<div>
			<div>
				<button onClick={() => cRef.current.selectAction('line')}>直线</button>
				<button onClick={() => cRef.current.selectAction('pencil')}>铅笔</button>
				<button onClick={() => cRef.current.selectAction('rect')}>矩形</button>
				<button onClick={() => cRef.current.selectAction('circle')}>圆圈</button>
				<button onClick={() => cRef.current.selectAction('cube')}>立方体</button>
				<button onClick={() => cRef.current.selectAction('move')}>移动</button>
				<button onClick={() => cRef.current.selectAction('moveCanvas')}>移动视窗</button>
				<button onClick={() => cRef.current.scale('enlarge')}>放大</button>
				<button onClick={() => cRef.current.scale('shrink')}>缩小</button>
				<button onClick={() => cRef.current.clean()}>清空</button>
			</div>
			<div>
				<button onClick={() => cRef.current.setStyle({ strokeStyle: 'red' })}>红色</button>
				<button onClick={() => cRef.current.setStyle({ strokeStyle: 'green' })}>绿色</button>
				<button onClick={() => cRef.current.setStyle({ strokeStyle: 'blue' })}>蓝色</button>
				<button onClick={() => cRef.current.setStyle({ strokeStyle: 'yellow' })}>黄色</button>
			</div>
			<div>
				<button onClick={() => cRef.current.setStyle({ lineWidth: 2 })}>2号笔</button>
				<button onClick={() => cRef.current.setStyle({ lineWidth: 4 })}>4号笔</button>
				<button onClick={() => cRef.current.setStyle({ lineWidth: 8 })}>8号笔</button>
			</div>
			<div>
				<button onClick={() => cRef.current.selectAction('eraser')}>橡皮</button>
				<button onClick={() => cRef.current.setStyle({ lineWidth: 4 })}>小橡皮</button>
				<button onClick={() => cRef.current.setStyle({ lineWidth: 8 })}>大橡皮</button>
			</div>
			<Stage
				ref={cRef}
				onChange={(data) => { /*console.log(data);*/ }}
				height={800}
				width={1200}
				helpLine
			/>
			<img src={icon} alt="" id="image" style={{ display: 'none' }} />
		</div>
	);
};
ReactDOM.render(<App />, document.getElementById('root'));
