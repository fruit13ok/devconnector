import React, { Component } from 'react';
// we use BrowserRouter,
// as Router just shorten the name BrowserRouter,
// Route is the conditionally shown component based on matching a path to a URL
import { BrowserRouter as Router, Route } from 'react-router-dom';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Landing from './components/layout/Landing';
import Register from './components/auth/Register';
import Login from './components/auth/Login';

import './App.css';

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Navbar />
          {/* 
          exact will match just root route '/', so /api will be differ route
          {Landing} is refer to import Landing component 
          */}
          <Route exact path="/" component={Landing} />
          {/* bootstrap container class will have margin both side */}
          <div className="container">
            <Route exact path="/register" component={Register} />
            <Route exact path="/login" component={Login} />
          </div>
          <Footer />
        </div>
      </Router>
    );
  }
}

export default App;
