import React from 'react';
import { connect } from 'react-redux'
import Messages from './Messages';

class Visualisation extends React.Component {
  render() {
    return (
        <div className="app-content">
          <div className="app-content-body app-content-full">
            <div className="hbox hbox-auto-xs bg-light">
              <div className="col">
                <div className="vbox">
                  
                  <div className="wrapper-sm bg-light">
                    <div className="font-bold h4">Page Title</div>
                  </div>
                  
                  <div className="row-row bg-light lter">
                    <div className="cell">
                      <div className="cell-inner">
                        <div className="wrapper-md">
                          This is body part 
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


export default Visualisation;