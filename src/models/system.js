import Immutable from "immutable";
import { parseSearch, sessionId } from "@/utils/tools";
import { HK_API_ID } from "@/constants";

let platform = "";
let deviceId = "";
const immutableState = Immutable.fromJS({
  pathname: "",
  query: {},
  platform: "web",
  deepLink: {
    isCanEditInfo: false,
    timestamp: Date.now(),
    type: "deeplink",
  },
  deviceId: "",
  sessionId: sessionId(),
  pageViewTracker: {
    ts: Date.now(),
  },
  ts: Date.now(),
});
export default {
  namespace: "system",
  state: immutableState,
  effects: {
    *deepLink({ payload }, { put, select }) {
      if (!navigator.onLine) return;
      const system = yield select((state) => state.system.toJS());
      const platform = window.sdk.getPlatform() || system.platform;
      console.log(`[Current Platform is: ] ${platform}`);
      if (platform === "web") {
        window.location.href = HK_API_ID + payload.url;
      } else {
        yield put({
          type: "save",
          payload: {
            ...system,
            deepLink: {
              timestamp: Date.now(),
              type: "deeplink",
              isCanEditInfo: payload.isCanEditInfo || false,
            },
          },
        });
        console.log(`[Jump To Page: ] ${HK_API_ID + payload.url}`);
        setTimeout(() => {
          window.sdk.app.goTo(HK_API_ID + payload.url);
        }, 0);
      }
    },
    //deeplink 方式 打开web网页
    *deepLinkOpenWeb({ payload }, { put, select }) {
      if (!navigator.onLine) return;
      const system = yield select((state) => state.system.toJS());
      yield put({
        type: "save",
        payload: {
          ...system,
          deepLink: {
            timestamp: Date.now(),
            type: "deeplink",
            isCanEditInfo: payload.isCanEditInfo || false,
          },
        },
      });
      setTimeout(() => {
        window.sdk.app.goTo(payload.url);
      }, 0);
    },
    pageViewTracker({ payload }, { put, select }) {
      const isEgg = payload.isEgg || false;
      const sdk = isEgg ? window.eggSdk : window.sdk;
      // 每个页面发送pageview埋点
      if (sdk) {
        sdk.trackerClient.pageView({
          GA: true,
          Piwik: true,
        });
      }
    },
  },
  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen(({ pathname, search }) => {
        const query = parseSearch(search);
        if (!platform && window.sdk) {
          platform = window.sdk.getPlatform() || "web";
        }
        if (!deviceId && window.sdk && window.sdk.getPlatform() !== "web") {
          window.sdk.app.getDeviceId().then((deviId) => {
            deviceId = deviId;
          });
        }
        dispatch({
          type: "save",
          payload: {
            pathname,
            query,
            platform,
            deviceId,
          },
        });
        const isEgg =
          pathname.indexOf("/egg") > -1 || pathname.indexOf("/promotion") > -1;
        dispatch({
          type: "pageViewTracker",
          payload: { isEgg },
        });
      });
    },
  },
  reducers: {
    save(state, action) {
      return state.merge(action.payload);
    },
  },
};
