export const state = () => ({
  me: null,
  followerList: [],
  followingList: [],
  hasMoreFollower: true,
  hasMoreFollowing: true,
  other: null, // 남의정보
});

const limit = 3;

//mutations은 동기적 작업, 비동기적요청 x
export const mutations = {
  setMe(state, payload) {
    state.me = payload;
  },
  setOther(state, payload) {
    state.other = payload;
  },
  changeNickname(state, payload) {
    state.me.nickname = payload.nickname;
  },
  addFollowing(state, payload) {
    state.followingList.push(payload);
  },
  removeFollowing(state, payload) {
    let index = state.me.Followings.findIndex((v) => v.id === payload.userId);
    state.me.Followings.splice(index, 1);
    index = state.followingList.findIndex((v) => v.id === payload.userId);
    state.followingList.splice(index, 1);
  },
  addFollower(state, payload) {
    state.followerList.push(payload);
  },
  removeFollower(state, payload) {
    let index = state.me.Followers.findIndex((v) => v.id === payload.id);
    state.followerList.splice(index, 1);
    index = state.followerList.findIndex((v) => v.id === payload.userId);
    state.followerList.splice(index, 1);
  },
  loadFollowers(state, payload) {
    if (payload.offset === 0) {
      state.followerList = payload.data;
    } else {
      state.followerList = state.followerList.concat(payload.data);
    }
    state.hasMoreFollower = payload.data.length === limit;
  },
  loadFollowings(state, payload) {
    if (payload.offset === 0) {
      state.followingList = payload.data;
    } else {
      state.followingList = state.followingList.concat(payload.data);
    }
    state.hasMoreFollowing = payload.data.length === limit;
  },
  following(state, payload) {
    state.me.Followings.push({ id: payload.userId });
  },
};

//actions는 비동기적 작업
export const actions = {
  async loadUser({ state, commit }) {
    console.log("loadUser");
    try {
      const res = await this.$axios.get("/user", {
        withCredentials: true,
      });
      console.log(res.data);
      commit("setMe", res.data);
      console.log(state);
    } catch (err) {
      console.error(err);
    }
  },
  async loadOther({ commit }, payload) {
    try {
      const res = await this.$axios.get(`/user/${payload.userId}`, {
        withCredentials: true,
      });
      commit("setOther", res.data);
    } catch (err) {
      console.error(err);
    }
  },
  //context 에는 commit dispatch state rootState getters rootGetters
  signUp({ commit }, payload) {
    // 서버에 회원가입 요청 보내는 부분
    this.$axios
      .post("/user", {
        email: payload.email,
        nickname: payload.nickname,
        password: payload.password,
      })
      .then((res) => {
        console.log(res);
        commit("setMe", res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  },
  logIn({ commit }, payload) {
    this.$axios
      .post(
        "/user/login",
        {
          email: payload.email,
          password: payload.password,
        },
        {
          // 백엔드와 프론트엔드 서버가 달라서 백엔드에도 쿠키가 저장되게
          withCredentials: true,
        }
      )
      .then((res) => {
        commit("setMe", res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  },
  logOut({ commit }, payload) {
    this.$axios
      .post("/user/logout", {}, { withCredentials: true })
      .then((data) => {
        commit("setMe", null);
      })
      .catch((err) => {
        console.error(err);
      });
  },
  changeNickname({ commit }, payload) {
    this.$axios
      .patch(
        `/user/nickname`,
        { nickname: payload.nickname },
        {
          withCredentials: true,
        }
      )
      .then(() => {
        commit("changeNickname", payload);
      })
      .catch((err) => {
        console.error(err);
      });
    commit("changeNickname", payload);
  },
  addFollowing({ commit }, payload) {
    commit("addFollowing", payload);
  },
  addFollower({ commit }, payload) {
    commit("addFollower", payload);
  },

  loadFollowers({ commit, state }, payload) {
    if (!(payload && payload.offset === 0) && !state.hasMoreFollower) {
      return;
    }
    let offset = state.followerList.length;
    if (payload && payload.offset === 0) {
      offset = 0;
    }
    return this.$axios
      .get(`/user/${state.me.id}/followers?limit=3&offset=${offset}`, {
        withCredentials: true,
      })
      .then((res) => {
        console.log("loadFollowers 결과 : ", res.data);
        commit("loadFollowers", {
          data: res.data,
          offset,
        });
      })
      .catch((err) => {
        console.error(err);
      });
  },
  loadFollowings({ commit, state }, payload) {
    if (!(payload && payload.offset === 0) && !state.hasMoreFollowing) {
      return;
    }
    let offset = state.followingList.length;
    if (payload && payload.offset === 0) {
      offset = 0;
    }
    return this.$axios
      .get(`/user/${state.me.id}/followings?limit=3&offset=${offset}`, {
        withCredentials: true,
      })
      .then((res) => {
        console.log("loadFollowings 결과 : ", res.data);
        commit("loadFollowings", {
          data: res.data,
          offset,
        });
      })
      .catch((err) => {
        console.error(err);
      });
  },

  follow({ commit }, payload) {
    this.$axios
      .post(
        `/user/${payload.userId}/follow`,
        {},
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        commit("following", {
          userId: payload.userId,
        });
      })
      .catch((err) => {
        console.error(err);
      });
  },
  unfollow({ commit }, payload) {
    this.$axios
      .delete(`/user/${payload.userId}/follow`, {
        withCredentials: true,
      })
      .then((res) => {
        commit("removeFollowing", {
          userId: payload.userId,
        });
      })
      .catch((err) => {
        console.error(err);
      });
  },

  removeFollower({ commit }, payload) {
    return this.$axios
      .delete(`/user/${payload.userId}/follower`, {
        withCredentials: true,
      })
      .then((res) => {
        commit("removeFollower", {
          userId: payload.userId,
        });
      })
      .catch((err) => {
        console.error(err);
      });
  },
};
