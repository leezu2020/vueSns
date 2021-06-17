<template>
  <v-container>
    <div>
      <post-card v-for="p in mainPosts" :key="p.id" :post="p" />
    </div>
  </v-container>
</template>

<script>
import PostCard from "~/components/PostCard.vue";
export default {
  components: { PostCard },
  data() {
    return {};
  },
  fetch({ store, params }) {
    store.dispatch("posts/loadHashtagPosts", {
      hashtag: encodeURIComponent(params.id),
      reset: true,
    });
  },
  computed: {
    mainPosts() {
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
          this.$store.dispatch("posts/loadPosts");
        }
      }
    },
  },
};
</script>

<style></style>
