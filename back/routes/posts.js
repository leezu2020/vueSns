const express = require("express");

const db = require("../models");

const router = express.Router();

router.delete("/:id", async (req, res, next) => {
  try {
    await db.Post.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.send("삭제했습니다.");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  // GET  /posts?offset=10&limit=10
  try {
    let where={}
    if(parseInt(req.query.lastId, 10)){
      where={
        id: {
          // lt 미만, lte 이하, gt 초과, gte 이하, ne 불일치 등
          [db.Sequelize.Op.lt]: parseInt(req.query.lastId, 10),
        }
      }
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
      order: [["createdAt", "DESC"]],
      limit: parseInt(req.query.limit, 10) || 10,
    });
    console.log('posts 결과 ', posts)
    res.json(posts);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
