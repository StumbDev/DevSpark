import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import './styles/main.scss';
const App = () => {
    return (<BrowserRouter>
      <div className="app">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />}/>
            <Route path="/projects" element={<div>Projects Page (Coming Soon)</div>}/>
            <Route path="/snippets" element={<div>Snippets Page (Coming Soon)</div>}/>
            <Route path="/explore" element={<div>Explore Page (Coming Soon)</div>}/>
          </Routes>
        </main>
      </div>
    </BrowserRouter>);
};
export default App;
