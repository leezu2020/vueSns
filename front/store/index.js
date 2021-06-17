export const state = () => ({
  name: "vuex",
});

export const mutations = {
  bye(state) {
    state.name = "goodbye";
  },
};

export const actions = {
  // 모든 페이지에서 먼저 시작해야할거 vs fetch는 각 페이지
  nuxtServerInit({ commit, dispatch, state }, { req }) {
    return dispatch("users/loadUser");
  },
};
