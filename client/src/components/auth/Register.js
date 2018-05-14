import React, { Component } from 'react';
import { connect } from 'react-redux'; // Connecting redux to component
import { registerUser } from '../../actions/authActions';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import TextFieldGroup from '../common/TextFieldGroup';

class Register extends Component {
    constructor() {
        super();
        this.state = {
            name: '',
            email: '',
            password: '',
            password2: '',
            errors: {},
        };

        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    onChange(e) {
        this.setState({ [e.target.name]: e.target.value });
    }

    onSubmit(e) {
        e.preventDefault();

        const newUser = {
            name: this.state.name,
            email: this.state.email,
            password: this.state.password,
            password2: this.state.password2,
        };

        this.props.registeruser(newUser, this.props.history);
    }

    componentDidMount() {
        if (this.props.auth.isAuthenticated) {
            this.props.history.push('/dashboard');
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.errors) {
            this.setState({ errors: nextProps.errors });
        }
    }

    render() {
        const errors = this.state.errors;

        return (
            <div className="register">
                <div className="container">
                    <div className="row">
                        <div className="col-md-8 m-auto">
                            <h1 className="display-4 text-center">Sign Up</h1>
                            <p className="lead text-center">
                                Create your DevConnector account
                            </p>
                            <form noValidate onSubmit={this.onSubmit}>
                                {/* Name */}
                                <TextFieldGroup
                                    name={'name'}
                                    placeholder={'Name'}
                                    error={errors.name}
                                    value={this.state.name}
                                    onChange={this.onChange}
                                />

                                {/* Email */}
                                <TextFieldGroup
                                    name={'email'}
                                    placeholder={'Email Address'}
                                    error={errors.email}
                                    type={'email'}
                                    value={this.state.email}
                                    onChange={this.onChange}
                                    info={
                                        'This site uses Gravatar so if you want a profile image, use a Gravatar email'
                                    }
                                />

                                {/* Password */}
                                <TextFieldGroup
                                    name={'password'}
                                    placeholder={'Password'}
                                    error={errors.password}
                                    type={'password'}
                                    value={this.state.password}
                                    onChange={this.onChange}
                                />

                                {/* Password2 */}
                                <TextFieldGroup
                                    name={'password2'}
                                    placeholder={'Confirm Password'}
                                    error={errors.password2}
                                    type={'password2'}
                                    value={this.state.password2}
                                    onChange={this.onChange}
                                />

                                <input
                                    type="submit"
                                    className="btn btn-info btn-block mt-4"
                                />
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

Register.propTypes = {
    registeruser: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
    auth: state.auth,
    errors: state.errors,
});

export default connect(mapStateToProps, { registeruser: registerUser })(
    withRouter(Register)
);
