module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define(
    "Post",
    {
      // 테이블명 posts
      content: {
        type: DataTypes.TEXT, // 매우 긴 글
        allowNull: false,
      },
    },
    {
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
    }
  );

  Post.associate = (db) => {
    db.Post.belongsTo(db.User); // UserId가 추가됨
    db.Post.hasMany(db.Comment);
    db.Post.hasMany(db.Image);
    db.Post.belongsToMany(db.User, { through: "Like", as: "Likers" }); // as가 없으면 똑같이 UserId가 생성되는 문제가 생기기 때문에
    db.Post.belongsTo(db.Post, { as: "Retweet" }); // PostId대신 RetweetId를 생성
    db.Post.belongsToMany(db.Hashtag, { through: "PostHashtag" });
  };

  return Post;
};
