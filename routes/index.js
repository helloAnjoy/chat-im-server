var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '欢迎来到即时聊天系统' });
});

module.exports = router;
