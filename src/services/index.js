import request from "@/utils/request";
import qs from "qs";
import { HK_API_BALANCES, API_BASE, HK_API_01INFINITE } from "@/constants";

export function queryBalances(accessToken) {
  const options = {
    method: "GET",
    headers: {
      Authorization: `bearer ${accessToken}`,
    },
  };
  return request(
    `${HK_API_BALANCES}/v2/points/balances?currencyTypeId=1`,
    options
  );
}
export function get01ActivityListRequest(query) {
  const querystring = qs.stringify(query);
  return request(`${HK_API_01INFINITE}/v2/feed/category/178?${querystring}`);
}
export function getMallListRequest(query) {
  const querystring = qs.stringify(query);
  return request(`${HK_API_01INFINITE}/v2/feed/category/78?${querystring}`);
}
export function getRecommendListRequest(query) {
  const defaultParms = {
    limit: 20,
    port_key: "shopping_mall_activity",
    last_record: 0,
  };
  const querystring = qs.stringify(Object.assign({}, defaultParms, query));
  return request(`${API_BASE}/recommend?${querystring}`);
}
export function getRewardRequest(query) {
  const defaultParms = {
    limit: 20,
    port_key: "shopping_reward_activity",
    last_record: 0,
  };
  const querystring = qs.stringify(Object.assign({}, defaultParms, query));
  return request(`${API_BASE}/recommend?${querystring}`);
}
export function getEarnPointListRequest(query) {
  const defaultParms = {
    limit: 20,
    port_key: "member_points_earn",
    last_record: 0,
  };
  const querystring = qs.stringify(Object.assign({}, defaultParms, query));
  return request(`${API_BASE}/obtain_points?${querystring}`);
}
export function getDetailInfoRequest(query) {
  const option = {
    method: "POST",
    body: JSON.stringify(query),
  };
  return request(`${API_BASE}/promotional_activity/info`, option);
}

// 领取优惠券
export function getRedeemCouponRequest(query) {
  const option = {
    method: "POST",
    headers: {
      Authorization: query.headerToken,
    },
    body: JSON.stringify({
      promotional_activity_id: query.id,
      g_recaptcha_response: query.g_recaptcha_response,
    }),
  };
  // TODO: 本地开发，因为权限的问题，做特殊处理 @潘逸凡
  // if (process.env.NODE_ENV === 'development') {
  //   option.body = JSON.stringify({
  //     promotional_activity_id: query.id,
  //     union_id: 109129
  //   })
  //   return request(`${API_BASE}/promotional_activity/redeem_coupon_test`, option)
  // }
  return request(`${API_BASE}/promotional_activity/redeem_coupon`, option);
}

// 获取推广活动详情
export function getPromotionDetail(id) {
  const option = {
    method: "POST",
    body: JSON.stringify({ id }),
  };
  return request(`${API_BASE}/promotional_activity/info`, option);
}
// 答题模板获取题干
export function getQuestionInfoRequest(id) {
  const querystring = qs.stringify({ activity_id: id });
  return request(`${API_BASE}/question/info?${querystring}`);
}

// 答题模板获取题干 已登陸
export function getQuestionInfoRequest_Login(id, headerToken) {
  const option = {
    method: "GET",
    headers: {
      Authorization: headerToken,
    },
  };
  return request(`${API_BASE}/question/login_info?activity_id=${id}`, option);
}

// 提交答题
export function postQuestionAnswerRequest(query) {
  const { headerToken } = query;
  delete query.headerToken;
  const option = {
    method: "POST",
    headers: {
      Authorization: headerToken,
    },
    body: JSON.stringify(query),
  };
  return request(`${API_BASE}/question/answer`, option);
}

export function verifyGoogleToken(key, headerToken) {
  const option = {
    method: "POST",
    headers: {
      Authorization: headerToken,
    },
    body: JSON.stringify({ g_recaptcha_response: key }),
  };
  return request(`${API_BASE}/verification/robot`, option);
}

export function offer(key, sku, headerToken, offer_package_id) {
  const option = {
    method: "POST",
    headers: {
      Authorization: headerToken,
    },
    body: JSON.stringify({
      g_recaptcha_response: key,
      redeem_password: sku,
      offer_package_id: offer_package_id,
    }),
  };
  return request(`${API_BASE}/points_offer_package/offer`, option);
}

export function userPackageDetail(sku, headerToken) {
  const option = {
    method: "GET",
    headers: {
      Authorization: headerToken,
    },
  };
  return request(
    `${API_BASE}/points_offer_package/user_package_detail?offer_package_id=${sku}`,
    option
  );
}

export function getPackageInfoDetail(sku, headerToken) {
  return request(
    `${API_BASE}/points_offer_package/frontend_package_detail?offer_package_id=${sku}`
  );
}

export function verifyPackageRrobot(key) {
  const option = {
    method: "POST",
    body: JSON.stringify({ g_recaptcha_response: key }),
  };
  return request(`${API_BASE}/verification/package_robot `, option);
}
