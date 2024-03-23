var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/admin";


module.exports = {
    exists:function(account,callback){
        MongoClient.connect(url, function(err, db) {
            if (err) {
                console.error("数据库连接失败!");
                callback(false);
                return;
            };
            var dbo = db.db("db_chat");
            dbo.collection("user"). find({account:account}).toArray(function(err, result) { // 返回集合中所有数据
                if (err) {
                    console.error("查询账号失败!");
                    return callback(false);
                };
                console.log(result);
                if(result.length>0){
                    callback(true);
                }else{
                    callback(false);
                }
                db.close();
            });
        });
    },
    add:function(user,callback){
        MongoClient.connect(url, function(err, db) {
            if (err) {
                console.error("数据库连接失败!");
                callback(false);
                return;
            };
            var dbo = db.db("db_chat");
            dbo.collection("user").insertOne(user, function(err, res) {
                if (err) {
                    console.error("注册失败!");
                    return callback(false);
                };
                callback(true);
                console.log("注册成功");
                db.close();
            });
        });
        console.log("添加成功！");


    },
    existsAccountPassword:function(account , password,callback){
        MongoClient.connect(url, function(err, db) {
            if (err) {
                console.error("数据库连接失败!");
                callback(false);
                return;
            };
            var dbo = db.db("db_chat");
            dbo.collection("user"). find({
                account:account,
                password:password
            }).toArray(function(err, result) { // 返回集合中所有数据
                if (err) {
                    console.error("查询账号失败!");
                    return callback(false);
                };
                console.log(result);
                if(result.length==1){
                    console.log("存在该账号密码!");
                    callback(true,result[0]);
                }else{
                    callback(false);
                }
                db.close();
            });
        });
    },
    update:function(user,callback){
        MongoClient.connect(url, function(err, db) {
            if (err) {
                console.error("数据库连接失败!");
                callback(false);
                return;
            };
            var dbo = db.db("db_chat");
            var whereStr = {"_id":user.id};  // 查询条件
            var updateStr = {$set: user};
            dbo.collection("user").updateOne(whereStr, updateStr, function(err, res) {
                if (err) {
                    console.error("修改失败!");
                    callback(false);
                    return;
                }
                callback(true);
                console.log("文档更新成功");
                db.close();
            });
        });
    },
    userInfo:function(user,callback){
        MongoClient.connect(url, function(err, db) {
            if (err) {
                console.error("数据库连接失败!");
                callback(false);
                return;
            }
            var dbo = db.db("db_chat");
            var whereStr = {"account":user.account};  // 查询条件
            dbo.collection("user").find(whereStr).toArray(function(err, result) {
                if (err){
                    console.error("查询失败!");
                    callback(false);
                    return;
                }
                callback(true);
                console.log("查询成功");
                db.close();
            });
        });
    },
    getUsers:function(callback){
        MongoClient.connect(url, function(err, db) {
            if (err) {
                console.error("数据库连接失败!");
                callback(false);
                return;
            }
            var dbo = db.db("db_chat");
            dbo.collection("user").find({}).toArray(function(err, result) {
                if (err){
                    console.error("查询失败!");
                    callback(false);
                    return;
                }
                callback(true,result);
                console.log("查询成功");
                db.close();
            });
        })
    }
}
