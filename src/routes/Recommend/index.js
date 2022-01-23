//  按钮
import React from "react";
import { connect } from "react-redux";
import {
  getScrollTop,
  getClientHeight,
  getScrollHeight,
  dataTrackerAction,
} from "@/utils/tools";
import { getRecommendListRequest } from "@/services/index";
import LoadingCom from "@/components/Loading/index";
import Cell from "./components/Cell";
import "./index.less";

const defaultLimitNum = 20;
class Recommend extends React.Component {
  constructor() {
    super();
    this.state = {
      isLoadingEnd: false,
      isLoading: false,
      dataList: [],
    };
    this.distanceToRefresh = 200;
    this.leftTotalHeight = 0;
    this.rightTotalHeight = 0;
    this.last_record = 0;
    this.isRefreshing = false;
    this.imgHeight = 0;
    this.leftNum = 0;
    this.rightNum = 0;
  }

  componentDidMount() {
    const documentWidth = document.documentElement.clientWidth;
    const rate = 0.44106;
    this.imgHeight = documentWidth * rate;

    this.fetchData();
    // 滚动事件触发
    window.addEventListener("scroll", this.handleRecommendScroll, false);
    dataTrackerAction({}, { action: "view" });
    dataTrackerAction({}, { action: "view_tab" }, { current_tab: "推薦" });
  }
  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleRecommendScroll, false);
    this.leftTotalHeight = 0;
    this.rightTotalHeight = 0;
    this.last_record = 0;
    this.isRefreshing = false;
  }
  handleRecommendScroll = () => {
    const { isLoading, isLoadingEnd } = this.state;
    const that = this;
    if (
      getScrollTop() + getClientHeight() + this.distanceToRefresh >
      getScrollHeight()
    ) {
      if (!isLoading && !isLoadingEnd) {
        that.fetchData();
      }
    }
  };
  async fetchData() {
    if (this.props.system.pathname !== "/recommend") {
      return;
    }
    if (this.last_record === "null") {
      return;
    }
    if (this.isRefreshing) {
      return;
    }
    this.isRefreshing = true;
    this.setState({
      isLoading: true,
    });
    const { dataList } = this.state;
    const { data } = await getRecommendListRequest({
      limit: defaultLimitNum,
      last_record: this.last_record,
    });
    if (data) {
      let list = [];
      if (data.code === 200) {
        const resData = data.data;
        const res = this.setImgPostion(resData.list);
        list = resData.list;
        this.setState({
          dataList: dataList.concat(res),
          isLoadingEnd: dataList.concat(list).length >= resData.count,
        });
        this.last_record = list.length
          ? list[list.length - 1].position
          : "null";
      } else {
        alert(data.message);
      }
    }
    this.setState({
      isLoading: false,
    });
    setTimeout(() => {
      this.isRefreshing = false;
    }, 100);
  }
  setImgPostion(list) {
    if (!(Array.isArray(list) && list.length)) {
      return [];
    }

    const self = this;
    return list
      .sort((a, b) => a.position - b.position)
      .map((item) => {
        const displayWidth = (
          item.poster_display_size || item.poster_origin_size
        ).split("*")[0];

        const displayHeight = (
          item.poster_display_size || item.poster_origin_size
        ).split("*")[1];

        const imgHeight = (displayHeight / displayWidth) * self.imgHeight;

        let distance = 12 + 8 + 8 + 24 + 8;
        if (item.exchange_type !== 0) {
          distance += 24;
        }
        if (item.title.length > 9) {
          distance += 24;
        }
        distance = (document.documentElement.clientWidth / 375) * distance;
        let type = "left";
        if (self.leftTotalHeight > self.rightTotalHeight) {
          self.rightTotalHeight += imgHeight;
          self.rightTotalHeight += distance;
          type = "right";
          this.rightNum++;
        } else {
          this.leftNum++;
          self.leftTotalHeight += imgHeight;
          self.leftTotalHeight += distance;
        }
        // console.log(item.title);
        // console.log("left---》" + self.leftTotalHeight);
        // console.log("right---》" + self.rightTotalHeight);
        // console.log("leftNum---》" + this.leftNum);
        // console.log("rightNum---》" + this.rightNum);
        return {
          ...item,
          type,
          imgHeight,
        };
      });
  }
  handleClick = (item) => {
    dataTrackerAction(
      {},
      { action: "click_recomm_item" },
      {
        item_position: item.item_position,
        item_id: item.id,
        control_button: item.control_button,
      }
    );
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
    dataTrackerAction(
      { GA: false },
      { action: "reach_recomm_item" },
      { item_position: item.item_position, item_id: item.id }
    );
  };
  render() {
    const { isLoading, isLoadingEnd, dataList } = this.state;
    const { userInfo } = this.props.auth;
    const leftList = dataList.filter((item) => item.type === "left");
    const rightList = dataList.filter((item) => item.type === "right");
    const leftItemList = leftList.map((item, index) => {
      return (
        <Cell
          cellInfo={item}
          key={index}
          userInfo={userInfo}
          onClick={this.handleClick}
          position={`l${index + 1}`}
          onReach={this.onReach}
        />
      );
    });
    const rightItemList = rightList.map((item, index) => {
      return (
        <Cell
          cellInfo={item}
          key={index}
          userInfo={userInfo}
          onClick={this.handleClick}
          position={`r${index + 1}`}
          onReach={this.onReach}
        />
      );
    });
    return (
      <div className="recommend">
        <div className="m-list-wrap item-list">
          <div className="box left-list">{leftItemList}</div>
          <div className="box right-list">{rightItemList}</div>
          <div style={{ clear: "both" }} />
        </div>
        <LoadingCom isLoading={isLoading} isDone={isLoadingEnd} />
      </div>
    );
  }
}
export default connect(({ auth, system, score }) => {
  return {
    system: system.toJS(),
    auth: auth.toJS(),
    score: score.toJS(),
  };
})(Recommend);
