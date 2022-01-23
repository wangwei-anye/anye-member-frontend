import Immutable from "immutable";

const immutableState = Immutable.fromJS({
  data: []
});

const User = {
  namespace: "score",
  state: immutableState,
  reducers: {
    save(state, action) {
      return state.merge(action.payload);
    }
  },
  effects: {
    
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, search }) => {
        if (pathname === "/member") {
        }
      });
    }
  }
};

export default User;
