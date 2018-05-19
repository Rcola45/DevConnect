import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getCurrentProfile } from '../../actions/profileActions';

class Dashboard extends Component {
    componentDidMount() {
        this.props.getCurrentProfile();
    }

    render() {
        return <div />;
    }
}

Dashboard.propTypes = {};

export default connect(null, { getCurrentProfile })(Dashboard);
