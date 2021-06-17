<template>
  <v-container>
    <v-card style="margin-bottom: 20px">
      <v-container>
        {{ other.nickname }}
        <v-row>
          <v-col cols="4">{{ other.Followings.length }} 팔로잉</v-col>
          <v-col cols="4">{{ other.Followers.length }} 팔로워</v-col>
          <v-col cols="4">{{ other.Posts.length }} 게시글</v-col>
        </v-row>
      </v-container>
    </v-card>
    <div>
      <post-card v-for="p in mainPosts" :key="p.id" :post="p" />
    </div>
  </v-container>
</template>

<script>
import PostCard from "../../../components/PostCard.vue";
export default {
  components: { PostCard },
  data() {
    return {};
  },
  fetch({ store, params }) {
    // return 붙이는거 중요!!
    console.log("other 타임라인 fetch 시작");
    return Promise.all([
      store.dispatch("posts/loadUserPosts", {
        userId: params.id,
        reset: true,
      }),
      store.dispatch("users/loadOther", {
        userId: params.id,
      }),
    ]);
  },
  computed: {
    other() {
      return this.$store.state.users.other;
    },
    mainPosts() {
      console.log("mainPosts");
      return this.$store.state.posts.mainPosts;
    },
  },
  mounted() {
    //created에서는 window 사용불가
    window.addEventListener("scroll", this.onScroll);
  },
  // 메모리 누수 방지 위해서
  beforeDestroy() {
    window.removeEventListener("scroll", this.onScroll);
  },
  methods: {
    onScroll() {
      if (
        window.scrollY + document.documentElement.clientHeight >
        document.documentElement.scrollHeight - 300
      ) {
        if (this.hasMorePost) {
          this.$store.dispatch("posts/loadPosts", { reset: false });
        }
      }
    },
  },
};
</script>

<style></style>
