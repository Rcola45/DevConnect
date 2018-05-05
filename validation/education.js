const validator = require('validator'); // Validates strings
const isEmpty = require('./is-empty');

module.exports = function validateExperienceInput(data) {
    let errors = {};

    data.school = !isEmpty(data.school) ? data.school : '';
    data.degree = !isEmpty(data.degree) ? data.degree : '';
    data.fieldofstudy = !isEmpty(data.fieldofstudy) ? data.fieldofstudy : '';
    data.from = !isEmpty(data.from) ? data.from : '';

    if(validator.isEmpty(data.school)){
        errors.school = 'School name is required';
    }

    if(validator.isEmpty(data.degree)){
        errors.degree = 'Degree is required';
    }

    if(validator.isEmpty(data.fieldofstudy)){
        errors.fieldofstudy = 'Field of Study is required';
    }

    if(validator.isEmpty(data.from)){
        errors.from = 'Job start date is required';
    }


    return {
        errors,
        isValid: isEmpty(errors)
    }
};