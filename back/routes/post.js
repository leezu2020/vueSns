const express = require("express");
const multer = require("multer");
const path = require("path");
const { nextTick } = require("process");
const db = require("../models");

const { isLoggedIn } = require("./middlewares");
const router = express.Router();

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, done) {
      done(null, "uploads"); // uploads 폴더에 저장
    },
    filename(req, file, done) {
      const ext = path.extname(file.originalname); // 파일의 확장자 가져오기
      const basename = path.basename(file.originalname, ext); // 제로초.png -> basename = 제로초, ext = .png
      done(null, basename + Date.now() + ext);
    },
  }),
  limit: { fileSize: 20 * 1024 * 1024 }, // 업로드 제한 용량
});

router.post("/", isLoggedIn, async (req, res, next) => {
  // POST /post  게시물 작성
  try {
    // req.body.content = '안녕하세요! 여러분~! #NodeJs #Vue' 에서 해시태그 추출해야함 -> 정규표현식 사용
    // req.body.imagePaths
    const hashtags = req.body.content.match(/#[^\s#]+/g);
    const newPost = await db.Post.create({
      content: req.body.content,
      UserId: req.user.id, // deserialize의 결과물
    });
    if (hashtags) {
      const result = await Promise.all(
        hashtags.map((tag) =>
          db.Hashtag.findOrCreate({
            // findOrCreate : 찾거나 생성
            // await안쓰고 map쓰면 promise가 배열로 되어있기때문에 -> promise.all
            // 안쪽부터 하나씩
            where: { name: tag.slice(1).toLowerCase() }, // #때고 소문자로 저장
          })
        )
      );
      // db.Post.belongstomany(db.hashtag ~~) 인해 addhashtags 생성(sequelize가 자동으로)
      await newPost.addHashtags(result.map((r) => r[0])); // 해시태그 이름을 r[0]으로 찾음
    }
    console.log(req.body.image, "req 바디 이미지");
    if (req.body.image) {
      if (Array.isArray(req.body.image)) {
        console.log("이미지 배열로 들어옴");
        await Promise.all(
          req.body.image.map((image) => {
            return db.Image.create({ src: image, PostId: newPost.id }); // await가 안붙으면 promise, promise.all 이면 map
            // newPost.addImages(images) 는 비효율적이라 사용x
          })
        );
      } else {
        console.log("이미지 하나만 들어옴");
        // 하나일때 배열로 안보내는 버그가 있어서
        await db.Image.create({
          src: req.body.image,
          PostId: newPost.id,
        });
      }
    }

    // 작성한 사람의 정보까지
    const fullPost = await db.Post.findOne({
      where: { id: newPost.id },
      include: [
        {
          model: db.User,
          attributes: ["id", "nickname"], // 가져올 속성 제한
        },
        {
          model: db.Image,
        },
        {
          model: db.User,
          as: "Likers",
          attributes: ["id"],
        },
      ],
    });
    return res.json(fullPost);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get("/:id/comments", async (req, res, next) => {
  try {
    const post = await db.Post.findOne({ where: { id: req.params.id } });
    if (!post) {
      return res.status(404).send("포스트가 존재하지 않습니다.");
    }
    const comments = await db.Comment.findAll({
      where: {
        PostId: req.params.id,
      },
      include: [
        {
          model: db.User,
          attributes: ["id", "nickname"],
        },
      ],
      order: [["createdAt", "ASC"]], // 2차원 배열인거 주의
    });
    res.json(comments);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post("/:id/comment", isLoggedIn, async (req, res, next) => {
  try {
    const post = await db.Post.findOne({ where: { id: req.params.id } });
    if (!post) {
      return res.status(404).send("포스트가 존재하지 않습니다.");
    }
    console.log("댓글 : ", req.body, req.body.content);
    const newComment = await db.Comment.create({
      PostId: post.id,
      UserId: req.user.id,
      content: req.body.content,
    });
    const comment = await db.Comment.findOne({
      where: {
        id: newComment.id,
      },
      inlcude: [
        {
          model: db.User,
          attributes: ["id", "nickname"],
        },
      ],
    });
    return res.json(comment);
  } catch (err) {
    next(err);
  }
});

router.post("/images", isLoggedIn, upload.array("image"), (req, res) => {
  // req.files = [{ filename: '이미지210230.png'}, {filename: '테스트20210303.png'}] 형태
  console.log(req.files);
  res.json(req.files.map((v) => v.filename)); // 이미지 주소
});

router.post("/:id/retweet", isLoggedIn, async (req, res, next) => {
  try {
    const post = await db.Post.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: db.Post,
          as: "Retweet", // 리트윗한 게시글이면 원본 게시글이 됨
        },
      ],
    });
    if (!post) {
      return res.status(404).send("포스트가 존재하지 않습니다.");
    }
    if (
      req.user.id === post.UserId ||
      (post.Retweet && post.Retweet.UserId === req.user.id)
    ) {
      // 내가 내 게시물 리트윗
      return res.status(403).send("자신의 글은 리트윗할 수 없습니다.");
    }
    const retweetTargetId = post.RetweetId || post.id;
    const exPost = await db.Post.findOne({
      where: {
        UserId: req.user.id,
        RetweetId: retweetTargetId,
      },
    });
    if (exPost) {
      return res.status(403).send("이미 리트윗했습니다.");
    }
    const retweet = await db.Post.create({
      UserId: req.user.id,
      RetweetId: retweetTargetId, // 원본 아이디
      content: "retweet", // 필수로 설정해놔서 아무거나 넣어놓음
    });
    const retweetWithPrevPost = await db.Post.findOne({
      where: { id: retweet.id },
      include: [
        {
          model: db.User,
          attributes: ["id", "nickname"],
        },
        {
          model: db.User,
          as: "Likers",
          attributes: ["id"],
        },
        {
          model: db.Post,
          as: "Retweet",
          include: [
            {
              model: db.User,
              attributes: ["id", "nickname"],
            },
            {
              model: db.Image,
            },
          ],
        },
      ],
    });
    res.json(retweetWithPrevPost);
  } catch (err) {
    console.error(err);
  }
});

router.post("/:id/like", isLoggedIn, async (req, res, next) => {
  try {
    const post = await db.Post.findOne({ where: { id: req.params.id } });
    if (!post) {
      return res.status(404).send("포스트가 존재하지 않습니다.");
    }
    await post.addLiker(req.user.id);
    res.json({ userId: req.user.id });
  } catch (e) {
    console.error(e);
    next(e);
  }
});

router.delete("/:id/like", isLoggedIn, async (req, res, next) => {
  try {
    const post = await db.Post.findOne({ where: { id: req.params.id } });
    if (!post) {
      return res.status(404).send("포스트가 존재하지 않습니다.");
    }
    await post.removeLiker(req.user.id);
    res.json({ userId: req.user.id });
  } catch (e) {
    console.error(e);
    next(e);
  }
});

module.exports = router;
