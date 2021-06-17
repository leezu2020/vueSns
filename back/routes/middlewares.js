exports.isLoggedIn = (req, res, next) => {
  console.log('req :',req)
  if (req.isAuthenticated()) {
    return next();  // next는 인수가 있으면 에러처리로 넘어감
  }
  return res.status(401).send("로그인이 필요합니다.");
};

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  return res.status(401).send("로그인한 사람은 할 수 없습니다.");
};

// 아래가 우선순위가 더 높음
// module.exports = {
//     isLoggedIn: (req, res, next) => {}
// }