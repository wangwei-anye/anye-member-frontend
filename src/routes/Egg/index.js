import React from 'react'
import { connect } from 'dva'
import { Toast, ActivityIndicator } from 'antd-mobile'
import Header from '@/components/Header'
import { dataTrackerAction } from '@/utils/tools'
import { getDetailInfoRequest, getRedeemCouponRequest } from '@/services/index'
import { WEB_JS_SDK } from '@/constants'
import './index.less'

const defaultImg = require('@/assets/img/placeholder.png')
class EggPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isToBindPhone: false,
      detailInfo: {}, // 详情
      isSubmiting: false,
      hasSubmitRequest: false, // 是否已经提交了 导致的结果 领取成功 / 失败
      isGetSuccessfull: false // 是否领取成功
    }
    this.timer = null;
    this.intervalId = "";
  }
  async componentDidMount() {
    document.title = '迎新禮遇';

    this.intervalId = setInterval(() => {
      if(!this.props.auth.userInfo.isGeting){
        this.dataTracker('view', {});
        clearInterval(this.intervalId);
      }
    },1000);

    await this.fetchEggDetail();
  }
  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    Toast.hide()
  }
  // 获取详情
  async fetchEggDetail() {
    const { data } = await getDetailInfoRequest()
    if (data) {
      if (data.code === 200) {
        this.setState({
          detailInfo: data.data
        })
      }
    }
  }
  // 调用app的回调
  callAppCallBack = () => {
    if (this.state.isToBindPhone) {
      window.location.reload()
    } else {
      this.props.dispatch({
        type: 'auth/getLoginStatus',
        payload: {}
      })
    }
  }
  // 渲染 title
  renderTitle() {
    const { isGetSuccessfull, hasSubmitRequest } = this.state
    if (!hasSubmitRequest) {
      return (
        <React.Fragment>
          <h2 className="title">立即成為01會員</h2>
          <h2 className="title">即送迎新優惠券</h2>
        </React.Fragment>
      )
    }
    if (!isGetSuccessfull) {
      return (
        <React.Fragment>
          <h2 className="title">此迎新活動只適用於</h2>
          <h2 className="title">新登記會員</h2>
        </React.Fragment>
      )
    }
    return (
      <React.Fragment>
        <h2 className="title">成功領取</h2>
      </React.Fragment>
    )
  }
  // 渲染 button
  renderButton() {
    const { userInfo } = this.props.auth
    const { isSubmiting } = this.state
    let btnText = '登記並領取優惠券'
    if (userInfo.isGeting) {
      btnText = this.renderActivityIndicator()
    } else {
      if (userInfo.loginStatus && userInfo.isBindPhone) {
        btnText = isSubmiting ? '領取中...' : '立即領取優惠券'
      }
      if (userInfo.loginStatus && !userInfo.isBindPhone) {
        btnText = '綁定手機並領取優惠券'
      }
    }
    return (
      <React.Fragment>
        {userInfo.loginStatus ? null : (
          <div className="m-tip-wrap">
            <p className="title">使用手機號註冊以獲得最佳體驗</p>
          </div>
        )}
        <button className="btn" onClick={this.submit} disabled={isSubmiting}>
          {btnText}
        </button>
      </React.Fragment>
    )
  }
  // 渲染 loading
  renderActivityIndicator() {
    return (
      <div style={{ textAlign: 'center', margin: '5px auto', width: '32px' }}>
        <ActivityIndicator size="large" />
      </div>
    )
  }
  // 提交
  submit = async () => {
    // Toast.info("獎賞將於X天後發放到您的賬戶，屆時請到「我的積分」查看");
    // return;
    const { userInfo } = this.props.auth
    const { isSubmiting, detailInfo } = this.state
    if (userInfo.isGeting) {
      return
    }
    if (!detailInfo.id) {
      Toast.fail('活動id獲取失敗！')
      return
    }
    if (isSubmiting) {
      return
    }
    this.dataTracker('click_redeem');
    if (!userInfo.loginStatus) {
      this.dataTracker('initiate_login', {}, { GA: false }, true)
      window.eggSdk.auth.login(window.location.href, this.callAppCallBack, {
        isBindPhoneRequired: true,
        campaign: '01infinity_welcome_offer'
      })
      return
    }
    if (!userInfo.isBindPhone) {
      this.setState({
        isToBindPhone: true
      })
      this.dataTracker('initiate_login', {}, { GA: false }, true)
      window.sdk.auth.bindPhone(window.location.href, this.callAppCallBack, {
        campaign: '01infinity_welcome_offer'
      })
      return
    }
    if (!userInfo.memberApplicationServiceToken) {
      Toast.fail('獲取 memberApplicationServiceToken 失敗！')
      return
    }
    this.setState({
      isSubmiting: true
    })

    const { data } = await getRedeemCouponRequest({
      id: detailInfo.id,
      headerToken: userInfo.memberApplicationServiceToken
    })
    if (data && data.code) {
      this.setState({
        isSubmiting: false,
        hasSubmitRequest: true,
        isGetSuccessfull: data.code === 200
      })
      const dataInfo = {
        status: data.code === 200 ? 'succeed' : 'failed',
        failure_msg: data.code === 200 ? null : '只適用於新登記之會員'
      }
      this.dataTracker('view_redeem_status', dataInfo)
    } else {
      Toast.fail((data && data.message) || '請求有誤！')
      this.setState({
        isSubmiting: false
      })
    }
  }
  // 处理领取之后的点击事件，去优惠券 or 01无限
  handleGetResultClick = () => {
    const { isGetSuccessfull } = this.state
    this.dataTracker('click_redirect', {
      click_text: isGetSuccessfull ? '前往我的優惠劵' : '返回APP首頁'
    })
    const url = isGetSuccessfull
      ? '://coupon/home/coupons'
      : '://menu?name=推薦'
    this.props.dispatch({
      type: 'system/deepLink',
      payload: {
        url
      }
    })
  }
  // 点击 返回
  handleHeaderBack = () => {
    this.dataTracker('back')
  }
  // 数据上报
  dataTracker(action, data = {}, GAAndPiwik = {}, isNeedDefaultValue = false) {
    const { detailInfo } = this.state
    dataTrackerAction(
      GAAndPiwik,
      { category: '01infinity_welcome_offer', action },
      isNeedDefaultValue
        ? data
        : Object.assign(
            {},
            {
              offer_id: detailInfo.preferential_sku || null,
              offer_title: '優惠券'
            },
            data
          ),
        'member_egg_2019'
    )
  }
  handleImgError = e => {
    e.target.src = defaultImg
  }
  handleLinkOther = e => {
    if (e.target) {
      const target = e.target
      const link = target.getAttribute('data-href')
      const host =
        WEB_JS_SDK === 'production'
          ? 'https://www.hk01.com'
          : 'https://www.hktester.com'
      if (this.props.system.platform === 'webview') {
        window.sdk.app.goTo(host + link)
      } else {
        window.location.href = host + link
      }
    }
  }
  render() {
    const {
      isSubmiting,
      isGetSuccessfull,
      hasSubmitRequest,
      detailInfo
    } = this.state
    return (
      <div className="p-egg-wrap">
        <Header
          hideMessage={true}
          title="迎新禮遇"
          onBack={this.handleHeaderBack}
        />
        <div className="g-main">
          <div className="m-title-wrap">{this.renderTitle()}</div>
          <div className="m-gift">
            <img
              src={
                detailInfo.reward_image ? detailInfo.reward_image : defaultImg
              }
              onError={this.handleImgError}
              alt=""
              className="img"
            />
          </div>
          <div className="m-form">
            <div className="btn-wrap">
              {!hasSubmitRequest ? (
                this.renderButton()
              ) : (
                <button
                  className="btn"
                  onClick={this.handleGetResultClick}
                  disabled={isSubmiting}
                >
                  {!isGetSuccessfull ? '返回APP首頁' : '前往我的「優惠券」'}
                </button>
              )}
            </div>
          </div>
          {hasSubmitRequest ? null : (
            <div className="m-statement">
              <p className="statement-item">
                繼續即表示你同意登記成為01會員及接受香港01的「私隱聲
                明」、使用條款及細則及以下活動條件
              </p>
              <p className="statement-item">
                私隱聲明:
                <span
                  onClick={this.handleLinkOther}
                  className="link"
                  data-href="/privacy"
                >
                  https://www.hk01.com/privacy
                </span>
              </p>
              <p className="statement-item">
                使用條款及細則:
                <span
                  className="link"
                  onClick={this.handleLinkOther}
                  data-href="/terms"
                >
                  https://www.hk01.com/terms
                </span>
              </p>
            </div>
          )}
          <div className="m-note">
            <p className="sub-title">- 活動條件及細則 -</p>
            <p className="note">
              1.
              迎新禮遇活動只適用於活動期內首次成功登記為01會員之用戶，以香港01系統紀錄為準。
            </p>
            <p className="note">
              2.
              參加迎新禮遇的新01會員必須以香港手提電話號碼登記並綁定至01會員帳戶內。
            </p>
            <p className="note">
              3. 每位首次登記成為新01會員後只能於本活動領取一張指定優惠券。
            </p>
            <p className="note">
              4.
              首次成功登記成為01會員後，優惠券會自動傳入至使用該香港手提電話號碼登記的01會員帳
              戶內。
            </p>
            <p className="note">
              5.
              迎新禮遇活動內獲取的優惠券由合作夥伴發行，香港01並非產品供應商及不會對此產品的質量作出任何保證。香港01將不會就此產品的任何方面承擔任何責任，亦不會就01會員或任何其他人因產品引致的任何損失而承擔任何責任。
            </p>
            <p className="note">
              6.
              此迎新禮遇活動獲取的優惠券不能交換、轉讓，亦不可兌換現金、現金等值利益或其他產品、退換、轉售或作任何商業用途，並受有關優惠券發行人所訂定之條款及細則約束。如就使用該優惠券有任何爭議，優惠券發行人保留最終決定權。
            </p>
            <p className="note">
              7.
              如有任何有關登記成為01會員的疑問，請電郵至membership@hk01.com查詢。
            </p>
          </div>
        </div>
      </div>
    )
  }
}
export default connect(({ system, auth }) => {
  return {
    system: system.toJS(),
    auth: auth.toJS()
  }
})(EggPage)
