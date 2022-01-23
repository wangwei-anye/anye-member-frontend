import React from 'react';
import './index.less';

export default class LoadingCom extends React.Component {
  render() {
    const { isLoading, isDone } = this.props;
    return (
      <div>
        {isLoading && !isDone ? (
          <div className="m-loading-wrap">
            <img src={require('@/assets/img/icon_loading.png')} alt="加載" />
          </div>
        ) : null}
        {isDone ? <div className="m-loading-wrap">- 已沒有更多 -</div> : null}
      </div>
    );
  }
}
