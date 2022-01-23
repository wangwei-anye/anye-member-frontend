import React from "react";
import { LEVEL_BG_COLOR } from "@/constants";
import { withRouter } from "react-router-dom";
import { connect } from "dva";
import moment from "moment";
import { getScrollTop, dataTrackerAction } from "@/utils/tools";
import "./index.less";

const defaultTabList = [
  {
    name: "推薦",
    path: "/recommend"
  },
  {
    name: "獎賞專區",
    path: "/reward"
  },
  {
    name: "賺分專區",
    path: "/earn-point"
  },
  {
    name: "活動",
    path: "/activity"
  }
];
class Activity extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isShow: false,
      activeTab: props.system.pathname || defaultTabList[0].path,
      tabList: defaultTabList
    };
    this.infiniteMallUrl =
      process.env.ENV !== "production"
        ? "http://01infinity-mall.hktester.com"
        : "http://01infinity-mall.hk01.com";
  }
  componentDidMount() {
    const refTablList = this.refs.tabList;
    const rect = refTablList.getBoundingClientRect();
    this.tabListRectTop = rect.top;
    document.addEventListener("scroll", this.handleScroll);

    //mcp1.9.4.1   在 3月2日上午10時 至  3月22日22時 之间，“賺分專區”分页的名称调整为“快活玩賞”
    const startTime = moment("2020-03-02 10:00").format("YYYY-MM-DD HH:mm");
    const endTime = moment("2020-03-22 22:00").format("YYYY-MM-DD HH:mm");
    const isStart = moment(startTime).isBefore();
    const isEnd = moment(endTime).isBefore();
    if (isStart && !isEnd) {
      defaultTabList[2].name = "快活玩賞";
    }
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    const nextPropsSystem = nextProps.system;
    if (nextPropsSystem.pathname !== this.props.system.pathname) {
      this.setState({
        activeTab: nextPropsSystem.pathname
      });
    }
  }
  componentWillUnmount() {
    document.removeEventListener("scroll", this.handleScroll);
  }
  handleScroll = () => {
    const refTablList = this.refs.tabList;
    const rect = refTablList.getBoundingClientRect();
    this.setState({
      isShow: rect.top <= 0 && getScrollTop() >= this.tabListRectTop
    });
  };
  handleClick = (index, path) => {
    const { system } = this.props;
    const { activeTab } = this.state;
    this.props.dispatch({
      type: "system/save",
      payload: {
        ...system,
        deepLink: {
          timestamp: Date.now(),
          type: "clearInterval"
        }
      }
    });
    dataTrackerAction(
      {},
      { action: "click_tablist" },
      {
        from_tab: defaultTabList.filter(item => item.path === activeTab)[0]
          .name,
        to_tab: defaultTabList[index].name
      }
    );
    // if (path === '/mall') {
    //   window.location.href = this.infiniteMallUrl;
    //   return;
    // }
    if (path !== activeTab) {
      this.props.history.replace(path);
      document.getElementById("root").scrollIntoView(true);
      this.setState({
        activeTab: path
      });
    }
  };
  renderTabList() {
    const { tabList, activeTab } = this.state;
    const { auth } = this.props;
    const level = auth.userInfo.level;
    return tabList.map((item, index) => {
      return (
        <div
          key={index}
          className={["tab", activeTab === item.path ? "active" : null].join(
            " "
          )}
          onClick={this.handleClick.bind(this, index, item.path)}
        >
          {item.name}
          <div
            className={[
              "line",
              activeTab === item.path ? LEVEL_BG_COLOR[level] : null
            ].join(" ")}
          />
        </div>
      );
    });
  }
  render() {
    return (
      <React.Fragment>
        <div ref="tabList" className="tab-list">
          {this.renderTabList()}
        </div>
        {this.state.isShow ? (
          <div className="tab-list fixed">{this.renderTabList()}</div>
        ) : null}
      </React.Fragment>
    );
  }
}
export default withRouter(
  connect(({ auth, system }) => {
    return {
      auth: auth.toJS(),
      system: system.toJS()
    };
  })(Activity)
);
