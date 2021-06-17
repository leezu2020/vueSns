<template>
  <v-container>
    <post-form v-if="me" />
    <div>
      <post-card v-for="p in mainPosts" :key="p.id" :post="p" />
    </div>
  </v-container>
</template>

<script>
import PostCard from "../components/PostCard.vue";
import PostForm from "../components/PostForm.vue";
export default {
  components: { PostCard, PostForm },
  data() {
    return {};
  },
  fetch({ store }) {
    // return 붙이는거 중요!!
    console.log("fetch 시작");
    return store.dispatch("posts/loadPosts", { reset: true });
  },
  computed: {
    me() {
      return this.$store.state.users.me;
    },
    mainPosts() {
      console.log("mainPosts");
      return this.$store.state.posts.mainPosts;
    },
    hasMorePost() {
      console.log(
        "hasmorePost 체크 index.vue ",
        this.$store.state.posts.hasMorePost
      );
      return this.$store.state.posts.hasMorePost;
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
      console.log(
        window.scrollY + document.documentElement.clientHeight,
        document.documentElement.scrollHeight - 300
      );
      if (
        window.scrollY + document.documentElement.clientHeight >
        document.documentElement.scrollHeight - 300
      ) {
        console.log("스크롤 내려감");
        if (this.hasMorePost) {
          console.log("스크롤로 loadPosts 실행");
          this.$store.dispatch("posts/loadPosts");
        }
      }
    },
  },
};
</script>

<style></style>
