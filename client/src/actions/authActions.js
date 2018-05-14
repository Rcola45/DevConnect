// Register a user
import axios from 'axios';
import setAuthToken from '../utils/setAuthToken';
import jwt_decode from 'jwt-decode';

import { GET_ERRORS, GET_CURRENT_USER } from './types';

export const registerUser = (userData, history) => dispatch => {
    axios
        .post('/api/users/register', userData)
        .then(res => history.push('/login'))
        .catch(err => {
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data,
            });
        });
};

// Login: Get the user token
export const loginUser = userData => dispatch => {
    axios
        .post('/api/users/login', userData)
        .then(res => {
            // Get token
            const token = res.data.token;

            // Set token in localStorage
            localStorage.setItem('jwtToken', token);

            // Set token to Authorization header
            setAuthToken(token);

            // Decode token to get user info
            const decodedUser = jwt_decode(token);

            // Set the current user
            dispatch(setCurrentUser(decodedUser));
        })
        .catch(err => {
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data,
            });
        });
};

export const setCurrentUser = decoded => {
    return {
        type: SET_CURRENT_USER,
        payload: decoded,
    };
};
