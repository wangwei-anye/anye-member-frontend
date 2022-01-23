//  商城
import React from "react";
import { Toast } from 'antd-mobile'
import { withRouter } from "react-router-dom";
import { connect } from "dva";
import {
  dataTrackerAction,
  thousandFormat,
  floorAndFixed,
} from "@/utils/tools";
import { HK_API_ID } from "@/constants";
import "./index.less";
import { queryBalances } from "@/services";

const refreshDelay = 10000;
// const badNetTimeout = 10000;

class MemberInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pointNum: 0,
      loadingShowFlag: false,
      loadingStart: false,
      loadingDone: false,
      loadingFail: false,
    };
    this.scrollTimer = false; //滚动事件不要连续触发
    this.loginStatusTimer = null;
    this.isCanClick = true;
    this.intervalGetLoginStatus = 3000;
  }

  updateProfileAndBalance = async () => {
    const result = [];

    // if online
    if (this.isOnline()) {
      const failInReturn = 'failure in return';

      // get user profile
      const resLoginStatus = await this.props.dispatch({
        type: "auth/getLoginStatus",
      });
      result?.push((typeof resLoginStatus !== 'string') ? failInReturn : resLoginStatus);

      // get balance if token is valid
      if (this.props.auth.userInfo.memberToken !== "") {
        const resGetBalance = await this.getBalance(this.props.auth.userInfo.memberToken);
        result?.push((typeof resGetBalance !== 'string') ? failInReturn : resGetBalance);
      }

    } else {

      // if offline
      result?.push('failure in connecting net')

      // emulate the process of refreshing
      this.setState({
        loadingDone: false,
        loadingStart: true,
      })
      setTimeout(() => {
        this.setState({
          loadingStart: false,
          loadingDone: true,
          loadingFail: true,
        })
      }, 2000)
      setTimeout(() => {
        this.setState({
          loadingDone: false,
          loadingShowFlag: true,
        });
      }, 4000);
    }

    // fail if one of the above fails
    this.setState({
      loadingFail: result?.some(item => item.includes('failure'))
    });
  }

  toastBadNet = () => {
    this.setState({
      loadingShowFlag: false,
    });
    Toast.hide();
    Toast.fail('連接速度慢，請稍後重試', 3, () => {
      this.setState({
        loadingShowFlag: true,
      });
    });
  }

  listenerCallback = () => {
    // if offline
    if (!this.isOnline()) {
      this.toastBadNet();
    }

    if (this.scrollTimer) {
      return;
    }

    const that = this;
    const { loadingShowFlag } = this.state;
    this.scrollTimer = true;
    setTimeout(() => {
      that.scrollTimer = false;
    }, 2000);

    if (loadingShowFlag) {
      this.updateProfileAndBalance();
    }
  }

  componentDidMount() {
    document.title = "01會員專區";
    if (this.props.auth.userInfo.memberToken !== "") {
      this.getBalance(this.props.auth.userInfo.memberToken);
    }
    //gtm
    if (window.sdk) {
      if (window.sdk.getPlatform() !== "web") {
        window.sdk.app.fireGtmEvent("PAGE_VIEW", {
          Content: "01會員專區",
          ContentType: "會員專區",
        });
      }
    }

    document.addEventListener("click", this.listenerCallback);
    document.addEventListener("touchmove", this.listenerCallback);
  }

  isOnline = () => {
    return navigator.onLine;
  }

  UNSAFE_componentWillReceiveProps(nextProps) {

    // deeplink 跳转的原生页面，每次点击 更改 system model 的 deepLink中的 timestamp 来增加定时器
    const { memberToken, isGeting, loginStatus } = nextProps.auth.userInfo;
    const { deepLink: { timestamp: timestampNext, type: deepLinkType } } = nextProps.system;
    const { deepLink: { timestamp: timestampPrev } } = this.props.system;
    const isLinkClicked = deepLinkType === 'deeplink' && timestampPrev !== timestampNext;
    const { loadingFail } = this.state;

    const updateInfo = isLoadingShow => {

      // if offline
      if (!this.isOnline()) {
        return;
      }

      // if getLoginStatus() timeout
      // setTimeout(() => {
      //   if (this.state.loadingShowFlag
      //     && !this.props.auth.userInfo.isGeting
      //     && nextProps.auth.userInfo.isGeting) {

      //     this.toastBadNet();
      //   }
      // }, badNetTimeout);

      //开始请求
      if (!this.props.auth.userInfo.isGeting && isGeting) {
        this.setState({
          loadingStart: true,
        });
      }

      //请求结束
      if (this.props.auth.userInfo.isGeting && !isGeting) {
        const that = this;
        this.setState(
          {
            loadingDone: true,
            loadingStart: false,
          },
          () => {
            setTimeout(() => {
              that.setState({
                loadingDone: false,
                loadingShowFlag: isLoadingShow || loadingFail,
              });
            }, 1000);
          }
        );
      }
      if (memberToken !== this.props.auth.userInfo.memberToken) {
        this.getBalance(memberToken);
      }
    }

    const that = this;

    // if logged in
    if (loginStatus === true) {

      // stop listening to login status
      if (this.loginStatusTimer) {
        clearInterval(this.loginStatusTimer);
        this.loginStatusTimer = null;
      }

      // if click on link
      if (isLinkClicked) {

        // Delay to show 'pull to refresh' hint
        setTimeout(() => {
          that.setState({
            loadingShowFlag: true,
            loadingStart: false,
            loadingDone: false,
          });
          updateInfo(true);
        }, refreshDelay);

      } else {
        updateInfo(false)
      }

    } else { // if not logged in

      // if click on link
      if (isLinkClicked) {
        if (this.loginStatusTimer) {
          clearInterval(this.loginStatusTimer);
          this.loginStatusTimer = null;
        }
        // Uncomment below block once confirmed by Lawrence
        // this.loginStatusTimer = setInterval(() => {
        //   this.updateProfileAndBalance();
        // }, this.intervalGetLoginStatus)
      }
    }
  }

  getBalance = async (token) => {
    const { data } = await queryBalances(token);
    if (data && data.balance_amount) {
      this.setState({
        pointNum: data.balance_amount,
      });
    }
    return typeof data.balance_amount !== 'undefined'
      ? 'success in getBalance'
      : 'failure in getBalance'
  };

  componentWillUnmount() {
    if (this.loginStatusTimer) {
      clearInterval(this.loginStatusTimer);
      this.loginStatusTimer = null;
    }
  }
  handleClick = () => {
    if (!this.isCanClick) {
      return;
    }
    this.isCanClick = false;
    setTimeout(() => {
      this.isCanClick = true;
    }, 1000);
    const { system } = this.props;
    const { userInfo } = this.props.auth;
    dataTrackerAction(
      {},
      { action: "click_member_info" },
      {
        item: "個人資料",
      }
    );
    if (system.platform === "web") {
      window.location.href = HK_API_ID + "://membership?action=login";
      return;
    }
    if (!userInfo.loginStatus) {
      const that = this;
      const loginCallback = () => {
        that.setState({
          loadingShowFlag: true,
          loadingStart: true,
        }, that.updateProfileAndBalance);
      };
      dataTrackerAction({ GA: false }, { action: "initiate_login" }, {});
      window.sdk.auth.login(window.location.href, loginCallback, {
        isBindPhoneRequired: true,
        campaign: "",
      });
    } else {
      if (system.platform !== "web") {
        this.props.dispatch({
          type: "system/deepLink",
          payload: {
            url: "://membership?action=profile",
            isCanEditInfo: true,
          },
        });
      }
    }
  };
  toIntroduce = () => {
    dataTrackerAction(
      {},
      { action: "click_member_info" },
      {
        item: "兌換教學",
      }
    );
    sessionStorage.introduceFromRecommend = true;
    this.props.history.push("/introduce");
  };
  toPoint = () => {
    if (!this.isCanClick) {
      return;
    }
    this.isCanClick = false;
    setTimeout(() => {
      this.isCanClick = true;
    }, 1200);
    dataTrackerAction(
      {},
      { action: "click_member_info" },
      {
        item: "我的積分",
      }
    );
    this.props.dispatch({
      type: "system/deepLink",
      payload: {
        url: "://point",
        isCanEditInfo: true,
      },
    });
  };
  render() {
    const { userInfo } = this.props.auth;
    const { loadingShowFlag, loadingDone, loadingStart, loadingFail } = this.state;
    let pointNum = 0;
    if (typeof this.state.pointNum === "number") {
      if (this.state.pointNum === 1000000) {
        pointNum = parseFloat(this.state.pointNum / 10000);
        pointNum = floorAndFixed(pointNum, 0);
        pointNum = thousandFormat(pointNum) + "萬";
      } else if (this.state.pointNum >= 1000000) {
        pointNum = parseFloat(this.state.pointNum / 10000);
        pointNum = floorAndFixed(pointNum, 1);
        pointNum = thousandFormat(pointNum) + "萬";
      } else {
        pointNum = thousandFormat(this.state.pointNum);
      }
    }
    if (userInfo && userInfo.name && userInfo.name.length > 16) {
      userInfo.name = userInfo.name.substr(0, 16);
    }

    return (
      <div
        className={["member-info", userInfo.loginStatus ? "s-login" : ""].join(
          " "
        )}
      >
        {loadingShowFlag ? (
          <p className="login-loading">
            <img
              className={["loading-img", userInfo.isGeting ? "turn" : ""].join(
                " "
              )}
              src={require("../../assets/img/loading_login.png")}
              alt="頭像"
            />
            {(loadingStart || userInfo.isGeting)
              ? "更新中"
              : loadingDone
                ? ((loadingFail || !navigator.onLine) ? "更新失敗，請稍後重試" : "成功更新")
              : "下拉頁面刷新"}
          </p>
        ) : null}
        <div
          className={[
            "m-user-wrap",
            userInfo.name.length <= 8 ? "head-short-name" : null,
            userInfo.loginStatus ? null : "head-no-login",
          ].join(" ")}
          onClick={this.handleClick}
        >
          <img className="head" src={userInfo.avatar} alt="頭像" />
          <div className={["name"].join(" ")}>
            {userInfo.loginStatus ? userInfo.name : "未登入"}
          </div>
          {userInfo.loginStatus ? (
            <div className="menber-level">基本會員</div>
          ) : null}
        </div>
        <p className="note s-login" onClick={this.toIntroduce}>
          01 會員兌換教學
        </p>
        {userInfo.loginStatus ? (
          <div className="point-txt" onClick={this.toPoint}>
            01積分
          </div>
        ) : (
          <div className="tip-txt-login">立即登入</div>
        )}
        {userInfo.loginStatus ? (
          <div className="point" onClick={this.toPoint}>
            {pointNum}
          </div>
        ) : (
          <div className="tip-txt-point">賺取01積分</div>
        )}
      </div>
    );
  }
}
export default withRouter(
  connect(({ auth, system }) => {
    return {
      system: system.toJS(),
      auth: auth.toJS(),
    };
  })(MemberInfo)
);
