import React from 'react';
import { IndexLink, Link } from 'react-router';

class Header extends React.Component {
  render() {
    const active = { borderBottomColor: '#3f51b5' };
    return (
      <div id="header" className="app-header navbar" role="menu">
          <div className="navbar-header bg-light">
            <a href="" className="navbar-brand text-lt">
              <img src="img/logo.png" style={{minHeight:"24px"}}></img>
            </a>
          </div>
        </div>
      
    );
  }
}

export default Header;
