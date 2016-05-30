var express = require('express');
var fs = require('fs');
var router = express.Router();
var path = require('path');
var multer = require('multer');
var crypto = require('crypto');
var Program = require('../models/program.js');
var Photo = require('../models/photo.js');
var Weixin = require('../models/weixin.js')
var request = require('request');

// var data = fs.readFileSync(path.join(__dirname, '..', 'id.txt'));
// data = data.toString();
// if(data=='') list = [];
// else list = data.split(',');
// console.log(list.length);

var storage = multer.diskStorage({
     //设置上传后文件路径，uploads 文件夹会自动创建。
      destination: function (req, file, cb) {
            cb(null, './public/uploads')
       }, 
     //给上传文件重命名，获取添加后缀名
      filename: function (req, file, cb) {
          var fileFormat = (file.originalname).split(".");
          cb(null, Date.now() + "." + fileFormat[fileFormat.length - 1]);
          var thefilename = Date.now() + "." + fileFormat[fileFormat.length - 1];
      }
 });  


var upload = multer({ storage: storage}); // multer 上传

router.get('/screen', function (req, res) {  //show 弹幕墙
  res.render('screen');
});

router.get('/barrage', function (req, res) { //弹幕墙
  res.redirect("https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxc786068b2326a6b4&redirect_uri=http://house.duanpengfei.com/weixin&response_type=code&scope=snsapi_userinfo&state=1#wechat_redirect");
  res.render('barrage');
});

router.get('/weixin', function (req, res){
    var code = req.query.code;
    console.log("code="+code);
    request("https://api.weixin.qq.com/sns/oauth2/access_token?appid=wxc786068b2326a6b4&secret=a4117e467157a0712385194f99c28eba&code="+code+"&grant_type=authorization_code", function (error, response, body){
      body = typeof body !== 'object' ? JSON.parse(body) : body;

      var access_token = body.access_token;
      console.log("access_token="+access_token);
      var openid = body.openid;
      console.log("openid="+openid);
      request("https://api.weixin.qq.com/sns/userinfo?access_token="+access_token+"&openid="+ openid, function (error, response2, body2){
        body2 = typeof body2 !== 'object' ? JSON.parse(body2) : body2;

        var nickname = body2.nickname;
        var imgurl = body2.headimgurl;

        var newWeixin = new Weixin ({

        name :nickname,
        imgurl :imgurl,
        openid: openid
        });

        newWeixin.save(function (err, weixin){
          if(err) {
            req.flash('error',err);
            return res.redirect('/barrage');
          }
          res.render('barrage');
        });
      });
    });
});

router.get('/homepage', function (req, res){       //主页
	res.render('homepage');
});

router.get('/photowall', function (req, res){     //照片墙
    Photo.get(null, function (err, photos) {
      if (err) {
        photo = [];
      }  
	  res.render('photowall', { 
		'photos':photos,
		'success': req.flash('success').toString(), 
		'error': req.flash('error').toString()
	  });
	});
});

router.get('/showphotowall', function (req, res) {  //show照片墙
  Photo.get(null, function (err, photos) {
      if (err) {
        photo = [];
      }  
    res.render('showphotowall', { 
    'photos':photos
    });
  });
});

router.post('/upload', upload.array('upload'), function (req, res) {      //上传图片信息
    var name = req.files[0].filename;
    var photopath = req.files[0].path;
    var newPhoto = new Photo ({
        name :name,
        photopath :photopath
    });

    newPhoto.save(function (err, photo){
	  	if(err) {
	  		req.flash('error',err);
	  		return res.redirect('/photowall');
	  	}
	    req.flash('success', '上传成功O(∩_∩)O,点我一下');
      res.redirect('/photowall');
    });
}); 

router.get('/votemanager', function (req, res){       //投票管理界面,获得需被投票的内容
    Program.get(null, function (err, programs) {
      if (err) {
        programs = [];
      } 
      res.render('votemanager', {
      	'programs': programs,
     	  'success': req.flash('success').toString(), 
		    'error': req.flash('error').toString()
      });
    });
});

router.get('/vote', function (req, res){ //投票界面
	Program.get(null, function (err, programs) {
      if (err) {
        programs = [];
      }  
      res.render('vote', {
      	'programs': programs,
     	  'success': req.flash('success').toString(), 
		    'error': req.flash('error').toString()
      });
    });
});

router.get('/lottery', function (req, res) {
  Weixin.get(null, function (err, weixins) {
    if (err) {
      weixins = [];
    }  
    // console.log("weixins ========"+weixins);
    res.render('lottery', { 
      'weixins': weixins
    });
   });
});

router.get('/showvote', function (req, res) {    //投票结果
  Program.get(null, function (err, programs) {
      if (err) {
        programs = [];
      }  
      res.render('showvote', {
        'programs': programs
      });
    });
});

router.get('/getId', function (req, res) {
  res.json({list: list});
});

router.post('/submitprogram', function (req, res) {  //上传被投票节目的信息
  var name = req.body.name;
  var player = req.body.player;
  var description = req.body.description;
  var votenumber = 0;
  
  var newProgram = new Program({
  	name :name,
  	player: player,
  	description : description,
    votenumber: votenumber
  });

  newProgram.save(function(err, program) {
  	if(err) {
  		req.flash('error',err);
  		return res.redirect('/votemanager');
  	}
  	req.flash('success', '提交成功');
  	res.redirect('/votemanager');
  });
});

router.post('/voted',function (req, res) {  //投票信息处理
  var newid = req.body.avote;

    Program.update(newid, function(err,program){
      if(err) {
      req.flash('error',err);
      return res.redirect('/vote');
    }
      req.flash('success', '投票成功,点我一下消失');
      console.log(req.flash('success'));
      res.redirect('/vote',{
        'success': req.flash('success').toString(), 
        'error': req.flash('error').toString()
      });
    });   
});

module.exports = router;









