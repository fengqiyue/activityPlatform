//本文件用于上传图片信息到数据库
var mongodb = require('./db');

function Photo (photo) {
  this.name = photo.name;
  this.photopath = photo.photopath;
};

module.exports = Photo;

//存储图片名
Photo.prototype.save = function(callback) {
  //要存入数据库的照片信息
  var photo = {
      name: this.name,
      photopath: this.photopath,
      time: new Date().getTime()
  };
   //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);//错误，返回 err 信息
    }
    //读取 photos 集合
    db.collection('photos', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);//错误，返回 err 信息
      }
      
      //将数据插入 photos 集合
      collection.insert(photo, {
        safe: true
      }, function (err, photo) {
        mongodb.close();
        if (err) {
          return callback(err);//错误，返回 err 信息
        }
        callback(null);//成功！err 为 null，并返回存储后的用户文档
      });
    });
  });
};

//读取图片信息
Photo.get = function(name, callback) {
  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);//错误，返回 err 信息
    }
    //读取 photos 集合
    db.collection('photos', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);//错误，返回 err 信息
      }
      var query = {};
      if (name) {
        query.name = name;
      }
      //根据 query 对象产询文章
      collection.find(query).sort({ 'time': -1 }).toArray(function (err, docs) {
        mongodb.close();
        if (err) {
          return callback(err);//失败！返回 err 信息
        }
        console.log(docs);
        callback(null, docs);//成功！返回查询的节目信息
      });
    });
  });
};