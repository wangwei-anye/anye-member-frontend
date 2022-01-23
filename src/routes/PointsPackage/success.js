import React from "react";
import { connect } from "dva";
import "./success.less";
import { thousandFormat } from "@/utils/tools";
import Clipboard from "clipboard";
import { userPackageDetail, getPackageInfoDetail } from "@/services/index";
import { dataTrackerAction } from "@/utils/tools";
import moment from "moment";

class PointsPackageSuccess extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      package_info: {},
      list: [],
      info: {},
    };
    this.isCanClick = true;
  }
  async componentDidMount() {
    document.title = "兌換成功";
    document.getElementById("root").scrollIntoView(true);

    const id = this.props.match.params.id;

    const { data } = await getPackageInfoDetail(id);
    if (data.code === 200) {
      this.setState({
        info: data.data,
      });
    }

    dataTrackerAction(
      {},
      { category: "promo_code_redemption", action: "view_history" },
      { activity_id: id }
    );

    if (
      this.props.auth.userInfo.memberApplicationServiceToken &&
      !!this.props.auth.userInfo.memberApplicationServiceToken
    ) {
      this.initInfo(this.props.auth.userInfo.memberApplicationServiceToken);
    }
    new Clipboard(".copyBtn");
  }

  async UNSAFE_componentWillReceiveProps(nextProps) {
    const { memberApplicationServiceToken } = nextProps.auth.userInfo;
    if (
      memberApplicationServiceToken !==
        this.props.auth.userInfo.memberApplicationServiceToken &&
      !!memberApplicationServiceToken
    ) {
      this.initInfo(memberApplicationServiceToken);
    }
  }

  initInfo = async (memberApplicationServiceToken) => {
    const id = this.props.match.params.id;
    const {
      data: { data },
    } = await userPackageDetail(id, memberApplicationServiceToken);
    this.setState({
      package_info: data.package_info,
      list: data.list,
    });
  };

  onBack = () => {
    this.props.history.go(-1);
  };

  toPoint = () => {
    if (!this.isCanClick) {
      return;
    }
    this.isCanClick = false;
    setTimeout(() => {
      this.isCanClick = true;
    }, 1500);

    const id = this.props.match.params.id;
    dataTrackerAction(
      {},
      { category: "promo_code_redemption", action: "click_points" },
      { activity_id: id }
    );
    this.props.dispatch({
      type: "system/deepLink",
      payload: {
        url: "://point",
        isCanEditInfo: true,
      },
    });
  };

  toCoupon = () => {
    if (!this.isCanClick) {
      return;
    }
    this.isCanClick = false;
    setTimeout(() => {
      this.isCanClick = true;
    }, 1500);

    const id = this.props.match.params.id;
    dataTrackerAction(
      {},
      { category: "promo_code_redemption", action: "click_coupons" },
      { activity_id: id }
    );

    this.props.dispatch({
      type: "system/deepLink",
      payload: {
        url: "://coupon/home/coupons",
        isCanEditInfo: true,
      },
    });
  };

  render() {
    const { list, info } = this.state;
    return (
      <div className="p-right-success-wrap">
        <div className="header">
          <img
            src={require("@/assets/img/icon_return-white.png")}
            alt=""
            onClick={this.onBack}
          ></img>
        </div>
        <div className="g-main">
          <div className="m-title-wrap">
            <h2 className="title">成功兌換</h2>
            <h2 className="title">{info.successfully_redeemed_message}</h2>
          </div>
          <div className="list-content">
            {list.map((item, index) => {
              return (
                <div className="item-list" key={index}>
                  <div className="title">
                    <div className="time">
                      兌換時間{" "}
                      {moment(item.received_time).format("YYYY.MM.DD HH:mm")}
                    </div>
                  </div>
                  {item.points_amount > 0 ? (
                    <div className="item">
                      <div className="img">
                        <img
                          src={require("../../assets/img/icon-score.png")}
                          alt=""
                        ></img>
                      </div>
                      <div className="content">
                        <div className="subTitle">
                          為你送上「01積分」
                          <div className="btn" onClick={this.toPoint}>
                            查看我的積分
                            <i className={["arrow", "right"].join(" ")}></i>
                          </div>
                        </div>
                        <div className="gift">
                          {thousandFormat(item.points_amount)}積分
                        </div>
                        <div className="detail">
                          <div className="txt">
                            恭喜您!「01積分」獎賞將會發放至您的賬戶！
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  {item.coupon_list.map((subItem, subIndex) => {
                    return (
                      <div className="item" key={subIndex}>
                        <div className="img">
                          <img src={subItem.coupon_icon_image_url} alt=""></img>
                        </div>
                        <div className="content">
                          <div className="subTitle">
                            {subItem.coupon_name}
                            <div className="btn" onClick={this.toCoupon}>
                              查看我的優惠券
                              <i className={"arrow"}></i>
                            </div>
                          </div>
                          <div className="gift coupon">
                            {subItem.rule_description}
                          </div>
                          <div className="detail">
                            <div className="txt">
                              {subItem.date_of_use_description}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}
export default connect(({ system, auth }) => {
  return {
    system: system.toJS(),
    auth: auth.toJS(),
  };
})(PointsPackageSuccess);
