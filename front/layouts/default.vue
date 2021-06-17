<template>
  <v-app>
    <nav>
      <v-toolbar dark color="green">
        <v-toolbar-title>
          <nuxt-link to="/">NodeBird</nuxt-link>
        </v-toolbar-title>
        <v-spacer />
        <v-toolbar-items>
          <v-form @submit.prevent="onSearchHashtag">
            <div
              :style="{ display: 'flex', hegith: '100%', alignItems: 'center' }"
            >
              <v-text-field
                v-model="hashtag"
                label="검색"
                hide-details
                prepend-icon="mdi-magnify"
              />
            </div>
          </v-form>
          <v-btn
            text
            nuxt
            to="/profile"
            :style="{ display: 'flex', alignItems: 'center' }"
          >
            <div>프로필</div>
          </v-btn>
          <v-btn
            text
            nuxt
            to="/signup"
            :style="{ display: 'flex', alignItems: 'center' }"
          >
            <div>회원가입</div>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
    </nav>
    <v-row no-gutters>
      <!-- cols는 12 고정 -->
      <v-col cols="12" md="4">
        <login-form />
      </v-col>
      <v-col cols="12" md="8">
        <nuxt />
      </v-col>
    </v-row>
  </v-app>
</template>

<script>
import LoginForm from "~/components/LoginForm";
export default {
  components: {
    LoginForm,
  },
  // 화면이 채워지기전 store을 채우는 역할 : fetch
  // 하지만 layout에서는 사용불가
  data() {
    return {
      hashtag: "",
    };
  },
  computed: {},
  methods: {
    onSearchHashtag() {
      this.$router.push({
        path: `/hashtag/${encodeURIComponent(this.hashtag)}`,
      });
      this.hashtag = "";
    },
  },
};
</script>
