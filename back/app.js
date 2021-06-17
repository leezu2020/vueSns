const express = require("express");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const cookie = require("cookie-parser");
const morgan = require("morgan");

const db = require("./models");
const passportConfig = require("./passport");
const userRouter = require("./routes/user");
const postRouter = require("./routes/post");
const postsRouter = require("./routes/posts");
const hashtagRouter = require("./routes/hashtag");
const app = express();

db.sequelize.sync();
//스키마 바꾼걸 적용할 때
//db.sequelize.sync({ force: true });
passportConfig();

app.use(morgan("dev"));
app.use(
  // 백엔드와 프론트 사이에 쿠키 전달 위해
  cors({
    origin: "http://localhost:3080",
    credentials: true,
  })
);

app.use("/", express.static("uploads")); // 보안상 백엔드 주소(/uploads) 와 프론트주소(/)를 다르게해줌
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookie("cookiesecret"));
app.use(
  session({
    secret: "cookiesecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.send("안녕 ㅎㅎ");
});

app.use("/user", userRouter);
app.use("/post", postRouter);
app.use("/posts", postsRouter);
app.use("/hashtag", hashtagRouter);

app.listen(3085, () => {
  console.log(`백엔드 서버 ${3085}번 포트에서 작동중.`);
});
