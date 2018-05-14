import axios from 'axios';
// If we're logged in, axios will always attach the Authorization header

const setAuthToken = token => {
    if (token) {
        // Apply to every request
        axios.defaults.headers.common['Authorization'] = token;
    } else {
        // Delete Authorization header (no token present)
        delete axios.defaults.headers.common['Authorization'];
    }
};

export default setAuthToken;
