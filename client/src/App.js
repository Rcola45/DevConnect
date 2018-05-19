import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import jwt_decode from 'jwt-decode';
import setAuthToken from './utils/setAuthToken';
import { logoutUser, setCurrentUser } from './actions/authActions';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Landing from './components/layout/Landing';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard.js';
import './App.css';
import { clearCurrentProfile } from './actions/profileActions';

// Check for user token
if (localStorage.jwtToken) {
    // Set auth token header
    setAuthToken(localStorage.jwtToken);
    // Decode token and get the user data
    const decoded = jwt_decode(localStorage.jwtToken);
    // Set current user and the isAuthenticated flag
    store.dispatch(setCurrentUser(decoded));

    // Check for expired token
    const currentTime = Date.now() / 1000;

    if (decoded.exp < currentTime) {
        // Logout user
        store.dispatch(logoutUser());
        // Clear current profile
        store.dispatch(clearCurrentProfile());
        // Redirect to login
        window.location.href = '/login';
    }
}

class App extends Component {
    render() {
        return (
            <Provider store={store}>
                <Router>
                    <div className="App">
                        <Navbar />
                        <Route exact path={'/'} component={Landing} />
                        <div className="container">
                            <Route
                                exact
                                path={'/register'}
                                component={Register}
                            />
                            <Route exact path={'/login'} component={Login} />
                            <Route
                                exact
                                path={'/dashboard'}
                                component={Dashboard}
                            />
                        </div>
                        <Footer />
                    </div>
                </Router>
            </Provider>
        );
    }
}

export default App;
