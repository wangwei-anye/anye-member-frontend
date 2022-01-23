/* eslint-disable no-script-url */
import React from "react";
import PropTypes from "prop-types";
import { connect } from "dva";
import { withRouter } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { Toast, ActivityIndicator } from "antd-mobile";
import { getRedeemCouponRequest, verifyGoogleToken } from "@/services/index";
import { WEB_JS_SDK } from "@/constants";
import styles from "./singlemode.less";
import * as tools from "@/utils/tools";
import { Google_Site_Key } from "../../constants";

const defaultImg = require("@/assets/img/placeholder.png");

@withRouter
@connect(({ system, auth, promotion }) => ({
  promotion: promotion.toJS(),
  system: system.toJS(),
  auth: auth.toJS(),
}))
export default class SingleMode extends React.Component {
  static propTypes = {
    activityInfo: PropTypes.object.isRequired,
    scrollToTop: PropTypes.func.isRequired,
    googleVerifyStatusChange: PropTypes.func.isRequired,
    alertModalChange: PropTypes.func.isRequired,
  };

  state = {
    isToBindPhone: false,
    status: 0, // 领取阶段
    imgErr: false,
    isShowHandTip: false, // 是否显示手指提示,
    mainTitle: "",
    showContinueTip: true,
    disableSubmitBtn: false,
  };

  showGoogleVerifyDom = false;
  googleVerifyExpired = false;
  googleVerifyFlag = false;
  disableSubmitBtn = false;
  key = "";
  // NOTE: 定时检查 google 的图片验证器弹出层是否弹出
  timer;
  disabledPageScorllFlag = false;
  googleImageVerifyFloatEl;

  UNSAFE_componentWillMount() {
    const { main_title } = this.props.activityInfo;
    this.setState({ mainTitle: main_title });
    this.checkIsShowGoogleVerifier();
  }

  componentDidMount() {
    // NOTE: 进入这个组件, 会自动滚动到顶部
    const { scrollToTop } = this.props;
    scrollToTop();
    this.renderHandTipShow();
    this.googleVerifyEl = React.createRef();
    console.log(`[ Init showGoogleVerifyDom : ${this.showGoogleVerifyDom}]`);
    console.log(`[ Init googleVerifyFlag : ${this.googleVerifyFlag}]`);
  }

  componentWillUnmount() {
    this.googleImageVerifyFloatEl = null;
    this.showGoogleVerifyDom = false;
    this.googleVerifyExpired = false;
    this.googleVerifyFlag = false;
    this.disableSubmitBtn = false;
    this.key = "";
    if (this.timer) {
      clearInterval(this.timer);
    }
    if (this.timeout) {
      clearInterval(this.timeout);
      this.timeout = null;
    }
    if (this.appSdkTimer) {
      clearInterval(this.appSdkTimer);
      this.appSdkTimer = null;
    }
  }

  handleGoogleVerifierChange = async (token) => {
    console.log(`[ Start Google Verifier Change ]`);
    this.scrollToTop();
    this.disablePageScroll(false);
    this.disabledPageScorllFlag = false;
    this.googleVerifyExpired = false;
    const { auth } = this.props;
    Toast.loading();
    const { data } = await verifyGoogleToken(
      token,
      auth.userInfo.memberApplicationServiceToken
    );
    Toast.hide();
    this.showGoogleVerifyDom = true;
    if (data.code === 200) {
      if (this.timer) {
        clearInterval(this.timer);
      }
      this.key = token;
      this.disableSubmitBtn = false;
      this.googleVerifyFlag = true;
      this.forceUpdate();
      return;
    }
    this.googleVerifyFlag = false;
    this.disableSubmitBtn = true;
    this.key = "";
    Toast.info("驗證過期，請重新驗證");
    this.intervalTick();
    setTimeout(() => {
      if (this.googleVerifyEl && this.googleVerifyEl.current) {
        this.googleVerifyEl.current.reset();
      }
      this.forceUpdate();
    }, 0);
  };

  intervalTick = () => {
    // if (this.googleImageVerifyFloatEl) {
    //   return;
    // }
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      console.log(`[ tick: dom: ${this.googleImageVerifyFloatEl}]`);
      if (!this.showGoogleVerifyDom) {
        clearInterval(this.timer);
        this.timer = null;
        return;
      }
      if (!this.googleImageVerifyFloatEl) {
        const els = document.body.children;
        if (els.length === 0) {
          return;
        }
        const elList = Array.prototype.slice.call(els);
        const divList = elList.filter((el) => {
          if (el.className === "google-flex-center") {
            return el;
          }
          // NOTE: google 图片弹出层验证器 dom 节点特征; div 元素, id, className 为空 className , 有两个子元素; 且包含 iframe
          return (
            el &&
            el.tagName === "DIV" &&
            !el.id &&
            el.children.length === 2 &&
            /<iframe/g.test(el.outerHTML)
          );
        });
        if (divList.length !== 0) {
          this.googleImageVerifyFloatEl = divList.pop();
        }
      } else {
        console.log(`${this.googleImageVerifyFloatEl.style["visibility"]}`);
        // NOTE: 当谷歌的浮层弹出时
        if (this.googleImageVerifyFloatEl.style["visibility"] === "visible") {
          this.scrollToTop();
          if (!this.disabledPageScorllFlag) {
            this.disablePageScroll(true);
            this.disabledPageScorllFlag = true;
          }
        } else {
          if (this.disabledPageScorllFlag) {
            this.disablePageScroll(false);
            this.scrollToTop();
            this.disabledPageScorllFlag = false;
          }
        }
      }
    }, 100);
  };

  scrollToTop = () => {
    console.log("[ scroll to (0,0)]");
    var currentPosition;
    var speed = 5;
    if (tools.isIOS()) {
      currentPosition =
        document.documentElement.scrollTop || document.body.scrollTop;
      currentPosition -= speed;
      window.scrollTo(0, currentPosition); //页面向上滚动
      currentPosition += speed;
      window.scrollTo(0, currentPosition); //页面向下滚动
    }
  };

  disablePageScroll = (open) => {
    this.props.alertModalChange(open);
  };

  hanleGoogleVerifierExpired = async (e) => {
    console.log("[ Google Verifier Expired ]");
    this.disabledPageScorllFlag = false;
    this.showGoogleVerifyDom = true;
    this.googleVerifyFlag = false;
    this.googleVerifyExpired = true;
    this.key = "";
    this.googleVerifyEl.current.reset();
    this.disablePageScroll(false);
    this.intervalTick();
    this.forceUpdate();
  };

  hanleGoogleVerifierError = () => {
    console.log("[ Google Verifier Error ]");
    this.key = "";
    this.disabledPageScorllFlag = false;
    this.props.disablePageScroll(false);
    this.googleVerifyEl.current.reset();
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    // this.renderHandTipShow()
    const { userInfo } = nextProps.auth;
    if (
      this.props.auth.userInfo.isGeting !== userInfo.isGeting &&
      userInfo.loginStatus &&
      !userInfo.isGeting
    ) {
      if (window.sessionStorage) {
        let questionInfo = window.sessionStorage.getItem("questionInfo");
        if (questionInfo) {
          questionInfo = JSON.parse(questionInfo);
          if (+questionInfo.activity_id === +this.props.activityInfo.id) {
            this.props.dispatch({
              type: "promotion/postQuestionAnswer",
              payload: questionInfo,
            });
          }
        }
      }
    }
  }

  handleNext = async () => {
    const { activityInfo } = this.props;
    const { userInfo } = this.props.auth;
    if (userInfo.isGeting) {
      return;
    }

    // 登录校验，如果未登录跳转登录
    if (!userInfo.loginStatus) {
      this.setState({ isToBindPhone: false });
      window.eggSdk.auth.login(window.location.href, this.onAppSdk, {
        isBindPhoneRequired: true,
        campaign: "01infinity_welcome_activity",
      });
      return;
    }
    // 绑定手机校验，如果没有绑定手机则跳转绑定手机
    if (!userInfo.isBindPhone) {
      this.setState({ isToBindPhone: true });
      window.sdk.auth.bindPhone(window.location.href, this.onAppSdk, {
        campaign: "01infinity_welcome_activity",
      });
      return;
    }
    // 请求token是否存在，如果不存在提示错误
    if (!userInfo.memberApplicationServiceToken) {
      Toast.info("獲取 memberApplicationServiceToken 失敗！");
      return;
    }
    let resultUrl = "://coupon/home/coupons"; // 默认优惠券
    const {
      preferential_type,
      preferential_sku,
      send_time_status,
    } = activityInfo;
    // if (preferential_type === 2) {
    //   // preferential_type（1优惠券，2积分）
    //   resultUrl = "https://hk01.app.link/9Uxb4kSEV1";
    // }
    if (this.state.status === 0) {
      // 领取逻辑
      if (this.disableSubmitBtn) {
        return Toast.info("請先完成驗證後領取獎賞");
      }
      await this.receiveCoupone();
    } else {
      this.props.dispatch({
        type: "promotion/dataTrackerDispatch",
        payload: {
          category: "01infinity_welcome_offer",
          action: "click_redirect",
          data: {
            offer_type: preferential_type === 1 ? "coupon" : "point",
            offer_content: preferential_sku,
            click_text: preferential_type === 2 ? "我的積分" : "我的優惠券",
          },
        },
      });
      if (this.state.status === 1 && send_time_status === 0) {
        if (preferential_type === 2) {
          // preferential_type（1优惠券，2积分）
          window.location.href = "https://hk01.app.link/9Uxb4kSEV1";
        } else {
          // 跳轉APP其他頁面
          this.props.dispatch({
            type: "system/deepLink",
            payload: {
              url: `${resultUrl}`,
            },
          });
        }
      } else {
        window.location.href = "https://hk01.app.link/GJqEgANEV1";
      }
    }
  };

  receiveCoupone = async () => {
    if (this.state.submiting) {
      return false;
    }
    const { activityInfo } = this.props;
    const { preferential_type, preferential_sku } = activityInfo;
    this.props.dispatch({
      type: "promotion/dataTrackerDispatch",
      payload: {
        category: "01infinity_welcome_offer",
        action: "click_redeem",
        data: {
          offer_type: preferential_type === 1 ? "coupon" : "point",
          offer_content: preferential_sku,
        },
      },
    });
    await this.setState({ submiting: true });
    let leave = false;
    try {
      // 领取请求
      const { data, err } = await getRedeemCouponRequest({
        id: this.props.activityInfo.id,
        g_recaptcha_response: this.key,
        headerToken: this.props.auth.userInfo.memberApplicationServiceToken,
      });
      if (err) {
        // http错误
        Toast.info("抱歉，您的網絡信號較差", 5);
        const { redeem_fail_title: redeemFailTitle } = this.props.activityInfo;
        await this.setState({ mainTitle: redeemFailTitle, status: 2 });
      }
      if (data && data.code === 200) {
        this.submitSuccess();
        await this.setState({ mainTitle: "獎賞發放中", status: 1 });
        // NOTE: 延迟发放且领取成功
        const {
          send_time_status,
          delay_time,
          preferential_type,
        } = this.props.activityInfo;
        if (send_time_status === 1) {
          let btnText = preferential_type === 2 ? "我的積分" : "我的優惠券";
          let msg = `獎賞將於 ${delay_time} 天後發放到您的賬戶, 屆時請到 「${btnText}」查看`;
          Toast.info(msg, 5);
        }
      } else if (data && data.code === 800) {
        this.submitFail();
        Toast.info(data.message, 5);
        const { redeem_fail_title: redeemFailTitle } = this.props.activityInfo;
        await this.setState({ mainTitle: redeemFailTitle, status: 2 });
      } else if (data && data.code === 801) {
        this.submitFail();
        const { nav_title: navTitle, id } = this.props.activityInfo;
        this.props.history.push(
          `/promotion/pad/${id}?isend=true&title=${navTitle}`
        );
        leave = true;
      } else {
        this.submitFail();
        Toast.info(data.message, 5);
        await this.setState({ status: 2 });
      }
    } catch (error) {
      this.submitFail();
      // 請求錯誤提示
      console.log(error);
    } finally {
      if (!leave) {
        await this.setState({ submiting: false });
      }
    }
  };

  submitSuccess = () => {
    const { activityInfo } = this.props;
    const { preferential_type, preferential_sku } = activityInfo;
    this.props.dispatch({
      type: "promotion/dataTrackerDispatch",
      payload: {
        category: "01infinity_welcome_offer",
        action: "view_redeem_status",
        data: {
          status: "succeed",
          offer_type: preferential_type === 1 ? "coupon" : "point",
          offer_content: preferential_sku,
        },
      },
    });
  };

  submitFail = () => {
    const { activityInfo } = this.props;
    const { preferential_type, preferential_sku } = activityInfo;
    this.props.dispatch({
      type: "promotion/dataTrackerDispatch",
      payload: {
        category: "01infinity_welcome_offer",
        action: "view_redeem_status",
        data: {
          status: "failed",
          offer_type: preferential_type === 1 ? "coupon" : "point",
          offer_content: preferential_sku,
        },
      },
    });
  };

  onAppSdk = () => {
    const { isToBindPhone } = this.state;
    this.appSdkTimer = null;
    this.appSdkTimer = setTimeout(
      () => {
        this.props.dispatch({
          type: "auth/getLoginStatus",
          payload: {},
        });
      },
      isToBindPhone ? 1500 : 1
    );
  };

  renderHandTipShow() {
    const { userInfo } = this.props.auth;
    if (!userInfo.loginStatus && !userInfo.isGeting) {
      this.setState({
        isShowHandTip: true,
      });
      this.timeout = null;
      this.timeout = setTimeout(() => {
        this.setState({
          isShowHandTip: false,
        });
      }, 5000);
    }
  }

  checkIsShowGoogleVerifier() {
    const {
      userInfo: { isGeting, loginStatus, isBindPhone },
    } = this.props.auth;
    const { status } = this.state;
    if (
      !isGeting &&
      loginStatus &&
      isBindPhone &&
      !this.googleVerifyFlag &&
      status === 0
    ) {
      this.showGoogleVerifyDom = true;
    }
  }

  renderBtn = () => {
    const { preferential_type } = this.props.activityInfo;
    // const prize = preferential_type === 1 ? "優惠券" : "積分";
    let btnText = "註冊並領取獎賞";
    const { isShowHandTip } = this.state;
    const { userInfo } = this.props.auth;
    //DEBUG:
    // userInfo.isGeting = false
    // userInfo.loginStatus = true
    // userInfo.isBindPhone = true
    let className = styles.btn;
    if (userInfo.isGeting) {
      btnText = this.renderActivityIndicator();
    } else if (userInfo.loginStatus) {
      // 已经登录
      btnText = "以手提電話號碼註冊並領取獎賞";
      if (userInfo.isBindPhone) {
        // 已经绑定手机
        btnText = "我同意以下活動條件並領取獎賞";
        this.props.googleVerifyStatusChange(this.showGoogleVerifyDom);
        if (this.state.status === 1) {
          this.showGoogleVerifyDom = false;
          this.disableSubmitBtn = false;
          const { send_time_status } = this.props.activityInfo;
          if (send_time_status === 1) {
            btnText = "即睇熱選獎賞";
          } else {
            btnText =
              preferential_type === 1
                ? `前往「我的優惠券」查閱`
                : "立即換購心水產品";
          }
        } else if (this.state.status === 2) {
          this.showGoogleVerifyDom = false;
          this.disableSubmitBtn = false;
          btnText = "即睇熱選獎賞";
        } else if (this.state.status === 0) {
          if (!this.googleVerifyFlag) {
            this.showGoogleVerifyDom = true;
            this.disableSubmitBtn = true;
            this.intervalTick();
            className = `${styles.btn} ${styles.disabled}`;
            // if (this.googleVerifyExpired) {
            //   btnText = "請進行人機驗證後領取積分"
            // }
          }
        }
      }
    }
    if (this.state.submiting) {
      btnText = "領取中...";
    }
    return (
      <React.Fragment>
        {this.showGoogleVerifyDom ? (
          <span className="google-recaptcha-box">
            <ReCAPTCHA
              hl="zh-TW"
              sitekey={Google_Site_Key}
              onChange={this.handleGoogleVerifierChange}
              onExpired={this.hanleGoogleVerifierExpired}
              onErrored={this.hanleGoogleVerifierError}
              ref={this.googleVerifyEl}
            />
            <a className="mark" onClick={this.interceptAClick}>
              ''
            </a>
            <i className="mark" onClick={this.interceptClick}></i>
          </span>
        ) : (
          ""
        )}
        <button className={className} onClick={this.handleNext}>
          {btnText}
          {isShowHandTip ? (
            <p className={styles.tip}>提示: 以手提電話號碼註冊方可獲得獎賞</p>
          ) : null}
        </button>
      </React.Fragment>
    );
  };

  // NOTE: 这个事件用解决透明层会穿透的问题; 防止触发下面的 a 标签的 click 事件
  interceptClick = (e) => {
    e.preventDefault();
    setTimeout(() => {
      console.log("我点击了");
    }, 350);
  };

  // NOTE: 这个事件用解决透明层会穿透的问题; 防止触发下面的 a 标签的 click 事件
  interceptAClick = (e) => {
    e.preventDefault();
    setTimeout(() => {
      console.log("我点击了");
    }, 350);
  };

  // 渲染 loading
  renderActivityIndicator() {
    return (
      <div style={{ textAlign: "center", margin: "5px auto", width: "32px" }}>
        <ActivityIndicator size="large" />
      </div>
    );
  }

  handleImgErr = (e) => {
    this.setState({
      imgErr: true,
    });
  };

  handleLinkOther = (e) => {
    if (e.target) {
      const target = e.target;
      const link = target.getAttribute("data-href");
      const host =
        WEB_JS_SDK === "production"
          ? "https://www.hk01.com"
          : "https://www.hktester.com";
      if (this.props.system.platform === "webview") {
        window.sdk.app.goTo(host + link);
      } else {
        window.location.href = host + link;
      }
    }
  };

  render() {
    const { mainTitle } = this.state;
    const {
      reward_description,
      reward_image,
      preferential_type,
    } = this.props.activityInfo;
    const titleList = tools.transMultiLine(mainTitle.replace("↵", "\n"));
    return (
      <div className={styles.wrap}>
        {titleList.map((t, index) => {
          return (
            <h3 key={index} className={styles.title}>
              {t}
            </h3>
          );
        })}
        <div className={styles.coupon}>
          <div className={styles.imgWrap}>
            <img
              className={styles.img}
              src={this.state.imgErr ? defaultImg : reward_image}
              onError={this.handleImgErr}
              alt={preferential_type === 1 ? "優惠券" : "積分"}
            />
          </div>
          <div className={styles.desc}>
            {tools.transMultiLine(reward_description).map((item, index) => {
              return <p key={index}>{item}</p>;
            })}
          </div>
          {/* <span className={`${styles.circle} ${styles.circleLeft}`} />
          <span className={`${styles.circle} ${styles.circleRight}`} /> */}
        </div>
        {this.renderBtn()}
      </div>
    );
  }
}
