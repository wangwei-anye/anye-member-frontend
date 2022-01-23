import React from 'react';
import './index.less';

class Skeleton extends React.Component {
  render() {
    return (
      <div className="m-placeholder-wrap">
        <div className="left-info" />
        <div className="right-info">
          <p className="title" />
          <p className="title" />
          <p className="desc" />
        </div>
      </div>
    );
  }
}
export default Skeleton;
