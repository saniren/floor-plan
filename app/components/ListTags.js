import React from 'react';
import { connect } from 'react-redux';
import { getTagList } from '../actions/tags';
import EditTag from './EditTag';

class ListTags extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = { tagList: [], showEditTagComponent: false, selectedTag: {}};
  }
  
  componentDidMount() {
    getTagList("/tasks/", this.handleTagList.bind(this));
  }

  handleTagList(tags) {
    this.setState({ tagList: tags });
  }

  editTagComponent(tagData, dis, event){
    tagData.task && this.setState({showEditTagComponent: true, selectedTag:tagData})
  }

  hideEditTagComponent(data, dis, event){
    this.setState({showEditTagComponent: false});
  }

  render() {
    var self = this;
    if(this.state.showEditTagComponent){
        return(
          <div>
            <EditTag currentTagData={this.state.selectedTag} listTagFunction={this.hideEditTagComponent.bind(this)}/>
          </div>
        );
    } else {
      var tagRow = [];
      this.state.tagList.forEach(function(tag) {
        tagRow.push(
          <tr onClick={self.editTagComponent.bind(self, tag)}>
            <td>{tag.auid}</td>
            <td>{tag.task&&tag.task.asid}</td>
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

                                                    <div className="row">
                                                        <div className="col-sm-12">

                                                            <table className="table table-striped table-bordered table-hover">
                                                                <thead>
                                                                    <tr className="bg-secondary bg">
                                                                        <th>Tag ID</th>
                                                                        <th>Assigned ID</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>{tagRow}</tbody>

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
}

export default ListTags;