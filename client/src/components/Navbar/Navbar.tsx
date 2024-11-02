import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.scss';

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <span className="logo">⚡ DevSpark</span>
        </Link>
      </div>
      <div className="navbar-menu">
        <Link to="/projects" className="nav-item">Projects</Link>
        <Link to="/snippets" className="nav-item">Snippets</Link>
        <Link to="/explore" className="nav-item">Explore</Link>
      </div>
      <div className="navbar-end">
        <button className="button-primary">+ New Project</button>
      </div>
    </nav>
  );
};

export default Navbar; 