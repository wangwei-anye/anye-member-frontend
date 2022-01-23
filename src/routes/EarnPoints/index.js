//  商城
import React from "react";
import { connect } from "dva";
import LoadingCom from "@/components/Loading/index";
import ReachTracker from "@/components/ReachTracker";
import {
  getScrollTop,
  getClientHeight,
  getScrollHeight,
  dataTrackerAction,
} from "@/utils/tools";
import { getEarnPointListRequest } from "@/services/index";
import "./index.less";

class EarnPoints extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataList: [],
      isLoading: false,
      isLoadingEnd: false,
      last_record: 0,
    };
    this.distanceToRefresh = 100;
  }
  componentDidMount() {
    this.fetchData();
    window.addEventListener("scroll", this.handleScroll, false);
    dataTrackerAction({}, { action: "view_tab" }, { current_tab: "賺分專區" });
  }
  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll, false);
  }
  async fetchData() {
    if (this.props.system.pathname !== "/earn-point") {
      return;
    }
    this.setState({
      isLoading: true,
    });
    const { last_record, dataList } = this.state;
    const { data } = await getEarnPointListRequest({ last_record });
    if (data.code === 200) {
      this.setState({
        last_record: data.data[data.data.length - 1].position,
        dataList: dataList.concat(data.data),
        isLoadingEnd: data.data.length < 20, // 20 这个是默认请求的条数  在 api 接口可更改
      });
    }
    if (data.code === 404) {
      this.setState({
        dataList: dataList.concat([]),
        isLoadingEnd: true,
      });
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
        that.fetchData();
      }
    }
  };
  handleClick = (item, index) => {
    if (!item.link_url) {
      return;
    }
    const { system } = this.props;
    dataTrackerAction(
      {},
      { action: "click_point_item" },
      { item_position: index + 1, item_id: item.id, price: null, points: null }
    );
    if (system.platform !== "web") {
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
  onReach = (item, index) => {
    dataTrackerAction(
      { GA: false },
      { action: "reach_point_item" },
      { item_position: index + 1, item_id: item.id }
    );
  };
  render() {
    const { dataList, isLoading, isLoadingEnd } = this.state;
    return (
      <div className="earn-points" style={{ ...this.props.style }}>
        {!dataList.length && isLoadingEnd ? (
          <p className="u-nodata-tip">- 已沒有更多 -</p>
        ) : (
          <React.Fragment>
            {dataList.map((item, index) => {
              return (
                <div className="m-point-item-wrap" key={index}>
                  <div className="m-item-desc-wrap">
                    <div
                      className={[
                        "img-wrap",
                        `img-wrap-${(index + 1) % 6}`,
                      ].join(" ")}
                    >
                      <img
                        src={item.poster_display_url}
                        alt=""
                        className="img"
                      />
                    </div>
                    <div className="m-title-desc-wrap">
                      <p className="title">{item.title}</p>
                      <p className="desc">{item.description}</p>
                    </div>
                  </div>
                  <div className="m-btn-wrap">
                    <button
                      type="btn"
                      className="btn"
                      onClick={this.handleClick.bind(this, item, index)}
                    >
                      {item.extend_info
                        ? item.extend_info.button_description
                        : ""}
                    </button>
                  </div>
                  <ReachTracker
                    onReach={this.onReach.bind(this, item, index)}
                  />
                </div>
              );
            })}
            <LoadingCom isLoading={isLoading} isDone={isLoadingEnd} />
          </React.Fragment>
        )}
      </div>
    );
  }
}
export default connect(({ system }) => {
  return {
    system: system.toJS(),
  };
})(EarnPoints);
