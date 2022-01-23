import React from 'react';
import { connect } from 'dva';

class TrackerClient extends React.Component {
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.system.ts !== this.props.system.ts) {
      this.dispatchTrackerClient(nextProps);
    }
  }
  dispatchTrackerClient(newProps) {
    const { userInfo } = newProps.auth;
    const { trackerClient, sessionId } = newProps.system;
    const { GAAndPiwik, categoryAndAction } = trackerClient;
    let { data } = trackerClient;
    data = Object.assign(
      {},
      {
        ts: Date.now(),
        account_id: userInfo.accountId,
        web_session_id: sessionId
      },
      data
    );
    this.trackerClient(GAAndPiwik, categoryAndAction, data);
  }
  trackerClient(GAAndPiwik, categoryAndAction, data) {
    window.sdk.trackerClient.fire(GAAndPiwik, {
      ...categoryAndAction,
      label: JSON.stringify(data)
    });
  }
  render() {
    return null;
  }
}
export default connect(({ system, auth }) => {
  return {
    system: system.toJS(),
    auth: auth.toJS()
  };
})(TrackerClient);
