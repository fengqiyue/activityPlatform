//本文件用于上传从微信获得的数据到数据库
var mongodb = require('./db');

function Weixin (weixin) {
  this.name = weixin.name;    //昵称
  this.imgurl = weixin.imgurl;  //头像链接
  this.openid = weixin.openid;
};

module.exports = Weixin;

//存储信息
Weixin.prototype.save = function(callback) {
  //要存入数据库的文档
  var weixin = {
      openid: this.openid,
      name: this.name,
      imgurl:this.imgurl,
      time: new Date().getTime()
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
      
      collection.update ({openid : weixin.openid}, weixin ,{
        upsert:true
      }), function (err, weixin) {
        mongodb.close();
        if (err) {
          return callback(err);//错误，返回 err 信息
        }
        callback(null);//成功！err 为 null，并返回存储后的用户文档
      });

      // collection.insert(weixin, {
      //   safe: true
      // }, function (err, weixin) {
      //   mongodb.close();
      //   if (err) {
      //     return callback(err);//错误，返回 err 信息
      //   }
      //   callback(null);//成功！err 为 null，并返回存储后的用户文档
      // });

    });
  });
};

Weixin.get = function(name, callback) {
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
      var query = {};
      if (name) {
        query.name = name;
      }
      //根据 query 对象产询文章
      collection.find(query).sort(function(a, b) {
        return a.time - b.time
      }).toArray(function (err, docs) {
        mongodb.close();
        if (err) {
          return callback(err);//失败！返回 err 信息
        }
        callback(null, docs);//成功！返回查询的节目信息
      });
    });
  });
};