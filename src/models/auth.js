import Immutable from "immutable";
import { LOGIN_STATUS } from "@/constants";

const immutableState = Immutable.fromJS({
  userInfo: {
    memberApplicationServiceToken: "",
    memberToken: "",
    accountId: null,
    name: "未登入", // 会员name
    avatar: require("@/assets/img/iconProtrait@2x.png"), // 会员头像
    loginStatus: false, // 是否登陆
    isBindPhone: false, // 是否绑定手机号
    isGeting: false, // 是否在获取用户信息中
    level: 3, // 这里默认会员等级 为 3,因为 sdk 中没有会员等级的字段
  },
});
export default {
  state: immutableState,
  namespace: "auth",
  effects: {
    *getLoginStatus({ payload }, { put, select }) {
      try {
        let ret = "success in model auth/getLoginStatus";
        const auth = yield select((state) => state.auth.toJS());
        // const system = yield select((state) => state.system.toJS());
        const userInfo = auth.userInfo;
        // if (!system.deepLink.isCanEditInfo) {
        //   // 如果 deepLink 是不能直接修改用户信息的
        //   const { accountId, loginStatus, isBindPhone } = userInfo;
        //   if (accountId && loginStatus && isBindPhone) {
        //     return;
        //   }
        // }
        if (userInfo.isGeting) {
          return;
        }
        if (window.sdk) {
          yield put({
            type: "save",
            payload: {
              userInfo: {
                ...userInfo,
                isGeting: true,
              },
            },
          });
          // 通过 sdk 获取登录态 1
          const loginStatus = yield window.sdk.auth
            .getLoginStatus()
            .catch(() => (ret = "failure in getLoginStatus()"));

          if (loginStatus.status === LOGIN_STATUS.CONNECTED) {
            const _auth = yield select((state) => state.auth.toJS());
            const _userInfo = _auth.userInfo;
            // 已经登陆
            yield put({
              type: "save",
              payload: {
                userInfo: {
                  ..._userInfo,
                  loginStatus: true,
                },
              },
            });
            yield put({
              type: "getTokens",
              payload: {
                accessToken: loginStatus.response.accessToken,
              },
            });
          } else {
            yield put({
              type: "save",
              payload: {
                userInfo: {
                  ...userInfo,
                  isGeting: false,
                },
              },
            });
          }
        }
        return ret;
      } catch (error) {
        // return Promise.reject(error);
        console.log(error);
        return "failure in model auth/getLoginStatus";
      }
    },
    *getTokens({ payload }, { put, select }) {
      if (!window.sdk) {
        return;
      }
      // 通过 登陆状态的accessToken 获取 其他凭证的 token
      const authState = yield select((state) => state.auth.toJS());
      const newUserInfo = authState.userInfo;
      if (!payload.accessToken) {
        yield put({
          type: "save",
          payload: {
            userInfo: {
              ...newUserInfo,
              isGeting: false,
            },
          },
        });
        return;
      }
      try {
        const res = yield window.sdk.auth.getTokens(payload.accessToken);
        if (res) {
          yield put({
            type: "getUserInfo",
            payload: {
              res,
            },
          });
        } else {
          yield put({
            type: "save",
            payload: {
              userInfo: {
                ...newUserInfo,
                isGeting: false,
              },
            },
          });
        }
      } catch (err) {
        yield put({
          type: "save",
          payload: {
            userInfo: {
              ...newUserInfo,
              isGeting: false,
            },
          },
        });
      }
    },

    *getUserInfo({ payload }, { put, select }) {
      if (!window.sdk) {
        return;
      }
      const { res } = payload;
      const authState = yield select((state) => state.auth.toJS());
      const newUserInfo = authState.userInfo;
      if (!(res && res.memberJwt)) {
        yield put({
          type: "save",
          payload: {
            userInfo: {
              ...newUserInfo,
              isGeting: false,
            },
          },
        });
        return;
      }
      const token = res.memberJwt.token;
      const memberApplicationServiceToken = res.memberApplicationService
        ? res.memberApplicationService.token
        : "";
      try {
        // 根据 token 获取 用户信息
        const profileInfo = yield window.sdk.auth.getProfile(token);
        // 判断是否有绑定手机号码
        let hasTelNumFlag = false;
        const logins = profileInfo.logins;
        for (let i = 0; i < logins.length; i++) {
          if (logins[i]["method"] === "phone") {
            if (logins[i].nationalNumber !== "") {
              hasTelNumFlag = true;
              break;
            }
          }
        }
        const infoObj = {
          name: profileInfo.firstName,
          lastName: profileInfo.lastName,
          isBindPhone: hasTelNumFlag,
          accountId: profileInfo.accountId,
        };
        if (profileInfo.avatar) {
          infoObj.avatar = profileInfo.avatar;
        }

        yield put({
          type: "save",
          payload: {
            userInfo: {
              ...newUserInfo,
              ...infoObj,
              memberApplicationServiceToken,
              memberToken: token,
              isGeting: false,
            },
          },
        });
        if (window.sessionStorage) {
          window.sessionStorage.setItem("hk01_accountdId", infoObj.accountId);
        }
        const system = yield select((state) => state.system.toJS());
        if (!system.deepLink.isCanEditInfo) {
          yield put({
            type: "system/save",
            payload: {
              ...system,
              deepLink: {
                timestamp: Date.now(),
                type: "clearInterval",
              },
            },
          });
        }
      } catch (err) {}
    },
  },

  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen(({ pathname, search }) => {
        dispatch({
          type: "getLoginStatus",
          payload: {},
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
