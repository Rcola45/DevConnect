const validator = require('validator'); // Validates strings
const isEmpty = require('./is-empty');

module.exports = function validateLoginInput(data) {
    let errors = {};

    if(!validator.isEmail(data.email)){
        errors.email = 'Email is not formatted correctly';
    }

    if(!validator.isLength())

    return {
        errors,
        isValid: isEmpty(errors)
    }
};