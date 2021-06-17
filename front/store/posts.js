import Vue from "vue";
import { throttle } from "lodash";

export const state = () => ({
  mainPosts: [],
  // 더 불러올 게시글이 있는지 체크
  hasMorePost: true,
  imagePaths: [],
});

export const mutations = {
  addMainPost(state, payload) {
    // 최신글을 맨 앞에 보내기 위해 unshift
    state.mainPosts.unshift(payload);
    state.imagePaths = [];
  },
  removeMainPost(state, payload) {
    const index = state.mainPosts.findIndex((v) => v.id === payload.postId);
    state.mainPosts.splice(index, 1);
  },
  loadComments(state, payload) {
    const index = state.mainPosts.findIndex((v) => v.id === payload.postId);
    state.mainPosts[index].Comments = payload;
  },
  addComment(state, payload) {
    const index = state.mainPosts.findIndex((v) => v.id === payload.postId);
    state.mainPosts[index].Comments.unshift(payload);
  },
  loadPosts(state, payload) {
    if (payload.reset) {
      state.mainPosts = payload.data;
    } else {
      state.mainPosts = state.mainPosts.concat(payload.data);
    }
    console.log(payload.data.length, 10);
    state.hasMorePost = payload.data.length === 10;
    console.log("loadPosts 결과 mainPosts : ", state.mainPosts);
  },
  concatImagePaths(state, payload) {
    // concat하는 이유, 기존에 하나만 업로드했다가 추가로 업로드했을 경우를 대비
    state.imagePaths = state.imagePaths.concat(payload);
  },
  removeImagePath(state, payload) {
    state.imagePaths.splice(payload, 1);
  },
  unlikePost(state, payload) {
    const index = state.mainPosts.findIndex((v) => v.id === payload.postId);
    const userIndex = state.mainPosts[index].Likers.findIndex(
      (v) => v.id === payload.userId
    );
    state.mainPosts[index].Likers.splice(userIndex, 1);
  },
  likePost(state, payload) {
    const index = state.mainPosts.findIndex((v) => v.id === payload.postId);
    state.mainPosts[index].Likers.push({
      id: payload.userId,
    });
  },
};

// actions는 기록이 안되지만, mutations은 기록이 됨
export const actions = {
  add({ commit, state }, payload) {
    // index.js에 있는 addMainPost를 가져올 경우
    // commit('addMainPost', payload, {root : true})
    console.log(state.imagePaths);
    this.$axios
      .post(
        "/post",
        {
          content: payload.content,
          image: state.imagePaths,
        },
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        commit("addMainPost", res.data);
      })
      .catch((err) => {
        console.error(err);
      });
    // 서버에 게시글 등록 요청
  },
  remove({ commit }, payload) {
    this.$axios
      .delete(`/post/${payload.postId}`, {
        withCredentials: true,
      })
      .then(() => {
        commit("removeMainPost", payload);
      })
      .catch((err) => {
        console.error(err);
      });
    commit("removeMainPost", payload);
  },
  addComment({ commit }, payload) {
    this.$axios
      .post(
        `/post/${payload.postId}/comment`,
        {
          content: payload.content,
        },
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        commit("addComment", res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  },
  loadComment({ commit, payload }) {
    this.$axios
      .get(`/post/${payload.postId}/comments`)
      .then((res) => {
        commit("loadComments", res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  },
  loadPosts: throttle(async function({ commit, state }, payload) {
    console.log("loadPosts action 실행", state.mainPosts.length);
    try {
      if (payload && payload.reset) {
        const res = await this.$axios(`/posts?limit=10`);
        commit("loadPosts", {
          data: res.data,
          reset: true,
        });
        return;
      }
      if (state.hasMorePost) {
        const lastPost = state.mainPosts[state.mainPosts.length - 1];
        const res = await this.$axios.get(
          `/posts?lastId=${lastPost && lastPost.id}&limit=10`
        );
        commit("loadPosts", { data: res.data });
        console.log(state);
        return;
      }
    } catch (err) {
      console.error(err);
    }
  }, 1000), // 한번 실행되면 1초뒤에
  loadUserPosts: throttle(async function({ commit, state }, payload) {
    console.log("loadUserPosts action 실행", state.mainPosts.length);
    try {
      if (payload && payload.reset) {
        const res = await this.$axios(`/user/${payload.userId}/posts?limit=10`);
        commit("loadPosts", {
          data: res.data,
          reset: true,
        });
        return;
      }
      if (state.hasMorePost) {
        const lastPost = state.mainPosts[state.mainPosts.length - 1];
        const res = await this.$axios.get(
          `/user/${payload.userId}/posts?lastId=${lastPost &&
            lastPost.id}&limit=10`
        );
        commit("loadPosts", { data: res.data });
        console.log(state);
        return;
      }
    } catch (err) {
      console.error(err);
    }
  }, 1000), // 한번 실행되면 1초뒤에
  loadPosts: throttle(async function({ commit, state }, payload) {
    console.log("loadPosts action 실행", state.mainPosts.length);
    try {
      if (payload && payload.reset) {
        const res = await this.$axios(`/posts?limit=10`);
        commit("loadPosts", {
          data: res.data,
          reset: true,
        });
        return;
      }
      if (state.hasMorePost) {
        const lastPost = state.mainPosts[state.mainPosts.length - 1];
        const res = await this.$axios.get(
          `/posts?lastId=${lastPost && lastPost.id}&limit=10`
        );
        commit("loadPosts", { data: res.data });
        console.log(state);
        return;
      }
    } catch (err) {
      console.error(err);
    }
  }, 1000), // 한번 실행되면 1초뒤에
  loadHashtagPosts: throttle(async function({ commit, state }, payload) {
    console.log("loadUserPosts action 실행", state.mainPosts.length);
    try {
      if (payload && payload.reset) {
        const res = await this.$axios(`/hashtag/${payload.hashtag}?limit=10`);
        commit("loadPosts", {
          data: res.data,
          reset: true,
        });
        return;
      }
      if (state.hasMorePost) {
        const lastPost = state.mainPosts[state.mainPosts.length - 1];
        const res = await this.$axios.get(
          `/hashtag/${payload.hashtag}?lastId=${lastPost &&
            lastPost.id}&limit=10`
        );
        commit("loadPosts", { data: res.data });
        console.log(state);
        return;
      }
    } catch (err) {
      console.error(err);
    }
  }, 2000), // 한번 실행되면 1초뒤에
  uploadImages({ commit }, payload) {
    this.$axios
      .post("/post/images", payload, {
        withCredentials: true,
      })
      .then((res) => {
        commit("concatImagePaths", res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  },
  retweet({ commit }, payload) {
    this.$axios
      .post(
        `/post/${payload.postId}/retweet`,
        {},
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        commit("addMainPost", res.data);
      })
      .catch((err) => {
        console.error(err);
        alert(err.response.data);
      });
  },
  likePost({ commit }, payload) {
    this.$axios
      .post(
        `/post/${payload.postId}/like`,
        {},
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        commit("likePost", {
          userId: res.data.userId,
          postId: payload.postId,
        });
      })
      .catch((err) => {
        console.error(err);
      });
  },
  unlikePost({ commit }, payload) {
    this.$axios
      .delete(`/post/${payload.postId}/like`, {
        withCredentials: true,
      })
      .then((res) => {
        commit("unlikePost", {
          userId: res.data.userId,
          postId: payload.postId,
        });
      })
      .catch((err) => {
        console.error(err);
      });
  },
};
