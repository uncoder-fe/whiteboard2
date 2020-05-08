import React, { useState, useRef } from 'react'
import ReactDOM from 'react-dom'
import Stage from './src'
import plugins from './src/plugins'
import icon from './default.jpeg'

const App = () => {
	const [action, setAction] = useState('moveCanvas')
	const cRef = useRef(null)
	return (
		<div>
			<div>
				<button
					onClick={() => {
						setAction('rect')
					}}
				>
					rect
				</button>
				<button
					onClick={() => {
						setAction('circle')
					}}
				>
					circle
				</button>
				<button
					onClick={() => {
						setAction('move')
					}}
				>
					move
				</button>
				<button
					onClick={() => {
						setAction('moveCanvas')
					}}
				>
					moveCanvas
				</button>
				<button
					onClick={() => {
						cRef.current.scale('enlarge')
					}}
				>
					enlarge
				</button>
				<button
					onClick={() => {
						cRef.current.scale('shrink')
					}}
				>
					shrink
				</button>
				<button
					onClick={() => {
						const data = cRef.current.onChangeData()
						console.log(data)
					}}
				>
					onChangeData
				</button>
			</div>
			<Stage
				getRef={(ref) => {
					cRef.current = ref
				}}
				action={action}
				height={800}
				width={800}
				plugins={plugins}
				imgUrl="http://placekitten.com/800/800"
			/>
			<div>
				<img src={icon} alt="" id="image" style={{ display: 'none' }} />
			</div>
		</div>
	)
}
ReactDOM.render(<App></App>, document.getElementById('root'))
