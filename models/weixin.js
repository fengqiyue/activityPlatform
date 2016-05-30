//本文件用于上传从微信获得的数据到数据库
var mongodb = require('./db');

function Weixin (weixin) {
  this.name = weixin.name;    //昵称
  this.imgurl = weixin.imgurl;  //头像链接
};

//存储节目信息
Weixin.prototype.save = function(callback) {
  //要存入数据库的节目文档
  var weixin = {
      name: this.name,
      imgurl:this.imgurl
  };
   //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);//错误，返回 err 信息
    }
    //读取 weixins 集合
    db.collection('weixins', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);//错误，返回 err 信息
      }

      collection.insert(weixin, {
        safe: true
      }, function (err, weixin) {
        mongodb.close();
        if (err) {
          return callback(err);//错误，返回 err 信息
        }
        callback(null);//成功！err 为 null，并返回存储后的用户文档
      });
    });
  });
};