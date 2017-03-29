import React from 'react';
import { connect } from 'react-redux';
import d3Grid from './d3Grid';
import ReactDOM from 'react-dom';
import { getActiveLocations } from '../actions/locations';

var self;
class Grid extends React.Component {
	constructor(props) {
	    super(props);
	    // this.state = { data: React.PropTypes.array, domain: React.PropTypes.object};
		self = this;
	}

	componentDidMount() {
		//Call create grid function to create grid in svg
		var el = ReactDOM.findDOMNode(this);
		debugger
		this.dispatcher = new d3Grid(el, {
			width: '722px',
			height: '1082px'
		}, this.props);
		this.dispatcher.create();
		getActiveLocations(this.setUpdatedData.bind(this));
	}

	setUpdatedData(result) {
		// self.setState({data: result});
		this.dispatcher.update({data: result});
	}
	
	componentDidUpdate(){

	}

	componentWillReceiveProps(nextProps){
		//Get updated data and call appropriate function 
		// this.dispatcher.update(nextProps);
	}
	
	render() {
		return (
			<div className="app-content">
			    <div className="app-content-body app-content-full">
			        <div className="hbox hbox-auto-xs bg-light">
			            <div className="col">
			                <div className="vbox">
			                    <div className="row-row bg-light lter">
			                        <div className="cell">
			                            <div className="cell-inner">
			                                <div className="wrapper">

			                                    <div className="row">
			                                        <div className="col-sm-8">
			                                            <div className="row">
			                                                <div className="col-sm-12">
			                                                    <div className="Grid"></div>
			                                                </div>
			                                            </div>

			                                        </div>
			                                    </div>

			                                </div>
			                            </div>
			                        </div>
			                    </div>
			                </div>
			            </div>
			        </div>
			    </div>
			</div>
		);
	}
}

const mapStateToProps = (state) => {
  return {
    gridData: state.gridData,
    zoneData: state.zoneData
  };
};

export default connect(mapStateToProps)(Grid);