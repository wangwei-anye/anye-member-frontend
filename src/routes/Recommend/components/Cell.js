import React from "react";
import ReachTracker from "@/components/ReachTracker";
import { LEVEL_COLOR, LEVEL_BG_COLOR } from "@/constants";
import { thousandFormat } from "@/utils/tools";
import "./index.less";

class Cell extends React.Component {
  renderExchangeType(item) {
    const exchangeType = parseInt(item.exchange_type, 10);
    const { cash, points } = item;
    const exchangeTypeJson = {
      0: () => {
        return "";
      },
      1: () => {
        return `${thousandFormat(points)}積分`;
      },
      2: () => {
        return `$${thousandFormat(parseFloat(cash).toFixed(1))}`;
      },
      3: () => {
        return `${thousandFormat(points)}積分+$${thousandFormat(
          parseFloat(cash).toFixed(1)
        )}`;
      },
    };
    return exchangeTypeJson[exchangeType] && exchangeTypeJson[exchangeType]();
  }

  renderExchangeTypeTwoLine(item) {
    const { cash, points } = item;
    return `${thousandFormat(points)}積分+  \n  $${thousandFormat(
      parseFloat(cash).toFixed(1)
    )}`;
  }

  handleLoadError = (e) => {
    // e.target.src = defaultBg;
    // e.target.classList.add('load-error');
  };
  handleClick = (item, e) => {
    const target = e.target;
    if (this.props.onClick && typeof this.props.onClick === "function") {
      const info = Object.assign({}, item, {
        item_position: this.props.position,
        control_button: target.className === "img" ? "N" : "Y",
      });
      this.props.onClick(info);
    }
  };
  onReach = () => {
    const item = this.props.cellInfo;
    const value = Object.assign({}, item, {
      item_position: this.props.position,
    });
    if (this.props.onReach && typeof this.props.onReach === "function") {
      this.props.onReach(value);
    }
  };
  render() {
    const item = this.props.cellInfo;
    const { userInfo } = this.props;
    return (
      <div className="m-cell-item" onClick={this.handleClick.bind(this, item)}>
        <div className="cover-img-wrap">
          <img
            src={item.poster_display_url}
            alt=""
            className="img"
            style={{ height: item.imgHeight }}
            onError={this.handleLoadError}
          />
        </div>
        <div className="txt-box">
          <div className="title1">{item.title}</div>
          {item.exchange_type === 3 ? (
            <div className="m-exchange-type-btn-wrap-two-line">
              <div
                className={["txt-two-line", LEVEL_COLOR[userInfo.level]].join(
                  " "
                )}
              >
                {this.renderExchangeTypeTwoLine(item)}
              </div>
              {+item.button_status === 1 ? (
                <div
                  className={["btn", LEVEL_BG_COLOR[userInfo.level]].join(" ")}
                >
                  {item.button_text}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="m-exchange-type-btn-wrap">
              <div
                className={[
                  "txt",
                  LEVEL_COLOR[userInfo.level],
                  +item.button_status === 1 ? "" : "txt-no-btn",
                ].join(" ")}
              >
                {this.renderExchangeType(item)}
              </div>
              {+item.button_status === 1 ? (
                <div
                  className={["btn", LEVEL_BG_COLOR[userInfo.level]].join(" ")}
                >
                  {item.button_text}
                </div>
              ) : null}
            </div>
          )}
        </div>
        <ReachTracker onReach={this.onReach} />
      </div>
    );
  }
}
export default Cell;
