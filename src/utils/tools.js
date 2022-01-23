import qs from "qs";
import uuidv4 from "uuid-v4";
import Cookies from "js-cookie";
/**
 * 把数据格式化成 千分位  eg:1232,234.99
 */
export const thousandFormat = num => {
  if (!num) {
    return 0;
  }
  const str = typeof num === "string" ? num : num.toString();
  const re = /\d{1,3}(?=(\d{3})+$)/g;
  const n1 = str.replace(/^(\d+)((\.\d+)?)$/, (s, s1, s2) => {
    return s1.replace(re, "$&,") + s2;
  });
  return n1;
};

/**
 * 把数据 保留n位小数 下取整
 */
export const floorAndFixed = (num, n) => {
  if (!num) {
    return 0;
  }
  let tempNum = num;
  for (let i = 0; i < n; i++) {
    tempNum = tempNum * 10;
  }
  tempNum = Math.floor(tempNum);
  for (let i = 0; i < n; i++) {
    tempNum = tempNum / 10;
  }
  tempNum = parseFloat(tempNum).toFixed(n);
  return tempNum;
};

export const getScrollTop = () => {
  var scrollTop = 0;
  if (document.documentElement && document.documentElement.scrollTop) {
    scrollTop = document.documentElement.scrollTop;
  } else if (document.body) {
    scrollTop = document.body.scrollTop;
  }
  return scrollTop;
};

//获取当前可视范围的高度
export const getClientHeight = () => {
  var clientHeight = 0;
  if (document.body.clientHeight && document.documentElement.clientHeight) {
    clientHeight = Math.min(
      document.body.clientHeight,
      document.documentElement.clientHeight
    );
  } else {
    clientHeight = Math.max(
      document.body.clientHeight,
      document.documentElement.clientHeight
    );
  }
  return clientHeight;
};

//获取文档完整的高度
export const getScrollHeight = () => {
  return Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight
  );
};

/**
 * 解析url search字符串
 * @param {String}  search 形如：?pageNo=1&pageSize=10
 * @param {Boolean} trim   是否裁剪前后空格，缺省裁剪
 */
export const parseSearch = (search, trim = true) => {
  const querystring = (search || "").replace(/^\?/, "");
  const ret = qs.parse(querystring);
  for (const k in ret) {
    if (ret[k] === "") {
      delete ret[k];
    } else if (trim && typeof ret[k] === "string") {
      ret[k] = ret[k].trim();
    }
  }
  return ret;
};

export const sessionId = () => {
  let id = Cookies.get("hk01_session");
  if (!id) {
    id = uuidv4();
    Cookies.set("hk01_session", id, { path: "/", maxAge: 1800 /*30min*/ });
  }
  return id;
};

export const loadJs = (id, url) => {
  if (document.getElementById(id)) {
    return;
  }
  return new Promise((resolve, reject) => {
    if (!id) {
      reject(new Error("id is missging..."));
    } else {
      const firstEle = document.getElementsByTagName("script")[0];
      const script = document.createElement("script");
      script.id = id;
      script.src = url;
      firstEle.parentNode.insertBefore(script, firstEle);
      script.onload = resolve;
    }
  });
};

export const dataTrackerAction = (
  GAAndPiwik = {},
  categoryAndAction = {},
  data = {},
  service = "01infinity"
) => {
  let account_id = null;
  if (window.sessionStorage) {
    account_id = window.sessionStorage.getItem("hk01_accountdId") || null;
  }
  const defaultData = {
    ts: Date.now(),
    account_id,
    web_session_id: sessionId()
  };
  const defaultAGAndPiwik = {
    GA: true,
    Piwik: true
  };
  const defaultCategoryAndAction = {
    category: "01infinity",
    action: "view"
  };
  let sdk = window.sdk;
  if (service === "member_egg_2019") {
    sdk = window.eggSdk;
  }
  sdk.trackerClient.fire(Object.assign({}, defaultAGAndPiwik, GAAndPiwik), {
    ...Object.assign({}, defaultCategoryAndAction, categoryAndAction),
    label: JSON.stringify(Object.assign({}, defaultData, data))
  });
};

/**
 * 将textarea文本的字符串转为多行文字
 * @param {String} str 要转为多行的textarea文本字符串
 */
export const transMultiLine = (str = "") => {
  return str.split(/\r\n|[\r\n]/);
};

export const isIOS = () => /(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent);
export const isAndroid = () => /(Android)/i.test(navigator.userAgent);
/**
 * 解决ios输入框收起出现留白
 */
export const fixIOSKeyboardPad = () => {
  setTimeout(() => {
    if (
      document.activeElement.tagName === "INPUT" ||
      document.activeElement.tagName === "TEXTAREA"
    ) {
      return;
    }
    if (isIOS()) {
      document.activeElement.scrollIntoViewIfNeeded(true);
    }
  }, 0);
};
