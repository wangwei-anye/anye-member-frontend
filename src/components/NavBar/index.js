//  商城
import React from "react";
import { connect } from "dva";
import { dataTrackerAction } from "@/utils/tools";
import "./index.less";

class NavBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      navBarList: [
        // {
        //   name: '我的積分',
        //   type: 'deeplink',
        //   deepLink: '://point',
        //   icon: require('@/assets/img/iconScore@2x.png')
        // },
        {
          name: "我的優惠券",
          type: "deeplink",
          deepLink: "://coupon/home/coupons",
          icon: require("@/assets/img/iconCoupon.png"),
        },
        {
          name: "我的訂單",
          type: "deeplink_web",
          deepLink:
            process.env.ENV !== "production"
              ? // ? "https://shopnet.ddtester.com/m/transfer/-order-list-all"
                "https://01mall.ddtester.com/transfer?site_type=shopnet&redirect_uri=https%3A%2F%2F01mall.ddtester.com%2Forder%2Flist%2Fall&client_id=6d136024d684ad43e0b3835563f46240&referer=https%3A%2F%2Fhk01-member-frontend.hktester.com%2Frecommend&referer_id=xxx&is_login=true"
              : // : "https://hkshopnet.hk01.com/m/transfer/-order-list-all?itm_source=app_my&itm_medium=referral&itm_content=app_hk01",
                "https://01mall.hk01.com/transfer?site_type=shopnet&redirect_uri=https%3A%2F%2F01mall.hk01.com%2Forder%2Flist%2Fall&client_id=0690425c6aa25cf94b92dd691734dd39&referer=https%3A%2F%2Fhk01-member-frontend.hk01.com%2Frecommend&referer_id=member&is_login=true",
          icon: require("@/assets/img/icon_order.png"),
        },
        {
          name: "我的電子票",
          type: "deeplink",
          deepLink: "://membership?action=ticket",
          icon: require("@/assets/img/iconTicket.png"),
        },
      ],
    };
    this.isCanClick = true;
  }
  handleClick = (item) => {
    if (!this.isCanClick) {
      return;
    }
    this.isCanClick = false;
    setTimeout(() => {
      this.isCanClick = true;
    }, 1200);
    if (!item.deepLink) {
      return;
    }
    dataTrackerAction(
      {},
      { action: "click_navbar" },
      {
        item: item.name,
      }
    );
    if (item.type === "web") {
      if (this.props.system.platform === "webview") {
        window.sdk.app.goTo(item.deepLink);
      } else {
        window.location.href = item.deepLink;
      }
      return;
    }
    if (item.type === "deeplink_web") {
      if (this.props.system.platform === "webview") {
        this.props.dispatch({
          type: "system/deepLinkOpenWeb",
          payload: {
            url: item.deepLink,
            isCanEditInfo: true,
          },
        });
      } else {
        window.location.href = item.deepLink;
      }
      return;
    }
    this.props.dispatch({
      type: "system/deepLink",
      payload: {
        url: item.deepLink,
        isCanEditInfo: true,
      },
    });
  };
  render() {
    return (
      <div className="nav-bar" style={{ ...this.props.style }}>
        {this.state.navBarList.map((item, index) => {
          return (
            <div
              className="item"
              key={index}
              onClick={this.handleClick.bind(this, item)}
            >
              <img src={item.icon} alt="" className="nav-icon" />
              <p>{item.name}</p>
            </div>
          );
        })}
      </div>
    );
  }
}
export default connect(({ system }) => {
  return {
    system: system.toJS(),
  };
})(NavBar);
