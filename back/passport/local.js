const passport = require("passport");
const bcrypt = require("bcrypt");
const { Strategy: LocalStrategy } = require("passport-local");
const db = require("../models");

module.exports = () => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email", // req.body.email (body에 해당되는)
        passwordField: "password", // req.body.password
      },
      async (email, password, done) => {
        try {
          // 디비 사용해서 검사
          const exUser = await db.User.findOne({ where: { email } });
          if (!exUser) {
            // 콜백함수  에러  성공                    실패
            return done(null, false, { reason: "존재하지 않는 사용자입니다." });
          }
          // 사용자 있으면 비밀번호 비교
          const result = await bcrypt.compare(password, exUser.password);
          if (result) {
            console.log("로그인 성공 passport/local.js", result);
            return done(null, exUser);
          } else {
            return done(null, false, { reason: "비밀번호가 틀립니다." });
          }
        } catch (err) {
          console.error(err);
          return done(err);
        }
      }
    )
  );
};
