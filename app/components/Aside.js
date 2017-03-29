import React from 'react';
import { connect } from 'react-redux'
import Messages from './Messages';
import { IndexLink, Link } from 'react-router';

class Aside extends React.Component {
  
  updateActiveClass(event){
    $("li").removeClass("active");
    $(event.currentTarget).addClass("active");
  }
  
  componentDidMount() { 
    $("#"+(window.location.pathname.split("/")[1]||"root")).addClass("active");
  }

  render() {
    return (
        <div id="aside" className="app-aside hidden-xs bg-light">
          <div className="aside-wrap">
            <div className="navi-wrap">
              <nav ui-nav className="navi clearfix">
                <ul className="nav">
                  <li id="root" onClick={this.updateActiveClass.bind(this)}>
                    <Link to="/" className="">
                      <i className="fa fa-dot-circle-o icon"></i>
                      <span>Visualisation</span>
                    </Link>
                  </li>
                  <li id="wip" onClick={this.updateActiveClass.bind(this)}>
                    <Link to="/wip" >
                      <i className="fa fa-gears icon"></i>
                      <span>WIP</span>
                    </Link>
                  </li>
                  <li id="history" onClick={this.updateActiveClass.bind(this)}>
                    <Link to="/history" >
                      <i className="fa fa-history icon"></i>
                      <span>History</span>
                    </Link>
                  </li>
                  <li id="tag" onClick={this.updateActiveClass.bind(this)}>
                    <Link to="/tag" >
                      <i className="fa fa-tags icon"></i>
                      <span>Manage Tags</span>
                    </Link>
                  </li>

                  <li id="grid" onClick={this.updateActiveClass.bind(this)}>
                    <Link to="/grid">
                      <i className="fa fa-ticket icon"></i>
                      <span>Admin</span>
                    </Link>       
                  </li> 
                </ul>
              </nav>
            </div>
          </div>
        </div>
    );
  }
}

export default Aside;
