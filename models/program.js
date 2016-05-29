//本文件用于上传节目信息到数据库
var mongodb = require('./db');
var ObjectID = require('mongodb').ObjectID;

function Program (program) {
  this.name = program.name;
  this.player = program.player;
  this.description = program.description;
  this.votenumber = program.votenumber;
};

module.exports = Program;

//存储节目信息
Program.prototype.save = function(callback) {
  //要存入数据库的节目文档
  var program = {
      name: this.name,
      player: this.player,
      description: this.description,
      votenumber: this.votenumber
  };
   //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);//错误，返回 err 信息
    }
    //读取 programs 集合
    db.collection('programs', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);//错误，返回 err 信息
      }
      //console.log("get message");
      //将节目数据插入 programs 集合
      collection.insert(program, {
        safe: true
      }, function (err, program) {
        mongodb.close();
        if (err) {
          return callback(err);//错误，返回 err 信息
        }
        callback(null);//成功！err 为 null，并返回存储后的用户文档
      });
    });
  });
};

//读取节目信息
Program.get = function(name, callback) {
  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);//错误，返回 err 信息
    }
    //读取 programs 集合
    db.collection('programs', function (err, collection) {
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

// 更新数据库

Program.update = function(id, callback) {
  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);//错误，返回 err 信息
    }
    //读取 programs 集合
    db.collection('programs', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);//错误，返回 err 信息
      }

      var query = {    //查询依据
        _id : new ObjectID(id)
      };


      var document = {   //更新数据的内容
        $inc : {
          votenumber : 1
        }
      };
      

      var options = {     // 返回跟新后的文档
        returnOriginal: false
      };

      //根据 query 对象产询文章
      collection.findOneAndUpdate(query, document, options, function(err, result) {
        if (err) {
          return callback(err,null);//错误，返回 err 信息
        }

        return callback(null,result);
      });
    });
  });
};

