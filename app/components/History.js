import React from 'react';
import { connect } from 'react-redux';
import { getLocationHistroyOfDevice, calculateZoneOfHistoryDate } from '../actions/locations';

class History extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = { deviceId: "", history: []};
    this.eachGridX = 30;
    this.eachGridY = 30;
  }
  
  handleChange(event) {
    this.setState({ deviceId: event.target.value });
  }

  handleKeyPress(e) {
    if (e.key === 'Enter') {
      getLocationHistroyOfDevice(this.updateHistory.bind(this), this.state.deviceId);
    }
  }

  updateHistory(history){
    this.setState({ history: [] });
    console.log(this.props.zoneData, history);
    var formatedHistory = []
    for(var i=0; i<history.length;i++){
      var tempLocation = {}
      tempLocation.startTime = moment(history[i].createdAt).format("DD/MM/YYYY hh:mm a");
      tempLocation.zoneId = history[i].layoutChunkId&&history[i].layoutChunkId.zone;
      tempLocation.zoneName = history[i].layoutChunkName&&history[i].layoutChunkName.zone;
      tempLocation.endTime = tempLocation.startTime;
      for(var j=i+1; j<history.length;j++){
        if(history[i].layoutChunkId.zone === history[j].layoutChunkId.zone){
          tempLocation.endTime = moment(history[j].createdAt).format("DD/MM/YYYY hh:mm a");
        } else {
          tempLocation.endTime = moment(history[j-1].createdAt).format("DD/MM/YYYY hh:mm a");
          formatedHistory.push(tempLocation)
          //i will get incremented by 1 by for loop
          i=j-1;
          break;
        }
        if(j+1===history.length){
          formatedHistory.push(tempLocation);
          i=j-1;
        }
      }
    }

    this.setState({ history: formatedHistory });
  }

  render() {
    var rows = [];
    this.state.history.forEach(function(zone) {
      rows.push(
        <tr>
          <td>{zone.startTime + " - " + zone.endTime}</td>
          <td>{zone.zoneName}</td>
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
                          <div className="col-sm-6">
                            <div className="panel b-a m-b-sm">
                              <div className="panel-body">
                                  <div className="form-group m-b-xs">
                                    <label className="col-sm-4 control-label h4 p-t-xs">Enter Assign ID:</label>
                                    <div className="col-sm-8">
                                      <input className="form-control" type="text" placeholder="Assign Name" onKeyPress={this.handleKeyPress.bind(this)} value={this.state.deviceId} onChange={this.handleChange.bind(this)}/>
                                    </div>
                                  </div>
                              </div>
                            </div>                            
                            <div className="panel b-a m-b-sm">

                              <div className="panel-heading bg-light b-b b-dker p-t-xs p-b-xs">
                                <h4>History</h4>
                              </div>

                              <div className="panel-body" style={{height:"335px",overflowY:"auto"}}>

                                <div className="row">
                                  <div className="col-sm-12">

                                    <table className="table table-striped table-bordered table-hover">
                                      <thead>
                                        <tr className="bg-secondary bg">
                                          <th>Time Stamp</th>
                                          <th>Location</th>
                                        </tr>
                                      </thead>
                                      <tbody>{rows}</tbody>

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
      
        </div>
      </div>
    );
  }
}


const mapStateToProps = (state) => {
  return {
    zoneData: state.zoneData
  };
};

export default connect(mapStateToProps)(History);