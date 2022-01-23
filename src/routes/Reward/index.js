//  商城
import React from "react";
import { connect } from "dva";
import { getRewardRequest } from "@/services";
import {
  getScrollTop,
  getClientHeight,
  getScrollHeight,
  thousandFormat,
  // dataTrackerAction
} from "@/utils/tools";
import LoadingCom from "@/components/Loading";
import Skeleton from "@/components/Skeleton";
import "./index.less";
import ReachTracker from "@/components/ReachTracker";

class Reward extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataList: [],
      isLoading: false,
      isLoadingEnd: false,
      offset: 0,
    };
    this.last_record = 0;
    this.distanceToRefresh = 100;
    this.defaultLimitNum = 20;
  }
  componentDidMount() {
    this.fetchList();
    window.addEventListener("scroll", this.handleScroll, false);
  }
  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll, false);
  }
  async fetchList(query = { offset: 0 }) {
    if (this.props.system.pathname !== "/reward") {
      return;
    }
    this.setState({
      isLoading: true,
    });
    const { dataList } = this.state;
    const { data } = await getRewardRequest({
      limit: this.defaultLimitNum,
      last_record: this.last_record,
    });
    if (data) {
      let list = [];
      if (data.code === 200) {
        const resData = data.data;
        list = resData.list;
        this.setState({
          dataList: dataList.concat(list),
          isLoadingEnd: dataList.concat(list).length >= resData.count,
        });
        this.last_record = list.length
          ? list[list.length - 1].position
          : "null";
      }
    }
    this.setState({
      isLoading: false,
    });
  }
  handleScroll = () => {
    const { isLoading, isLoadingEnd } = this.state;
    const that = this;
    if (
      getScrollTop() + getClientHeight() + that.distanceToRefresh >
      getScrollHeight()
    ) {
      if (!isLoading && !isLoadingEnd) {
        that.fetchList();
      }
    }
  };

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
    return `${thousandFormat(points)}積分+ \r\n $${thousandFormat(
      parseFloat(cash).toFixed(1)
    )}`;
  }

  handleClick = (item) => {
    // dataTrackerAction(
    //   {},
    //   { action: 'click_recomm_item' },
    //   {
    //     item_position: item.item_position,
    //     item_id: item.id,
    //     control_button: item.control_button
    //   }
    // );
    if (this.props.system.platform !== "web") {
      this.props.dispatch({
        type: "system/deepLinkOpenWeb",
        payload: {
          url: item.link_url,
          isCanEditInfo: true,
        },
      });
    } else {
      window.location.href = item.link_url;
    }
  };

  onReach = (item) => {
    // dataTrackerAction(
    //   { GA: false },
    //   { action: 'reach_recomm_item' },
    //   { item_position: item.item_position, item_id: item.id }
    // );
  };

  render() {
    const { dataList, isLoading, isLoadingEnd } = this.state;
    return (
      <div className="reward">
        {isLoading && !dataList.length ? (
          <div>
            {[1, 2, 3, 4].map((item, index) => (
              <Skeleton key={index} />
            ))}
          </div>
        ) : null}
        {dataList.map((item, index) => {
          return (
            <React.Fragment key={index}>
              <div
                className="m-cell-item"
                onClick={this.handleClick.bind(this, item)}
              >
                <div className="cover-img-wrap">
                  <img src={item.poster_display_url} alt="" className="img" />
                </div>
                <div className="txt-box">
                  <div className="title1">{item.title}</div>
                  {item.is_description === 1 ? (
                    <div className="des">{item.description}</div>
                  ) : null}
                  {item.exchange_type === 3 ? (
                    <div className="m-exchange-type-btn-wrap">
                      <div className="txt-two-line">
                        {this.renderExchangeTypeTwoLine(item)}
                      </div>
                      {+item.button_status === 1 ? (
                        <div className={["btn"].join(" ")}>
                          {item.button_text}
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="m-exchange-type-btn-wrap">
                      <div
                        className={[
                          "txt",
                          +item.button_status === 1 ? "" : "txt-no-btn",
                        ].join(" ")}
                      >
                        {this.renderExchangeType(item)}
                      </div>
                      {+item.button_status === 1 ? (
                        <div className={["btn"].join(" ")}>
                          {item.button_text}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
                <ReachTracker onReach={this.onReach.bind(this, item)} />
              </div>
            </React.Fragment>
          );
        })}
        <div>
          <LoadingCom isLoading={isLoading} isDone={isLoadingEnd} />
        </div>
      </div>
    );
  }
}
export default connect(({ system }) => {
  return {
    system: system.toJS(),
  };
})(Reward);
