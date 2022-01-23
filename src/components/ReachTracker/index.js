import React from 'react';
import Waypoint from 'react-waypoint';

class ReachTracker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isReached: false
    };
  }

  onEnter = () => {
    const { onReach } = this.props;
    if (onReach && typeof onReach === 'function') {
      onReach.call(null, this.props);
    }
    this.setState({
      isReached: true
    });
  };

  render() {
    // The tracker only trigger once on first reach.
    // After that it will do nothing.
    if (this.state.isReached) {
      return null;
    }
    return <Waypoint onEnter={this.onEnter} />;
  }
}

export default ReachTracker;
