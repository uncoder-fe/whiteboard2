import React, { useRef } from 'react';
import ReactDOM from 'react-dom';
import Stage from '../index';
import plugins from '../plugins';
import icon from '../default.jpg';
import './app.css';

const App = () => {
	const cRef = useRef(null);
	return (
		<div>
			<div>
				<button onClick={() => cRef.current.selectAction('rect')}>矩形</button>
				<button onClick={() => cRef.current.selectAction('circle')}>圆圈</button>
				<button onClick={() => cRef.current.selectAction('move')}>移动</button>
				<button onClick={() => cRef.current.selectAction('moveCanvas')}>moveCanvas</button>
				<button onClick={() => cRef.current.scale('enlarge')}>放大</button>
				<button onClick={() => cRef.current.scale('shrink')}>缩小</button>
				<button onClick={() => cRef.current.clean()}>清空</button>
			</div>
			<Stage
				ref={cRef}
				onChange={(data) => {
					console.log(data);
				}}
				height={800}
				width={800}
				plugins={plugins}
				backgroundImage="https://placekitten.com/800/800"
				helpLine
			/>
			<img src={icon} alt="" id="image" style={{ display: 'none' }} />
		</div>
	);
};
ReactDOM.render(<App />, document.getElementById('root'));
