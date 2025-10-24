import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Subject from './components/Subject/subject.js';
import CustomQuery from './components/Subject/CustomQuery.js';
import HomePage from './components/Subject/HomePage.js';
import './App.css';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
function App(){
  const location = useLocation();

  return (
    <>
      {location.pathname !== '/' && (
        <nav className="navbar navbar-light bg-light px-3">
          <Link to="/" 
           className={`btn animated-back-button ${
                location.pathname === '/' ? 'btn-primary' : 'btn-outline-primary'
              } navbar-brand mb-0 h1`}
              style={{marginLeft:100}}
          >
            <ArrowBackIcon /> 
          
          </Link>
          <div>
            <Link
              to="/extractor"
              className={`btn ${location.pathname === '/extractor' ? 'btn-primary' : 'btn-outline-primary'} me-2`}
            >
              Appraisal Extractor
            </Link>
            <Link
              to="/query"
              className={`btn ${
                location.pathname === '/query' ? 'btn-primary' : 'btn-outline-primary'
              }`}
            >
              Custom Query
            </Link>
          </div>
        </nav>
      )}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/extractor" element={<Subject />} />
        <Route path="/query" element={<CustomQuery />} />
      </Routes>
    </>
  );
}

export default App;
