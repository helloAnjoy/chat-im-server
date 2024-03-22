require('../../utils/const');
var userDao=require('../../dao/userDao');
var express = require('express');
var router = express.Router();

/**
 * 获取用户信息列表接口
 * */
router.get('/', function(req, res, next) {
    var result={code:REQ_SUCCESS};
    result.msg="获取用户信息列表成功!";
    userDao.getUsers(function(success,users){
        if(success){
            result.body=users;
            res.json(result);
        }else{
            result.code=REQ_FAILED;
            result.msg="获取失败!";
            res.json(result);
        }
    });
});

module.exports = router;
