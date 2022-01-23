import Immutable from "immutable";
import {
  getPromotionDetail,
  getQuestionInfoRequest,
  getQuestionInfoRequest_Login,
  postQuestionAnswerRequest
} from "@/services";
import { dataTrackerAction } from "@/utils/tools";

const immutableState = Immutable.fromJS({
  id: null,
  title: "",
  nav_title: "",
  rules:
    "%E7%AB%8B%E5%8D%B3%E6%88%90%E7%82%BA01%E6%9C%83%E5%93%A1%0A%E5%8D%B3%E9%80%81%E8%BF%8E%E6%96%B0%E5%84%AA%E6%83%A0%E5%88%B8",
  background_color: "rgb(0, 50, 232)",
  activity_type: 0,
  reward_description: "輸入說明文字輸入說明文字",
  img: require("../assets/img/picCard.png"),
  netCode: 200,
  questionInfo: {}
});

const Promotion = {
  namespace: "promotion",
  state: immutableState,
  reducers: {
    save(state, action) {
      return state.merge(action.payload);
    }
  },
  effects: {
    *getDetail({ id }, { put }) {
      try {
        const res = yield getPromotionDetail(id);
        const { data } = res;
        const info =
          data.code !== 200 ? { netCode: data.code } : { ...data.data };
        yield put({
          type: "save",
          payload: {
            netCode: data.code,
            ...info
          }
        });
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *getQuestionInfo({ id }, { put, select }) {
      try {
        const promotionState = yield select(state => state.promotion.toJS());
        const res = yield getQuestionInfoRequest(id);
        const { data } = res;
        yield put({
          type: "save",
          payload: {
            ...promotionState,
            questionInfo: data.data
          }
        });
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *getQuestionInfo_login({ payload }, { put, select }) {
      try {
        const promotionState = yield select(state => state.promotion.toJS());
        const res = yield getQuestionInfoRequest_Login(
          payload.id,
          payload.headerToken
        );
        const { data } = res;
        yield put({
          type: "save",
          payload: {
            ...promotionState,
            questionInfo: data.data
          }
        });
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *switchMode({ mode }, { put }) {
      yield put({
        type: "save",
        payload: {
          activity_type: mode
        }
      });
    },
    // 提交答题
    *postQuestionAnswer({ payload }, { put, select }) {
      const authState = yield select(stata => stata.auth.toJS());
      if (!authState.userInfo.loginStatus) {
        // 没有登陆，暂时存储到本地，登陆之后再次提交
        if (window.sessionStorage) {
          window.sessionStorage.setItem(
            "questionInfo",
            JSON.stringify(payload)
          );
        }
        return;
      }
      const postData = Object.assign(
        {},
        {
          union_id: authState.userInfo.accountId,
          headerToken: authState.userInfo.memberApplicationServiceToken
        },
        payload
      );
      // 上报 click_submit 事件
      yield put({
        type: "dataTrackerDispatch",
        payload: {
          action: "click_submit"
        }
      });
      const { data } = yield postQuestionAnswerRequest(postData);
      if (data.code === 200) {
        // 上报 submit_succeed 事件
        yield put({
          type: "dataTrackerDispatch",
          payload: {
            action: "submit_succeed"
          }
        });
      }
      if (window.sessionStorage) {
        window.sessionStorage.removeItem("questionInfo");
      }
    },

    // 数据埋点
    *dataTrackerDispatch({ payload }, { select }) {
      const promotionState = yield select(state => state.promotion.toJS());
      const {
        GAAndPiwik,
        action,
        data,
        isNeedDefaultValue = false,
        category
      } = payload;
      dataTrackerAction(
        GAAndPiwik,
        { category: category || "01infinity_welcome_activity", action },
        isNeedDefaultValue
          ? data
          : Object.assign(
              {},
              {
                activity_id: promotionState.id || "",
                activity_title: promotionState.title || "迎新禮遇"
              },
              data
            ),
        "member_egg_2019"
      );
    }
  }
};

export default Promotion;
