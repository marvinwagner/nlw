import React, { FunctionComponent } from 'react';
import logo from '../assets/logo.svg'

const Header: FunctionComponent = ({ children }) => {
  return (
    <header>
      <img src={logo} alt="Ecoleta"/>

      { children }
    </header>
  );
}

export default Header;