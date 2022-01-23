//  商城
import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "dva";
import { dataTrackerAction } from "@/utils/tools";
import "./index.less";

const deeplinkJson = {
  message: "://tab?name=通知中心&label=社交",
  setting: "://membership?action=profile"
};
class Header extends React.Component {
  constructor(props) {
    super(props);
    this.isCanClick = true;
  }

  componentDidMount() {
    if (
      document.referrer.substring(0, 35) !==
      window.location.origin.substring(0, 35)
    ) {
      localStorage.hk01Referrer = document.referrer;
    }
  }

  doBack = () => {
    const { platform, pathname } = this.props.system;
    if (this.props.isRecommend) {
      //01无线专区
      if (platform !== "web") {
        if (!localStorage.hk01Referrer) {
          window.sdk.app.dismissWebview();
        } else {
          this.props.history.go(-1);
        }
      } else {
        this.props.history.go(-1);
      }
    } else if (pathname === "/introduce") {
      if (platform !== "web") {
        //01无限进来的  后退。原生页面进来的 关闭
        if (sessionStorage.introduceFromRecommend) {
          sessionStorage.introduceFromRecommend = false;
          this.props.history.go(-1);
        } else {
          window.sdk.app.dismissWebview();
        }
      } else {
        this.props.history.go(-1);
      }
    } else {
      //其他
      if (platform !== "web") {
        setTimeout(() => {
          window.sdk.app.dismissWebview();
        }, 0);
        setTimeout(() => {
          window.sdk.app.dismissWebview();
        }, 10);
        setTimeout(() => {
          window.sdk.app.dismissWebview();
        }, 20);
      } else {
        this.props.history.go(-1);
      }
    }
  };

  handleBack = () => {
    if (this.props.onBack && typeof this.props.onBack === "function") {
      this.props.onBack(() => {
        this.doBack();
      });
    } else {
      this.doBack();
    }
  };

  handleDeeplinkClick = type => {
    if (!this.isCanClick) {
      return;
    }
    this.isCanClick = false;
    setTimeout(() => {
      this.isCanClick = true;
    }, 1200);
    dataTrackerAction({}, { action: "click_in_app_noti" }, {});
    this.props.dispatch({
      type: "system/deepLink",
      payload: {
        url: deeplinkJson[type]
      }
    });
  };

  render() {
    const headerTitle = this.props.title;
    const isHideMessage = this.props.hideMessage;
    return (
      <div className="header fixed">
        {headerTitle}
        <img
          className="icon icon-return"
          src={
            this.props.icon
              ? this.props.icon
              : require("@/assets/img/icon_return.png")
          }
          alt="返回"
          onClick={this.handleBack}
        />
        {isHideMessage ? null : (
          <img
            className="icon icon-message"
            src={require("@/assets/img/icon_message.png")}
            alt="通知"
            onClick={this.handleDeeplinkClick.bind(this, "message")}
          />
        )}
        {/* {isHideMessage ? null : (
          <img
            className="icon icon-setting"
            src={require("@/assets/img/icon_setting.png")}
            alt="設置"
            onClick={this.handleDeeplinkClick.bind(this, "setting")}
          />
        )} */}
      </div>
    );
  }
}
export default withRouter(
  connect(({ system }) => {
    return {
      system: system.toJS()
    };
  })(Header)
);
