import React from "react";
import "./index.less";

export default class Tip extends React.Component {
  render() {
    return (
      <div
        className={[
          "tipComponent",
          this.props.isLongTip ? "tipComponentLong" : null
        ].join(" ")}
        style={this.props.style}
      >
        <div className="txt">{this.props.txt}</div>
      </div>
    );
  }
}
