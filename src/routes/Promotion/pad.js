import React from "react";
import { connect } from "dva";
import Header from "@/components/Header";
import Timer, { compareTime } from "@/utils/timer";
import { parseSearch } from "@/utils/tools";
import "./pad.less";

@connect(({ promotion }) => ({ promotion: promotion.toJS() }))
export default class PromotionPad extends React.Component {
  state = {
    remain: ["00", "00", "00", "00"],
  };
  timer = null;

  mapToRemain = (outstring) => {
    this.setState({
      remain: outstring.split(":"),
    });
  };

  async componentDidMount() {
    document.addEventListener(
      "visibilitychange",
      this.handleVisibilityChange,
      false
    );
    const search = parseSearch(this.props.location.search);
    if (search && search.isBegin === "false") {
      this.createCountDown();
    }
    const id = this.props.match.params.id;
    await this.props.dispatch({
      type: "promotion/getDetail",
      id,
    });
  }

  handleVisibilityChange = () => {
    const visibility = document.visibilityState;
    const search = parseSearch(this.props.location.search);
    if (visibility === "visible" && search && search.isBegin === "false") {
      this.createCountDown();
    }
    if (visibility === "hidden") {
      if (this.timer) {
        this.timer.stop();
      }
    }
  };

  /**
   * 创建倒计时
   */
  createCountDown = () => {
    const search = parseSearch(this.props.location.search);
    const onlineAt = search.online_at;
    // 开始时间和结束时间
    const startTime = new Date(onlineAt.replace(/-/g, "/"));
    const now = Date.now().valueOf();
    const before = compareTime(now, startTime) === -1;
    if (before) {
      this.timer = new Timer({
        endTime: startTime,
        render: this.mapToRemain,
        onFinish: this.goToDetail,
      });
      this.timer.start();
    }
  };

  goToDetail = () => {
    const id = this.props.match.params.id;
    this.props.history.push(`/promotion/${id}`);
  };

  componentWillUnmount() {
    if (this.timer) {
      this.timer.stop();
    }
    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange,
      false
    );
  }

  render() {
    const { location } = this.props;
    const { promotion } = this.props;
    const [days, hours, mins, seconds] = this.state.remain;
    let title = ""; // 默認無標題
    let isEnd = true; // 默認結束
    let onlineAt = null;

    // 根據上一個頁面傳過來的參數進行配置頁面
    if (location && location.search) {
      const search = parseSearch(location.search);
      if (search.exist === "false") {
        // 活動不存在
        return (
          <div className="m-promotion-pad bg-white">
            <Header
              hideMessage={true}
              title=""
              onBack={this.handleHeaderBack}
            />
          </div>
        );
      }
      onlineAt = search.online_at;
      if (promotion.nav_title) {
        title = promotion.nav_title;
      }

      if (search.isBegin === "false") {
        // 如果尚未開始即是尚未結束
        title = "活動未開始";
        isEnd = false;
      }
    }
    const backgroundUrl = promotion.activity_status_image;
    return (
      <div
        className={`m-promotion-pad ${isEnd ? "isend" : ""} ${
          onlineAt === "null" ? "isend" : ""
        }`}
        style={{
          backgroundImage: `url(${backgroundUrl})`,
        }}
      >
        <Header
          hideMessage={true}
          title={title}
          onBack={this.handleHeaderBack}
        />
        <section className="section">
          <h3 className="h3">{!isEnd ? "活動尚未開始" : "活動已結束"}</h3>
          <p className="p">{!isEnd ? "敬請期待" : "多謝支持"}</p>
          <div className="countdown">
            <p className="countdown__text">正在倒數</p>
            <p className="countdown__text">
              還有&nbsp;
              <span className="countdown__num">{days}</span>
              天&nbsp;
              <span className="countdown__num">{hours}</span>
              小時&nbsp;
              <span className="countdown__num">{mins}</span>
              分&nbsp;
              <span className="countdown__num">{seconds}</span>秒
            </p>
          </div>
        </section>
      </div>
    );
  }
}
