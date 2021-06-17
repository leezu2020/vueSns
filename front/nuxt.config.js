module.exports = {
  head: {
    title: "NodeBird",
  },
  buildModules: ["@nuxtjs/vuetify"],
  modules: ["@nuxtjs/axios"],
  vuetify: {},
  axios: {
    browserBaseURL: "http://localhost:3085", // 클라이언트에서
    baseURL: "http://localhost:3085", // 서버에서
    https: false,
  },
  server: {
    port: 3080,
  },
};
