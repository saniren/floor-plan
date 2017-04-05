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
	    this.state = { asid: "", activeTagInChunk: [], gateEntries: [], layout:{}};
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
		var self = this;
		try {
			// self.setState({data: activeTags});
			this.activeTags=activeTags;
			// Set layout details
			this.setState({ layout: {name: this.layout.name, count: activeTags.length}})
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

			for (var dept in groupedTagByChunk) {
				if(dept !== "" && dept !== "undefined"){
			    	var currentGroup = groupedTagByChunk[dept][0];
					var currentChunk = this.layoutChunks.filter(function(chunk){return chunk.layoutPartId === dept})[0];
					 currentChunk&&(currentChunk.count = groupedTagByChunk[dept].length);
				}
			}

	    	//format chunk
	    	var groupedChunkByType= _.groupBy(this.layoutChunks, function(chunk){return chunk.type;});
	    	groupedChunkByType["department"].map(function(dept){
	    		dept.zone = [];
	    		groupedChunkByType["zone"].map(function(zone){
	    			if(zone.area !== [])
	    				zone.area.every(function(microGridRow){
	    					return self.isMicroGridPresent(microGridRow[0], dept.area) && self.isMicroGridPresent(microGridRow[microGridRow.length-1], dept.area);
	    				})&&dept.zone.push(zone);
	    		});
	    	});
	    	var tempDept = groupedChunkByType["department"];
	    	var chunkCount = [];

			this.setState({ activeTagInChunk: tempDept});
			this.dispatcher.updateTagsOfZone(groupedTagByChunk);
		}catch(err) {
			console.log("Thrown error: "+err.message);
		}
	}

	isMicroGridPresent(microGrid, area){
		var arr = area.filter( function(row) {
		    return !!~row.indexOf( microGrid );
		});
		return arr.length !== 0;
	}

	componentDidUpdate(){
		$('.collapse').on('show.bs.collapse', function () {
			$('.collapse.in').collapse('hide');
		});

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
			if(self.lastClicked !== data.layoutPartId && data.type !== undefined){

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
				self.dispatcher.updateLabelVisibility('department', 'zone');
				$('.collapse.in').collapse('hide');
			}
		}
	}

	render() {
	    var deptRows = [];
	    var self = this;
	    deptRows.push(
			<tr onClick={self.udpateLayoutViewByChunk.bind(self, this.state.layout)}>
				<td className="w-60">{this.state.layout.name}</td>
				<td className="w-40">{this.state.layout.count}</td>
			</tr>
		);
	    this.state.activeTagInChunk.forEach(function(dept){
			deptRows.push(
				<tr className="accordion-toggle collapsed" data-toggle="collapse" data-parent="#accordion" href={'#collapse_'+dept.layoutPartId} onClick={self.udpateLayoutViewByChunk.bind(self, dept)}>
					<td className="w-60">{dept.name}</td>
					<td className="w-40">{dept.count?dept.count:0}</td>
				</tr>
			);
			if(dept.zone.length !== 0){
				var zoneRow = [];
				dept.zone.forEach(function(zone){
					zoneRow.push(
						<tr>
							<td className="w-60">{zone.name}</td>
							<td className="w-40">{zone.count?zone.count:0}</td>
						</tr>
					);
				});
				deptRows.push(
					<tr className="collapse" id={'collapse_'+dept.layoutPartId}>
						<td colSpan="2" className="p-n">
							<table className="table table-bordered m-n">
								<tbody className="bg-light dker">
									{zoneRow}
								</tbody>
							</table>
						</td>
					</tr>
				)
			}
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
			                                                        <tbody>{deptRows}</tbody>

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