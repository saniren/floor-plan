import React from 'react';
import { connect } from 'react-redux';
import d3Chart from './d3Chart';
import ReactDOM from 'react-dom';
import { getCurrentLocationOfTag, getActiveLocations, calculateZoneOfHistoryDate,
		getLayoutDetails, getLayoutChunkDetails, getGateEntries } from '../actions/locations';
import _ from 'underscore';
var io = require('socket.io-client');
var self;


class Chart extends React.Component {
	constructor(props) {
	    super(props);
	    this.state = { asid: "", activeTagInChunk: [], gateEntries: []};
		self = this;
		self.activeTags=[];
		self.layout = {};
		self.layoutChunks = [];
		self.lastClicked; 
	}

	componentDidMount() {	
		//Call create image function to create image in svg
		var el = ReactDOM.findDOMNode(this);
		//Get layout details so that we can get only tags of used layout
		getLayoutDetails(this.setLayoutDetails.bind(this));
		getLayoutChunkDetails("/layout_chunks/"+this.layout.layoutId, this.setLayoutChunkDetails.bind(this));
		this.dispatcher = new d3Chart(el, this.layout, this.layoutChunks);
		this.dispatcher.create();
		getActiveLocations(this.setUpdatedData.bind(this));
		getGateEntries(this.manipulateGateEntries.bind(this));


		// // Listen for notification from backend
		// var socket = io('http://localhost:3000');
		// //Uses same variable as server to listen from server
		// socket.on('location', (data) => {
		// 	//Updated data got from server and updates client data
		// });
		//Listen for notification from backend
		var socket = io(window.location.href);
		//Uses same variable as server to listen from server
		socket.on('location', (data) => {
			//Updated data got from server and updates client data
			// this.activeTags.push(data.data[0]);
			this.setUpdatedData(data.data);
		});
	}
	manipulateGateEntries(entries){
		var groupedByGateId = _.groupBy(entries, function(entry){return entry.gateId;});
		var formatedGateEntries = [];
		for(var gate in groupedByGateId){
			var eachGate = {};
			eachGate.name = gate;
			var groupedByState =  _.groupBy(groupedByGateId[gate], function(entry){return entry.state;});
			for(var state in groupedByState){
				eachGate[state] = groupedByState[state].slice(0,4)
			}
			formatedGateEntries.push(eachGate);
		}
		this.setState({ gateEntries: formatedGateEntries});

	}
	setLayoutDetails(layout){
		this.layout = layout[0];
	}

	setLayoutChunkDetails(layoutChunks){
		this.layoutChunks = layoutChunks;
	}

	setUpdatedData(activeTags) {
		try {
			// self.setState({data: activeTags});
			this.activeTags=activeTags;
	    	// calculateZoneOfHistoryDate(activeTags, this.props.zoneData, this.props.gridData.cellWidth, this.props.gridData.cellHeight);
	    	//group tags by auid 
	    	var groupedByAuid = _.groupBy(activeTags, function(tag){return tag.auid;});
	    	var uniqTagList = []
	    	//sort each group by created at time and get first most tag of each group
	    	for(var auid in groupedByAuid){
	    		uniqTagList.push(_.sortBy(groupedByAuid[auid], 'createdAt').reverse()[0]);
	    	}

	    	//Light up al the tags
	    	this.dispatcher.lightUpAllTags(uniqTagList)
	    	// var uniqTagList = _.uniq(activeTags, function(tag){return tag.auid});
	    	//Group by zone

	    	var groupedTagByZone= _.groupBy(uniqTagList, function(tag){return tag.layoutChunkId.zone;});
	    	var groupedTagByDept= _.groupBy(uniqTagList, function(tag){return tag.layoutChunkId.zone&&tag.layoutChunkId.department&&tag.layoutChunkId.department;});
	    	var groupedTagByChunk = Object.assign(groupedTagByDept, groupedTagByZone);
	    	var chunkCount = [];
			for (var dept in groupedTagByChunk) {
				if(dept !== "" && dept !== "undefined"){
			    	var currentGroup = groupedTagByChunk[dept][0];
					var currentChunk = this.layoutChunks.filter(function(chunk){return chunk.layoutPartId === dept})[0];
					 currentChunk&&(currentChunk.count = groupedTagByChunk[dept].length);
				}
			}
			this.setState({ activeTagInChunk: this.layoutChunks});
			this.dispatcher.updateTagsOfZone(groupedTagByChunk);
		}catch(err) {
			console.log("Thrown error: "+err.message);
		}
	}

	componentDidUpdate(){
		// if(this.props.data.length !== 0){
		// 	this.activeTags.push(this.props.data[0]);
		// 	this.setUpdatedData(this.activeTags);
		// }

	}

	componentWillReceiveProps(nextProps){
		//Get updated data and call appropriate function 
		// this.dispatcher.updateTagsOfZone(nextProps);
	}
	
	handleChange(event) {
		this.setState({ asid: event.target.value });
	}

	_handleKeyPress(e) {
		if (e.key === 'Enter') {
			if(this.state.asid !== "")
				getCurrentLocationOfTag(this.showCurrentLocationOfTag.bind(this), this.state.asid);
			else
				this.showCurrentLocationOfTag(undefined)
		}
	}

	showCurrentLocationOfTag(data){
		this.dispatcher.updateCurrentLocationOfTag(data);
	}

	udpateLayoutViewByChunk(data, dis, event){
		if(data.type !== 'zone'){
			if(self.lastClicked !== data.layoutPartId){

				this.dispatcher.updateViewPort(
					data.zoneInPx.chunkStartsAtXInPx, 
					data.zoneInPx.chunkStartsAtYInPx,
					data.zoneInPx.chunkEndsAtXInPx - data.zoneInPx.chunkStartsAtXInPx, 
					data.zoneInPx.chunkEndsAtYInPx - data.zoneInPx.chunkStartsAtYInPx, 
					data.layoutId);

				self.lastClicked = data.layoutPartId;
				self.dispatcher.updateLabelVisibility('zone', 'department');
			} else {
				this.dispatcher.updateViewPort(0, 0, this.layout.width, this.layout.height, this.layout.layoutId);
				self.lastClicked = undefined;
				self.dispatcher.updateLabelVisibility('department', 'zone')
			}
		}
	}

	render() {
	    var rows = [];
	    var self = this;
	    this.state.activeTagInChunk.forEach(function(chunk){
			rows.push(
				<tr onClick={self.udpateLayoutViewByChunk.bind(self, chunk)}>
					<td>{chunk.name}</td>
					<td>{chunk.count?chunk.count:0}</td>
				</tr>
			);
    	});

		var gateEntries = [];

	    this.state.gateEntries.forEach(function(entry){
			gateEntries.push(
				<tr>
					<td colSpan="4">{entry.name}</td>
				</tr>
			);
			gateEntries.push(
				<tr>
					<td className="bg-success lter">{entry.in && entry.in[0] && entry.in[0].auid || '\u00A0' }</td>
					<td className="bg-success lter">{entry.in && entry.in[1] && entry.in[1].auid || '\u00A0' }</td>
					<td className="bg-danger lter">{entry.out && entry.out[0] && entry.out[0].auid || '\u00A0' }</td>
					<td className="bg-danger lter">{entry.out && entry.out[1] && entry.out[1].auid || '\u00A0' }</td>
				</tr>
			);
			gateEntries.push(
				<tr>
					<td className="bg-success lter">{entry.in && entry.in[2] && entry.in[2].auid || '\u00A0' }</td>
					<td className="bg-success lter">{entry.in && entry.in[3] && entry.in[3].auid || '\u00A0' }</td>
					<td className="bg-danger lter">{entry.out && entry.out[2] && entry.out[2].auid || '\u00A0' }</td>
					<td className="bg-danger lter">{entry.out && entry.out[3] && entry.out[3].auid || '\u00A0' }</td>
				</tr>
			);
    	});
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
			                                                    <div className="Chart"></div>
			                                                </div>
			                                            </div>

			                                        </div>

			                                        <div className="col-sm-4">
			                                            <div className="row">
			                                                <div className="col-sm-12">

				                                                <div className="form-group m-b-xs">
											                                    <label className="col-sm-3 control-label h4 p-t-xs">Search:</label>
											                                    <div className="col-sm-9">
			                                                    	<input className="form-control m-b" type="text" placeholder="Search" onKeyPress={this._handleKeyPress.bind(this)} value={this.state.asid} onChange={this.handleChange.bind(this)}/>
											                                    </div>
											                                 	</div>

			                                                </div>
			                                            </div>

			                                            <div className="row">
			                                                <div className="col-sm-12">
			                                                    <table className="table table-striped table-bordered table-hover">
			                                                        <thead>
			                                                            <tr className="bg-secondary bg">
			                                                                <th>Department</th>
			                                                                <th>Count</th>
			                                                            </tr>
			                                                        </thead>
			                                                        <tbody>{rows}</tbody>

			                                                    </table>
			                                                </div>
			                                            </div>
			                                            <div className="row">
			                                                <div className="col-sm-12">
								                              <table className="table table-bordered text-center">
								                                <thead>
								                                  <tr>
								                                    <th colSpan="2" width="50%" className="text-center">In</th>
								                                    <th colSpan="2" className="text-center">Out</th>
								                                  </tr>
								                                </thead>
								                                	<tbody>{gateEntries}</tbody>
								                              	</table>
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

export default connect(mapStateToProps)(Chart);