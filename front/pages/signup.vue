<template>
  <div>
    <v-container>
      <v-card>
        <v-container>
          <v-subheader>회원가입</v-subheader>
          <v-form ref="form" v-model="valid" @submit.prevent="onSubmitForm">
            <v-text-field
              label="이메일"
              type="email"
              v-model="email"
              :rules="emailRules"
              required
            />
            <v-text-field
              label="비밀번호"
              type="password"
              v-model="password"
              :rules="passwordRules"
              required
            />
            <v-text-field
              label="비밀번호확인"
              type="password"
              v-model="passwordCheck"
              :rules="passwordCheckRules"
              required
            />
            <v-text-field
              label="닉네임"
              type="nickname"
              v-model="nickname"
              :rules="nicknameRules"
              required
            />
            <v-checkbox
              required
              label="노드 에스엔에스에 가입하겠습니다"
              v-model="terms"
              :rules="termsRules"
            />
            <v-btn color="green" type="submit">가입하기</v-btn>
          </v-form>
        </v-container>
      </v-card>
    </v-container>
  </div>
</template>

<script>
export default {
  data() {
    return {
      valid: false,
      email: "",
      password: "",
      passwordCheck: "",
      nickname: "",
      terms: false,
      emailRules: [
        (v) => !!v || "이메일은 필수입니다.",
        (v) => /.+@.+/.test(v) || "이메일이 유효하지 않습니다.",
      ],
      nicknameRules: [(v) => !!v || "닉네임은 필수입니다."],
      passwordRules: [(v) => !!v || "비밀번호는 필수입니다."],
      passwordCheckRules: [
        (v) => !!v || "비밀번호 확인은 필수입니다.",
        (v) => v === this.password || "비밀번호가 일치하지 않습니다.",
      ],
      termsRules: [(v) => !!v || "약관에 동의해야합니다."],
    };
  },
  head() {
    return {
      title: "회원가입",
    };
  },
  computed: {
    me() {
      return this.$store.state.users.me;
    },
  },
  watch: {
    me(value) {
      if (value) {
        this.$router.push({
          path: "/",
        });
      }
    },
  },
  methods: {
    onSubmitForm() {
      if (this.$refs.form.validate()) {
        // action은 비동기이기 때문에, 아래와 실행완료 순서가 다를 수 있음
        // 회원가입 실패했을때도 메인페이지 이동을 막기 위해 then 사용
        this.$store
          .dispatch("users/signUp", {
            nickname: this.nickname,
            email: this.email,
            password: this.password,
          })
          .then(() => {
            this.$router.push({
              path: "/",
            });
          })
          .catch((e) => {
            console.log(e);
            alert("회원가입 실패");
          });
      } else {
        alert("폼이 유효하지 않습니다.");
      }
    },
  },
  middleware: "anonymous",
};
</script>

<style></style>
