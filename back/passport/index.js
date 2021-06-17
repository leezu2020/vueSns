const passport = require("passport");
const local = require("./local");
const db = require("../models");

// 함수형태인 이유, 필요할 때 재사용 이유
module.exports = () => {
  passport.serializeUser((user, done) => {
    console.log("serializeUser 실행", user.id);
    return done(null, user.id);
  });

  // 로그인 후에 모든 요청마다 실행됨
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await db.User.findOne({
        where: { id },
        atrribute: ["id", "nickname"],
        include: [
          {
            model: db.Post,
            attributes: ["id"],
          },
          {
            model: db.User,
            as: "Followings",
            attributes: ["id"],
          },
          {
            model: db.User,
            as: "Followers",
            attributes: ["id"],
          },
        ],
      });
      console.log("req.isAuthenticated 변환", user.id);
      return done(null, user); // req.user 에 넣어줌, req.isAuthenticated() 를 true로 만들어줌
    } catch (err) {
      console.error("req.isAuthenticated false", err);
      return done(err);
    }
  });
  local();
};
