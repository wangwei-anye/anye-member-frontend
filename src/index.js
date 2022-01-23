import dva from "dva";
import createHistory from "history/createBrowserHistory";
import "./index.less";
import { loadJs, sessionId } from "@/utils/tools";
import { APP_ID, WEB_JS_SDK } from "@/constants";
import { requestAndWait, EVENT_ENUMS, isSupportedApp } from '@hk01-digital/react-native-webview-events/cjs/web'

const WEB_JS_SDK_VERSION = "5.0.3";

// 此处最好放在 初始化dva 前
let trackerClientOptions = {
  GA: {
    trackingId: "UA-131836883-4",
  },
  Piwik: {
    trackingUrl: "https://track.hktester.com/v2/piwik.php",
    siteId: 5,
    userId: "user-ID", // 此处 随便填写
    isSPA: true,
  },
  webviewBridgeEnabled: true,
};
let HK01_WEB_JS_SDK_URL = `https://cdn.hktester.com/sdk/hk01/v${WEB_JS_SDK_VERSION}/jssdk.js`;
const hideHeader = () => {
  requestAndWait({
    type: EVENT_ENUMS.SET_NAVIGATION_OPTIONS,
    payload: {
      hideHeader: true
    }
  })
}
if (WEB_JS_SDK === "production") {
  trackerClientOptions = {
    GA: {
      trackingId: "UA-131836883-3",
    },
    Piwik: {
      trackingUrl: "https://track.hk01.com/v2/piwik.php",
      siteId: 6,
      userId: "user-ID",
      isSPA: true,
    },
    webviewBridgeEnabled: true,
  };
  HK01_WEB_JS_SDK_URL = `https://cdn.hk01.com/sdk/hk01/v${WEB_JS_SDK_VERSION}/jssdk.js`;
}

loadJs("HK01", HK01_WEB_JS_SDK_URL).then(async () => {

  const initApp = () => {
    /* eslint-enable */

    // 1. Initialize
    const app = dva({
      history: createHistory(),
    });
    // 3. Model
    app.model(require("./models/system").default);
    app.model(require("./models/auth").default);
    // 4. Router
    app.router(require("./router").default);
    // 5. Start
    setTimeout(() => {
      app.start("#root");
    }, 1);

    // 隐藏 app 头部
    if (window.sdk) {
      if (isSupportedApp()) {
        hideHeader() //在hk01App不生效，在letzgoalApp 生效
        setTimeout(() => { //在两个App都生效
          hideHeader()
        }, 0);

        // setTimeout(() => {
        //   window.sdk.app.hideHeader();
        // }, 300);
        // setTimeout(() => {
        //   window.sdk.app.hideHeader();
        // }, 800);
        // setTimeout(() => {
        //   window.sdk.app.hideHeader();
        // }, 1500);
        // 使用 deviceId 替换 trackerClientOptions.Piwik.userId

        window.sdk.app.getDeviceId().then((deviceId) => {
          window.sdk.trackerClient.Piwik.setUserId(deviceId);
          window.eggSdk.trackerClient.Piwik.setUserId(deviceId);
        });
      }
    }
  }

  /* eslint-disable */
  // NOTE：僅用於獲取應用初始化的一些數據，不在实际业务中使用该SDK实例
  window.testSdk = new HK01(
    {
      appId: APP_ID,
      service: "01infinity",
    },
    trackerClientOptions
  );

  // 传参数自动发送一些埋点事件

if (window.testSdk.getPlatform() === "web") {
  window.sdk = new HK01(
    {
      appId: APP_ID,
    },
    trackerClientOptions
  );
  window.eggSdk = window.sdk;
  //v4 update v5
  await window.sdk.init();
  await window.eggSdk.init();
  initApp();
  return;
}
// 调用app的api会进行版本检测，如果检测不通过会抛出错误
window.testSdk.app
  .getDeviceId()
  .then(async (deviceId) => {
    const appVersion = window.testSdk.app.getBuildNumber();
    window.sdk = new HK01(
      {
        appId: APP_ID,
        service: "01infinity",
        appVersion,
        sessionId: sessionId(),
        anonymousId: deviceId,
      },
      trackerClientOptions
    );

    window.eggSdk = new HK01(
      {
        appId: APP_ID,
        service: "member_egg_2019",
        appVersion,
        sessionId: sessionId(),
        anonymousId: deviceId,
      },
      trackerClientOptions
    );
    //v4 update to v5
    await window.sdk.init();
    await window.eggSdk.init();
    initApp();
  })
  .catch((err) => {
    console.log(err);
  });

}); // end of loadJs
