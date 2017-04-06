import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux'
import { DateRangePicker } from 'react-dates';
import moment from 'moment';
import { getTagById, updateTag } from '../actions/tags';

class EditTag extends React.Component {
  constructor(props) {
    super(props);
    this.state = { name: this.props.currentTagData.task.asid, auid: this.props.currentTagData.auid, currentTag: this.props.currentTagData };
  }

  componentDidMount() {
    var self = this;
    // getTagById()
    var Dragula = require('dragula')
    var leftContainer = ReactDOM.findDOMNode(document.getElementById('left-draggable'));
    var rightContainer = ReactDOM.findDOMNode(document.getElementById('right-draggable'));
    var drake = Dragula([leftContainer, rightContainer]);

    setTimeout(function(){
      $('#start-datetimepicker').datetimepicker()
      $('#end-datetimepicker').datetimepicker({
          useCurrent: false //Important! See issue #1075
      });
      $("#start-datetimepicker").on("dp.change", function (e) {
        $('#end-datetimepicker').data("DateTimePicker").minDate(e.date)
      });
      $("#end-datetimepicker").on("dp.change", function (e) {
        $('#start-datetimepicker').data("DateTimePicker").maxDate(e.date)
      });
      $("#start-datetimepicker > .form-control").prop('disabled', true);
      $('#start-datetimepicker').data("DateTimePicker").date(moment(self.state.currentTag.task.startTime));
      $('#end-datetimepicker').data("DateTimePicker").date(moment(self.state.currentTag.task.endTime));
    });
  }
  addTaskToList(addedTask){
    alert(addedTask.asid+" has been updated");
  }

  handleSave(){
    var children = document.getElementById("right-draggable").children, path=[]
    for (var i = 0; i < children.length; i++) {
      path.push(children[i].innerHTML);
    }
    var startDateTime = document.getElementById('start-datetimepicker-field').value
    var endDateTime = document.getElementById('end-datetimepicker-field').value
    var tagData = {
      "auid": this.state.auid,
      "asid": this.state.name,
      "startTime": moment(startDateTime).unix()*1000,
      "endTime": moment(endDateTime).unix()*1000,
      "route": path,
      "active":"Y"
    }
    updateTag("/tasks/"+this.state.asid, tagData, this.addTaskToList.bind(this));
  }

  handleCancel(){
    this.props.listTagFunction();
  }

  handleAssignIdChange(event) {
    this.setState({ name: event.target.value });
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
                            <div className="col-sm-12">
                              <div className="col-sm-6">
                                <h4>Tag ID</h4>
                                <input className="form-control m-b" type="text" placeholder="" value={this.state.auid} disabled/>
                              </div>
                              <div className="col-sm-6">
                                <h4>Assigned ID :</h4>
                                <input className="form-control m-b" type="text" placeholder="" value={this.state.name} onChange={this.handleAssignIdChange.bind(this)}/>
                              </div>
                            </div>
                          </div>  

                          <div className="row">
                            <div className="col-sm-12">

                              <div className="col-sm-6">

                                <div className="panel b-a">

                                  <div className="panel-heading bg-light b-b b-dker p-t-xs p-b-xs">
                                    <h4>Select the Estimated time-line for Assigned tag</h4>
                                  </div>

                                  <div className="panel-body">
                                    <div className="row">

                                      <div className="col-sm-6">
                                        <div className="form-group">
    
                                          <div className='input-group date' id='start-datetimepicker'>
                                            <input type='text' className="form-control" id='start-datetimepicker-field'/>
                                            <span className="input-group-btn input-group-addon no-padding no-border">
                                              <button className="btn btn-default"><i className="glyphicon glyphicon-calendar"></i></button>
                                            </span>
                                          </div>

                                        </div>
                                      </div>

                                        <div className="col-sm-6">
                                          <div className="form-group">

                                            <div className='input-group date' id='end-datetimepicker'>
                                                <input type='text' className="form-control" id='end-datetimepicker-field'/>
                                                <span className="input-group-btn input-group-addon no-padding no-border">
                                                  <button className="btn btn-default"><i className="glyphicon glyphicon-calendar"></i></button>
                                                </span>
                                            </div>

                                          </div>
                                        </div>

                                    </div>
                                  </div>

                                </div>

                              </div>

                              <div className="col-sm-6">

                                <div className="panel b-a ">

                                  <div className="panel-heading bg-light b-b b-dker p-t-xs p-b-xs">
                                    <h4>Expected Path Drag and Drop</h4>
                                  </div>

                                  <div className="panel-body">
                                    <div className="row">
                                      <div className="col-sm-12">
                                        <div className="container col-sm-6" id="left-draggable">
                                          <div className="p-xs m-xs bg-secondary">Swap me around</div>
                                          <div className="p-xs m-xs bg-secondary">Swap her around</div>
                                          <div className="p-xs m-xs bg-secondary">Swap him around</div>
                                          <div className="p-xs m-xs bg-secondary">Swap them around</div>
                                          <div className="p-xs m-xs bg-secondary">Swap us around</div>
                                          <div className="p-xs m-xs bg-secondary">Swap things around</div>
                                          <div className="p-xs m-xs bg-secondary">Swap everything around</div>
                                        </div>    
                                        <div className="container col-sm-6" id="right-draggable">
                                          <div className="p-xs m-xs bg-secondary">start</div>
                                          <div className="p-xs m-xs bg-secondary">end</div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                </div>

                              </div>

                            </div>
                          </div>

                          <div className="row">
                            <div className="col-sm-12 text-center">
                              <button className="btn m-b-xs btn-sm btn-orange-l btn-addon" onClick={this.handleCancel.bind(this)}><i className="fa"></i>Cancel</button>
                              <button className="btn m-b-xs btn-sm btn-orange-l btn-addon" onClick={this.handleSave.bind(this)}><i className="fa"></i>Save</button>
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

export default EditTag;