import React from 'react';
import { connect } from 'react-redux'
import Messages from './Messages';
import { IndexLink, Link } from 'react-router';

class Aside extends React.Component {
  
  updateActiveClass(event){
    $("li").removeClass("active");
    $(event.target).closest("li").addClass("active");
  }
  
  componentDidMount() { 
    debugger
    // $("#"+(window.location.pathname.split("/")[1]||"root")).addClass("active");

    // $(document).on('click', '[ui-nav] a', function (e) {
    //   var $this = $(e.target), $active;
    //   $this.is('a') || ($this = $this.closest('a'));

    //   $active = $this.parent().siblings( ".active" );
    //   $active && $active.toggleClass('active').find('> ul:visible').slideUp(200);

    //   ($this.parent().hasClass('active') && $this.next().slideUp(200)) || $this.next().slideDown(200);
    //   $this.parent().toggleClass('active');

    //   $this.next().is('ul') && e.preventDefault();
    // });
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
                    <ul className="nav nav-sub dk">
                      <li id="list"><Link to="/list"><span>List</span></Link></li>
                      <li id="edit"><Link to="/edit"><span>Edit</span></Link></li>
                      <li id="add"><Link to="/add"><span>Add</span></Link></li>
                      <li id="delete"><Link to="/delete"><span>Remove</span></Link></li>     
                    </ul>
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
