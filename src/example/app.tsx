import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import Stage from '../index';
import plugins from '../plugins';
import icon from '../default.jpg';

const App = () => {
	const [action, setAction] = useState('rect');
	const cRef = useRef(null);
	return (
		<div>
			<div>
				<button onClick={() => setAction('rect')}>矩形</button>
				<button onClick={() => setAction('circle')}>圆圈</button>
				<button onClick={() => setAction('move')}>移动</button>
				<button onClick={() => setAction('moveCanvas')}>
					moveCanvas
				</button>
				<button onClick={() => cRef.current.scale('enlarge')}>放大</button>
				<button onClick={() => cRef.current.scale('shrink')}>缩小</button>
				<button
					onClick={() => {
						debugger;
						cRef.current.clean();
					}}
				>
					清空
				</button>
			</div>
			<Stage
				ref={cRef}
				onChange={(data) => {
					console.log(data);
				}}
				action={action}
				height={800}
				width={800}
				plugins={plugins}
				imgUrl="http://placekitten.com/800/800"
				helpLine
			/>
			<img src={icon} alt="" id="image" style={{ display: 'none' }} />
		</div>
	);
};
ReactDOM.render(<App />, document.getElementById('root'));
