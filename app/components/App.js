import React from 'react';
import Header from './Header';
import Aside from './Aside';
import Footer from './Footer';
import Chart from './Chart';
// var io = require('socket.io-client');

var sampleData = [];
var self;


class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = { data: sampleData };
		self = this;
	}


	componentDidMount() {
		// //Listen for notification from backend
		// var socket = io('http://localhost:3000');
		// //Uses same variable as server to listen from server
		// socket.on('location', (data) => {
		// 	//Updated data got from server and updates client data
		// 	this.setState({data: data.data});
		// 	console.log(data);
		// });
	}

				// {React.cloneElement(this.props.children, { data: this.state.data })}

	render() {
		return (
			<div>
				<Header/>
				<Aside/>
				{this.props.children}
				<Footer/>
			</div>
		);
	}
}

export default App;
