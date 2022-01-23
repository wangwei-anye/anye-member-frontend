import React from "react";
import { connect } from "dva";
import Header from "@/components/Header";
import "./end.less";
import { Toast } from "antd-mobile";
import { dataTrackerAction } from "@/utils/tools";
import { getPackageInfoDetail, userPackageDetail } from "@/services/index";

class PointsPackageEnd extends React.Component {
  constructor(props) {
    super();
    this.state = {
      info: {},
    };
    this.appSdkTimer = null;
    this.isFirstFlag = true;
  }
  async componentDidMount() {
    document.title = "「香港01電子福袋」";
    const id = this.props.match.params.id;
    const {
      data: { data },
    } = await getPackageInfoDetail(id);
    this.setState({
      info: data,
    });
  }

  async UNSAFE_componentWillReceiveProps(nextProps) {
    const { memberApplicationServiceToken } = nextProps.auth.userInfo;
    if (
      memberApplicationServiceToken !==
        this.props.auth.userInfo.memberApplicationServiceToken &&
      !!memberApplicationServiceToken &&
      !this.isFirstFlag
    ) {
      this.checkOffer(memberApplicationServiceToken);
    }
  }

  checkOffer = async (memberApplicationServiceToken) => {
    const id = this.props.match.params.id;
    const {
      data: { data },
    } = await userPackageDetail(id, memberApplicationServiceToken);

    if (data && data.list.length > 0) {
      this.props.history.push(`/pointsPackageSuccess/${id}`);
    } else {
      Toast.info("您還沒有兌換權益包");
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

  gotoPath = async () => {
    const { auth } = this.props;
    const { userInfo } = this.props.auth;

    if (userInfo.isGeting) {
      return;
    }
    // 登录校验，如果未登录跳转登录
    if (!userInfo.loginStatus) {
      dataTrackerAction({ GA: false }, { action: "initiate_login" }, {});
      window.sdk.auth.login(window.location.href, this.onAppSdk, {
        isBindPhoneRequired: true,
        campaign: "",
      });
      return;
    }

    const id = this.props.match.params.id;
    const {
      data: { data },
    } = await userPackageDetail(
      id,
      auth.userInfo.memberApplicationServiceToken
    );

    if (data && data.list.length > 0) {
      this.props.history.push(`/pointsPackageSuccess/${id}`);
    } else {
      Toast.info("您還沒有兌換權益包");
    }
  };

  render() {
    const {
      copywriting_after_activity,
      navigation_title,
      package_name,
    } = this.state.info;
    return (
      <div className="p-right-end">
        <Header hideMessage={true} title={navigation_title} />
        <div className="title">{package_name}</div>
        <div className="des">活動完滿結束</div>
        <div className="txt">{copywriting_after_activity}</div>
        <button className="btn" onClick={this.gotoPath}>
          查看已兌換記錄
        </button>
      </div>
    );
  }
}
export default connect(({ system, auth }) => {
  return {
    system: system.toJS(),
    auth: auth.toJS(),
  };
})(PointsPackageEnd);
