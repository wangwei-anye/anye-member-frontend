import React from "react";
import { connect } from "dva";
import { Toast, ActivityIndicator, Modal } from "antd-mobile";
import Header from "@/components/Header";
import moment from "moment";
import AnswerMode from "./answermode";
import SingleMode from "./singlemode";

import styles from "./index.less";

const alert = Modal.alert;

@connect(({ promotion, system, auth }) => ({
  promotion: promotion.toJS(),
  system: system.toJS(),
  auth: auth.toJS(),
}))
export default class PromotionActivity extends React.Component {
  // NOTE: 声明两个属性并不赋予初始值, 当没通过谷歌验证的时候, 点击放回的时候会出现提示
  showGoogleVerifyDom;

  constructor() {
    super();
    this.state = {
      isLoaing: false,
      alertModal: false,
      // showGoogleVerifyDom: false,
      // googleVerifyFlag: false
    };
    this.firstRequestQuestionLogin = true;
    this.intervalId = "";
    this.wrapperElRef = React.createRef();
    this.scrollTopDom = React.createRef();
  }

  async componentDidMount() {
    const id = this.props.match.params.id;
    try {
      // 获得详情
      this.setState({
        isLoaing: true,
      });
      await this.props.dispatch({
        type: "promotion/getDetail",
        id,
      });

      this.intervalId = setInterval(() => {
        if (!this.props.auth.userInfo.isGeting) {
          this.dataTrackerDispatchView();
          clearInterval(this.intervalId);
        }
      }, 1000);

      // 404 活动不存在
      const { promotion } = this.props;
      if (promotion.netCode === 404) {
        this.props.history.replace(`/promotion/pad/${id}?exist=false`);
        return;
      }
      const { online_at: onlineAt } = promotion;
      // 是否预览
      if (this.props.system.query.isPreview !== "true") {
        // 判断 是否已经开始了以及是否已经上架
        if (promotion.status === 0 || promotion.status === 3) {
          // 未上架
          this.props.history.replace(`/promotion/pad/${id}?exist=false`);
          return;
        } else if (promotion.status === 2) {
          // 已下架
          this.props.history.replace(`/promotion/pad/${id}?isend=true`);
          return;
        }
        // 还没有到开始时间
        if (new Date(promotion.online_at.replace(/-/g, "/")) * 1 > Date.now()) {
          if (promotion.effective_time_section.length > 0) {
            this.props.history.replace(
              `/promotion/pad/${id}?isBegin=false&online_at=${promotion.effective_time_section[0].begin}`
            );
            return;
          }
          this.props.history.replace(
            `/promotion/pad/${id}?isBegin=false&online_at=${onlineAt}`
          );
          return;
        }
        let flag = false;
        let nextBeginTime = null;
        for (let i = 0; i < promotion.effective_time_section.length; i += 1) {
          if (
            moment(promotion.effective_time_section[i].begin).isBefore(
              Date.now()
            ) &&
            !moment(promotion.effective_time_section[i].end).isBefore(
              Date.now()
            )
          ) {
            flag = true;
          }
          if (
            !moment(promotion.effective_time_section[i].begin).isBefore(
              Date.now()
            )
          ) {
            if (!nextBeginTime) {
              nextBeginTime = promotion.effective_time_section[i].begin;
            }
            if (
              moment(promotion.effective_time_section[i].begin).isBefore(
                nextBeginTime
              )
            ) {
              nextBeginTime = promotion.effective_time_section[i].begin;
            }
          }
        }
        if (promotion.effective_time_section.length > 0 && !flag) {
          this.props.history.replace(
            `/promotion/pad/${id}?isBegin=false&online_at=${nextBeginTime}`
          );
          return;
        }

        // 已经到了下架时间
        if (
          new Date(promotion.offline_at.replace(/-/g, "/")) * 1 <
          Date.now()
        ) {
          this.props.history.replace(`/promotion/pad/${id}?isend=true`);
          return;
        }
      }

      if (promotion.activity_type === 2) {
        const { memberApplicationServiceToken } = this.props.auth.userInfo;
        // 已经获取完登陆态
        if (!!memberApplicationServiceToken && this.firstRequestQuestionLogin) {
          this.firstRequestQuestionLogin = false;
          await this.props.dispatch({
            type: "promotion/getQuestionInfo_login",
            payload: {
              id: id,
              headerToken: memberApplicationServiceToken,
            },
          });
        } else {
          await this.props.dispatch({
            type: "promotion/getQuestionInfo",
            id,
          });
        }
      }
      this.setState({
        isLoaing: false,
      });
    } catch (error) {
      Toast.info("活動獲取失敗", 3, () => {
        this.props.history.replace(`/promotion/pad/${id}?exist=false`);
        return;
      });
    }
  }

  async UNSAFE_componentWillReceiveProps(nextProps) {
    const { memberApplicationServiceToken } = nextProps.auth.userInfo;
    const id = this.props.match.params.id;
    //初始化（组件先创建，后获取到登陆态）

    const { promotion } = this.props;
    if (
      promotion.activity_type === 2 &&
      this.firstRequestQuestionLogin &&
      memberApplicationServiceToken !==
        this.props.auth.userInfo.memberApplicationServiceToken &&
      !!memberApplicationServiceToken
    ) {
      this.firstRequestQuestionLogin = false;
      await this.props.dispatch({
        type: "promotion/getQuestionInfo_login",
        payload: {
          id: id,
          headerToken: memberApplicationServiceToken,
        },
      });
    }
  }

  dataTrackerDispatchView = () => {
    const { promotion } = this.props;
    // 数据埋点判断 start
    let statusText = "started";
    if (promotion.netCode !== 404) {
      if (new Date(promotion.online_at.replace(/-/g, "/")) * 1 > Date.now()) {
        statusText = "not_yet_started";
      }
      if (
        new Date(promotion.offline_at.replace(/-/g, "/")) * 1 < Date.now() ||
        promotion.status === 2
      ) {
        statusText = "finished";
      }
    }
    const postData = {};
    if (promotion.activity_type === 2) {
      postData.activity_status =
        promotion.netCode !== 404 ? statusText : "not-exist";
    } else {
      postData.offer_type =
        promotion.preferential_type === 1 ? "coupon" : "point";
      postData.offer_content = promotion.preferential_sku;
    }
    this.props.dispatch({
      type: "promotion/dataTrackerDispatch",
      payload: {
        category:
          promotion.activity_type === 2
            ? "01infinity_welcome_activity"
            : "01infinity_welcome_offer",
        action: "view",
        data: postData,
      },
    });
    // 数据埋点 end
  };

  componentWillUnmount() {
    this.firstRequestQuestionLogin = true;
    if (window.sessionStorage) {
      if (window.sessionStorage.getItem("questionInfo")) {
        window.sessionStorage.removeItem("questionInfo");
      }
    }
  }

  scrollToTop = () => {
    // 获取元素; 滚动到顶部
    const { current } = this.wrapperElRef;
    if (current) {
      if (current.scrollTo) {
        current.scrollTo(0, 0);
      } else if (current.scrollByLines) {
        // IOS 10-
        current.scrollByLines(-1000);
      } else {
        const { current } = this.scrollTopDom;
        if (current && current.scrollIntoView()) {
          current.scrollIntoView();
        }
      }
    }
  };

  getGoogleVerifyStatus = (showGoogleVerifyDom) => {
    this.showGoogleVerifyDom = showGoogleVerifyDom;
  };

  renderMode = () => {
    const { nav_title, ...resetProps } = this.props.promotion;
    document.title = nav_title;
    let activityInfo = resetProps;
    // 活动类型1-精简类型; 2-答题类型
    if (!activityInfo.activity_type) {
      return;
    }
    if (+activityInfo.activity_type === 2) {
      return (
        <AnswerMode
          activityInfo={activityInfo}
          scrollToTop={this.scrollToTop}
          onAlert={this.alertModalChange}
        />
      );
    }
    return (
      <SingleMode
        googleVerifyStatusChange={this.getGoogleVerifyStatus}
        activityInfo={this.props.promotion}
        scrollToTop={this.scrollToTop}
        alertModalChange={this.alertModalChange}
      />
    );
  };

  alertModalChange = async (open) => {
    const html = document.documentElement;
    const body = document.body;
    if (open) {
      html.style["overflow"] = "hidden";
      html.style["position"] = "fixed";
      body.style["overflow"] = "hidden";
    } else {
      html.style["overflow"] = "auto";
      body.style["overflow"] = "auto";
      html.style["position"] = "static";
    }
    await this.setState({
      alertModal: open,
    });
  };

  handleHeaderBack = (next) => {
    if (this.showGoogleVerifyDom) {
      this.alertModalChange(true);
      alert("提示", "離開頁面便不能繼續領獎程序", [
        {
          text: "確認離開",
          onPress: () => {
            // 关闭 webview
            setTimeout(() => {
              window.sdk.app.dismissWebview();
            }, 0);
            setTimeout(() => {
              window.sdk.app.dismissWebview();
            }, 10);
            setTimeout(() => {
              window.sdk.app.dismissWebview();
            }, 20);
          },
        },
        {
          text: "繼續領獎",
          onPress: () => {
            this.alertModalChange(false);
          },
        },
      ]);
    } else {
      next && next();
    }
  };

  render() {
    const {
      background_color,
      rule_description,
      ...resetProps
    } = this.props.promotion;
    const textShow = rule_description || "";
    const result = textShow.split(/\r\n|[\r\n]/);
    const mainStyle = {};
    if (this.state.alertModal) {
      mainStyle.overflowY = "hidden";
    } else {
      mainStyle.overflowY = "scroll";
    }
    const backgroundUrl = resetProps.background_reward_image;
    return (
      <React.Fragment>
        <Header
          hideMessage={true}
          title={resetProps.nav_title}
          onBack={this.handleHeaderBack}
        />
        <div
          className={styles.wrap}
          style={{
            backgroundImage: `url(${backgroundUrl})`,
          }}
        >
          <div
            className={styles.main}
            ref={this.wrapperElRef}
            style={mainStyle}
          >
            <div ref={this.scrollTopDom} />
            {this.state.isLoaing ? (
              <div
                style={{
                  display: "flex",
                  flex: 1,
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  minHeight: "100vh",
                }}
              >
                <ActivityIndicator size="large" />
              </div>
            ) : (
              <React.Fragment>
                <div className={styles.mode}>{this.renderMode()}</div>
                <div className={styles.rules}>
                  <h5 className={styles.title}>- 活動條件及細則 -</h5>
                  <div className={styles.content}>
                    {result.map((item, index) => (
                      <p key={index} className={styles.rule}>
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
              </React.Fragment>
            )}
          </div>
        </div>
      </React.Fragment>
    );
  }
}
