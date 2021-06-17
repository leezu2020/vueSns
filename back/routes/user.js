const express = require("express");
const bcrypt = require("bcrypt");
const passport = require("passport");
const db = require("../models");
const { isNotLoggedIn, isLoggedIn } = require("./middlewares");

const router = express.Router();

router.get("/", isLoggedIn, async (req, res, next) => {
  const user = req.user;
  res.json(user);
});

router.get("/:id", async (req, res, next) => {
  try {
    const user = await db.User.findOne({
      where: { id: parseInt(req.params.id, 10) },
      include: [
        {
          model: db.Post,
          as: "Posts",
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
      attributes: ["id", "nickname"],
    });
    res.json(user);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post("/", isNotLoggedIn, async (req, res, next) => {
  try {
    const hash = await bcrypt.hash(req.body.password, 12);
    const exUser = await db.User.findOne({
      where: {
        email: req.body.email,
      },
    });
    // 존재하는 이메일
    if (exUser) {
      return res.status(403).json({
        errorCode: 1,
        message: "이미 회원가입되어있습니다.",
      });
    }
    await db.User.create({
      email: req.body.email,
      password: hash,
      nickname: req.body.nickname,
    });
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error(err);
        return next(err);
      }
      if (info) {
        return res.status(401).send(info.reason);
      }
      // passport.initialize로 인해 생김
      // session에 사용자 정보 저장 (어떻게 저장??)
      return req.login(user, async (err) => {
        if (err) {
          console.error(err);
          return next(err);
        }
        const fullUser = await db.User.findOne({
          where: { id: user.id },
          attributes: ["id", "email", "nickname"],
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
        return res.json(fullUser);
      });
    })(req, res, next);
  } catch (e) {
    console.error(e);
    return next(e);
  }
});

router.post("/login", isNotLoggedIn, (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error(err);
      return next(err);
    }
    if (info) {
      return res.status(401).send(info.reason);
    }
    // passport.initialize로 인해 생김
    // session에 사용자 정보 저장 (어떻게 저장??)
    return req.login(user, async (err) => {
      if (err) {
        console.error(err);
        return next(err);
      }
      const fullUser = await db.User.findOne({
        where: { id: user.id },
        attributes: ["id", "email", "nickname"],
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
      return res.json(fullUser);
    });
  })(req, res, next);
});

router.post("/logout", isLoggedIn, (req, res) => {
  if (req.isAuthenticated()) {
    req.logout();
    req.session.destroy(); // 선택사항
    return res.status(200).send("로그아웃 되었습니다.");
  }
});

router.get("/:id/posts", async (req, res, next) => {
  try {
    let where = {
      UserId: parseInt(req.params.id, 10),
      RetweetId: null, // 리트윗 게시글 빼고
    };
    if (parseInt(req.query.lastId, 10)) {
      wehre[db.Sequelize.Op.lt] = parseInt(req.query.lastId, 10);
    }
    const posts = await db.Post.findAll({
      where,
      include: [
        {
          model: db.User,
          attributes: ["id", "nickname"],
        },
        {
          model: db.Image,
        },
        {
          model: db.User,
          through: "Like",
          as: "Likers",
          attributes: ["id"],
        },
      ],
    });
    res.json(posts);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post("/:id/follow", isLoggedIn, async (req, res, next) => {
  try {
    const me = await db.User.findOne({
      where: { id: req.user.id },
    });
    await me.addFollowing(req.params.id);
    res.send(req.params.id);
  } catch (e) {
    console.error(err);
    next(e);
  }
});

router.delete("/:id/follow", isLoggedIn, async (req, res, nxet) => {
  try {
    const me = await db.User.findOne({
      where: { id: req.user.id },
    });
    await me.removeFollowing(req.params.id);
    res.send(req.params.id);
  } catch (e) {
    console.error(err);
    next(e);
  }
});

router.patch("/nickname", isLoggedIn, async (req, res, next) => {
  try {
    await db.User.update(
      {
        // 뭘 수정할지
        nickname: req.body.nickname,
      },
      {
        // 조건
        where: { id: req.user.id },
      }
    );
    res.send(req.body.nickname);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

router.get("/:id/followings", isLoggedIn, async (req, res, next) => {
  try {
    const user = await db.User.findOne({
      where: { id: req.user.id },
    });
    const followings = await user.getFollowings({
      attributes: ["id", "nickname"],
      limit: parseInt(req.query.limit || 3, 10),
      offset: parseInt(req.query.offset || 0, 10),
    });
    res.json(followings);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get("/:id/followers", isLoggedIn, async (req, res, next) => {
  try {
    const user = await db.User.findOne({
      where: { id: req.user.id },
    });
    const followers = await user.getFollowers({
      attributes: ["id", "nickname"],
      limit: parseInt(req.query.limit || 3, 10),
      offset: parseInt(req.query.offset || 0, 10),
    });
    res.json(followers);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.delete("/:id/follower", isLoggedIn, async (req, res, next) => {
  try {
    const me = await db.User.findOne({
      where: { id: req.user.id },
    });
    await me.removeFollower(req.params.id);
    res.send(req.params.id);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
