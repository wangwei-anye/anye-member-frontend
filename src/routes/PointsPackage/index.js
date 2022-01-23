import React from "react";
import { connect } from "dva";
import Header from "@/components/Header";
import Tip from "@/components/Tip";
import "./index.less";
import ReCAPTCHA from "react-google-recaptcha";
import { Google_INVISIBLE_SITE_KEY } from "../../constants";
import { Toast } from "antd-mobile";
import { HK_API_ID } from "@/constants";
import { dataTrackerAction } from "@/utils/tools";
import {
  getPackageInfoDetail,
  verifyPackageRrobot,
  offer,
  userPackageDetail,
} from "@/services/index";

class PointsPackage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      id: 0,
      code: "",
      tipVisiable: false,
      tipTxt: "",
      isLongTip: false,
      captchaLoaded: false,
      isLoading: true,
      btnTxt: "輸入兌換",
      info: {},
      hasReceived: false,
      showGoogleVerifyDom: false,
    };
    this.isCanClick = true;
    this.lastGoogleToken = "";
    this.isPassReCAPTCHA = false;
    this.recaptchaRef = null;
    this.btnRef = null;
    this.isFirstFlag = true; //初始化請求到已經領取過權益包，要自動跳到詳情頁；手動去登陸就不能自動跳過去，要用戶點兌換再跳
  }
  async componentDidMount() {
    const query = this.props.system.query;
    const id = this.props.match.params.id;
    dataTrackerAction(
      {},
      { category: "promo_code_redemption", action: "view" },
      {
        activity_id: id,
        itm_source: query.itm_source ? query.itm_source : null,
        itm_campaign: query.itm_campaign ? query.itm_campaign : null,
        itm_medium: query.itm_medium ? query.itm_medium : null,
      }
    );
    this.setState({
      id,
    });
    document.title = "「香港01電子福袋」";
    const { data } = await getPackageInfoDetail(id);

    this.recaptchaRef = React.createRef();
    this.setState({
      showGoogleVerifyDom: true,
    });
    if (data.code === 200) {
      this.setState(
        {
          info: data.data,
        },
        () => {
          this.checkInitStatus();
        }
      );
    } else {
      this.props.history.push("/pointsPackageNotFound");
    }

    document.body.addEventListener("focusout", () => {
      window.scroll(0, 0);
    });
  }

  componentWillUnmount() {
    this.isCanClick = true;
    this.setState({
      showGoogleVerifyDom: false,
    });
  }

  async UNSAFE_componentWillReceiveProps(nextProps) {
    const { isGeting } = nextProps.auth.userInfo;
    const { memberApplicationServiceToken } = nextProps.auth.userInfo;
    //初始化（组件先创建，后获取到登陆态）
    if (
      isGeting !== this.props.auth.userInfo.isGeting &&
      !isGeting &&
      this.isFirstFlag &&
      !memberApplicationServiceToken
    ) {
      this.setState({
        isLoading: false,
      });
    }
    //初始化（组件先创建，后获取到登陆态）
    if (
      memberApplicationServiceToken !==
        this.props.auth.userInfo.memberApplicationServiceToken &&
      !!memberApplicationServiceToken &&
      this.isFirstFlag
    ) {
      this.checkOffer(memberApplicationServiceToken);
    }

    //登陸回萊
    if (
      memberApplicationServiceToken !==
        this.props.auth.userInfo.memberApplicationServiceToken &&
      !!memberApplicationServiceToken &&
      !this.isFirstFlag
    ) {
      this.checkOffer(memberApplicationServiceToken);
      this.setState({
        isLoading: false,
        btnTxt: "立刻兌換",
      });
    }
  }

  checkOffer = async (memberApplicationServiceToken) => {
    const {
      data: { data },
    } = await userPackageDetail(this.state.id, memberApplicationServiceToken);
    if (data && data.list.length > 0) {
      this.setState({
        hasReceived: true,
      });
    }
    this.setState({
      isLoading: false,
    });
  };

  checkInitStatus = async () => {
    if (
      this.state.info.front_status === 8 ||
      this.state.info.front_status === 1
    ) {
      this.props.history.push(`/pointsPackageStart/${this.state.id}`);
      return;
    } else if (this.state.info.front_status === 0) {
      this.props.history.push("/pointsPackageNotFound");
      return;
    } else if (
      this.state.info.front_status === 3 ||
      this.state.info.front_status === 4
    ) {
      this.props.history.push(`/pointsPackageEnd/${this.state.id}`);
      return;
    }

    const {
      isGeting,
      memberApplicationServiceToken,
    } = this.props.auth.userInfo;

    //初次进来  没有登陆（先获取到登陆态，组件后创建）
    if (!isGeting && this.isFirstFlag && !memberApplicationServiceToken) {
      this.setState({
        isLoading: false,
      });
    }
    //初次进来  已经登陆（先获取到登陆态，组件后创建）
    if (!!memberApplicationServiceToken) {
      this.checkOffer(memberApplicationServiceToken);
    }
  };

  gotoSuccess = () => {
    const id = this.props.match.params.id;
    dataTrackerAction(
      {},
      { category: "promo_code_redemption", action: "click_history" },
      { activity_id: id }
    );
    this.setState(
      {
        showGoogleVerifyDom: false,
      },
      () => {
        this.props.history.push(`/pointsPackageSuccess/${id}`);
      }
    );
  };

  changeCode = (code) => {
    this.setState({
      tipVisiable: false,
      code: code.replace(/(^\s*)|(\s*$)/g, ""),
    });
  };

  onSubmitHandler = (e) => {
    e.preventDefault();
    if (this.state.code === "") {
      this.setState({
        tipVisiable: true,
        isLongTip: false,
        tipTxt: "請輸入兌換碼",
      });
      return;
    }

    const { system } = this.props;
    if (system.platform === "web") {
      window.location.href = HK_API_ID + "://membership?action=login";
      return;
    }
    if (!!this.recaptchaRef.current.getValue()) {
      this.submit();
    } else {
      this.recaptchaRef.current.execute();
    }
  };

  onAppSdk = () => {
    this.isFirstFlag = false;
    this.appSdkTimer = null;
    this.appSdkTimer = setTimeout(() => {
      this.props.dispatch({
        type: "auth/getLoginStatus",
        payload: {},
      });
    }, 100);
  };

  submit = async () => {
    const activityId = this.props.match.params.id;
    const { auth } = this.props;
    const { userInfo } = this.props.auth;
    const token = this.recaptchaRef.current.getValue();
    if (!token) {
      return;
    }
    if (!this.isCanClick) {
      return;
    }
    this.isCanClick = false;

    if (token !== this.lastGoogleToken) {
      const { data } = await verifyPackageRrobot(token);
      if (data && data.code === 200) {
        //通过验证
        this.lastGoogleToken = token;
      } else {
        this.recaptchaRef.current.reset();
        this.lastGoogleToken = "";
        Toast.info("驗證失敗");
        this.isCanClick = true;
        return;
      }
    }
    if (userInfo.isGeting) {
      this.isCanClick = true;
      return;
    }
    // 登录校验，如果未登录跳转登录
    if (!userInfo.loginStatus) {
      dataTrackerAction(
        {},
        { category: "promo_code_redemption", action: "click_login" },
        { activity_id: activityId }
      );
      dataTrackerAction({ GA: false }, { action: "initiate_login" }, {});
      window.sdk.auth.login(window.location.href, this.onAppSdk, {
        isBindPhoneRequired: true,
        campaign: "",
      });
      this.isCanClick = true;
      return;
    }
    // 绑定手机校验，如果没有绑定手机则跳转绑定手机
    if (!userInfo.isBindPhone) {
      dataTrackerAction(
        {},
        { category: "promo_code_redemption", action: "click_bindphone" },
        { activity_id: activityId }
      );
      dataTrackerAction(
        { GA: false },
        { action: "initiate_phone_binding" },
        {}
      );
      window.sdk.auth.bindPhone(window.location.href, this.onAppSdk, {
        campaign: "",
      });
      this.isCanClick = true;
      return;
    }
    dataTrackerAction(
      {},
      { category: "promo_code_redemption", action: "confirm_redeem" },
      { activity_id: activityId }
    );

    try {
      const { data: offerData } = await offer(
        token,
        this.state.code,
        auth.userInfo.memberApplicationServiceToken,
        activityId
      );
      if (offerData && offerData.code && offerData.code === 200) {
        this.gotoSuccess();
      } else if (offerData && offerData.code && offerData.code === 90002) {
        Toast.info("無效兌換碼");
        this.isCanClick = true;
      } else if (offerData && offerData.code && offerData.code === 90003) {
        Toast.info("您已经兑换过了，请勿重复兑换");
        this.gotoSuccess();
      } else {
        Toast.info(offerData.message);
        this.isCanClick = true;
      }
    } catch (error) {
      this.isCanClick = true;
    }
  };

  onCaptchaLoaded = () => {
    this.setState({ captchaLoaded: true });
  };

  renderForm = () => {
    const { userInfo } = this.props.auth;
    return (
      <form onSubmit={this.onSubmitHandler}>
        {this.state.showGoogleVerifyDom ? (
          <ReCAPTCHA
            ref={this.recaptchaRef}
            size="invisible"
            sitekey={Google_INVISIBLE_SITE_KEY}
            onChange={(response) => {
              if (response) {
                this.submit();
              } else {
                this.recaptchaRef.current.execute();
              }
            }}
            asyncScriptOnLoad={this.onCaptchaLoaded}
          />
        ) : null}

        {this.state.tipVisiable ? (
          <div className="tip-box">
            <Tip isLongTip={this.state.isLongTip} txt={this.state.tipTxt}></Tip>
          </div>
        ) : null}
        <input
          type="text"
          placeholder="請輸入兌換碼"
          value={this.state.code}
          onChange={(e) => {
            this.changeCode(e.target.value);
          }}
          maxLength={32}
        ></input>
        <button
          ref={(btn) => (this.btnRef = btn)}
          className={"btn"}
          type="submit"
          data-badge="inline"
          disabled={!this.state.captchaLoaded}
        >
          {userInfo.loginStatus && !userInfo.isBindPhone && !userInfo.isGeting
            ? "綁定手機號碼以繼續兌換"
            : this.state.btnTxt}
        </button>
      </form>
    );
  };

  render() {
    const {
      home_page_title,
      navigation_title,
      package_activity_description,
    } = this.state.info;
    let home_page_title1 = "";
    let home_page_title2 = "";
    if (home_page_title) {
      const homePageArr = home_page_title.split("\n");
      if (homePageArr.length > 0) {
        home_page_title1 = homePageArr[0];
      }
      if (homePageArr.length > 1) {
        home_page_title2 = homePageArr[1];
      }
    }

    let desList = [];
    if (package_activity_description) {
      desList = package_activity_description.split("\n").map((item, index) => {
        return (
          <p className="note" key={index}>
            {item}
          </p>
        );
      });
    }

    return (
      <div className="p-right-wrap">
        <Header
          hideMessage={true}
          title={navigation_title}
          onBack={this.handleHeaderBack}
        />
        {this.state.isLoading ? (
          <div className="loading">
            <img
              className="icon"
              src={require("../../assets/img/loading.png")}
              alt=""
            ></img>
            <div className="txt">加載中，請稍候</div>
          </div>
        ) : null}
        <div className="g-main">
          <div className="m-title-wrap">
            <h2 className="title title1">{home_page_title1}</h2>
            {home_page_title2.length > 0 ? (
              <h2 className="title title2">{home_page_title2}</h2>
            ) : null}
          </div>
          <div className="m-form">{this.renderForm()}</div>
          {this.state.hasReceived ? (
            <div className="m-goto-history" onClick={this.gotoSuccess}>
              已兌換記錄<i className={"arrow"}></i>
            </div>
          ) : null}
          <div className="m-note">
            <p className="sub-title">- 活動說明 -</p>
            {desList}
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
})(PointsPackage);
