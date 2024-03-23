require('../../utils/const');
var userDao=require('../../dao/userDao');
var express = require('express');
var router = express.Router();
global.loginUsers={};//已登录用户信息缓存
/**
 * 用户登录接口
 * */
router.post('/', function(req, res, next) {
    var result={code:REQ_SUCCESS};
    result.msg="用户登录成功!";
    var user=req.body;
    console.log(user);
    if(!user.account || (user.account=='')){
        result.code=REQ_FAILED;
        result.msg="账号名不能为空!";
        res.json(result);
    }else{
        userDao.existsAccountPassword(user.account,user.password,function(success,user){
            if(success){
                result.body=user;
                res.json(result);
                //保存登录成功的用户信息
                global.loginUsers[user.account]=user;
            }else{
                result.code=REQ_FAILED;
                result.msg="账号或者密码错误!";
                res.json(result);
            }
        });
    }
});

module.exports = router;
