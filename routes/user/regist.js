require('../../utils/const');
var userDao=require('../../dao/userDao');
var express = require('express');
var router = express.Router();

/**
 * 用户注册接口
 * */
router.post('/', function(req, res, next) {
  var result={code:REQ_SUCCESS};
  result.msg="用户注册成功!";
  var user=req.body;
  console.log(user);
  if(!user.account || (user.account=='')){
    result.code=REQ_FAILED;
    result.msg="账号名不能为空!";
      res.json(result);
  }else{
      result.body=user;
      //1、判断用户账号是否已经存在
      userDao.exists(user.account,function(success){
          if(success){
              result.code=REQ_FAILED;
              result.msg="账号名已存在，请更换!";
              res.json(result);
          }else{
              //2、如果不存在则插入数据,返回成功
              userDao.add(user,function(success){
                  if(success){
                      result.body=user;
                      res.json(result);
                  }else{
                      result.code=REQ_FAILED;
                      result.msg="注册失败，服务器异常!";
                      res.json(result);
                  }
              });
          }
      });

  }

});

module.exports = router;
