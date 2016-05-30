var express = require('express');
var fs = require('fs');
var router = express.Router();
var path = require('path');
var multer = require("multer");
var crypto = require('crypto');
var Program = require('../models/program.js');
var Photo = require('../models/photo.js');

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
    var code = req.querry.code;
    console.log(code);
    res.render('weixin',{
      "code":code
    });
    // res.redirect("https://api.weixin.qq.com/sns/oauth2/access_token?appid=
    //   wxc786068b2326a6b4&secret=a4117e467157a0712385194f99c28eba&code=
    //   "+code+"&grant_type=authorization_code");
    // var access_token = req.body.access_token;
    // var openid = req.body.openid;
    // var scope = req.body.scope;
    // res.redirect("https://api.weixin.qq.com/sns/userinfo?access_token="+access_token+"&openid="+openid);
    // res.redirect('/barrage');
});

// router.get('/input', function(req, res) {
//   res.render('input');
// });

router.get('/homepage', function (req, res){  //主页
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

router.get('/votemanager', function (req, res){ //投票管理界面
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

// router.post('/addId', function(req, res) {
// 	var id = req.body.id;
// 	if(id && !isNaN(id) && id.length==8) {
// 		for(var i=0, len=list.length;i<len;i++) {
// 	  	if(list[i]==id) {
// 	  		res.json({status:null,msg:'添加失败，学号已存在'});
// 	  		var flag = 1;
// 	  		break;
// 	  	}
// 	  }
// 	  if(flag) return;
// 	  list.push(id);console.log(list.length);
// 	  fs.writeFile('id.txt',list.join(','),function(err){
//     	if(err) res.json({status:null,msg:'添加失败，服务器写入出错'});
//     	else res.json({status:'1'});
// 		});
// 	}else res.json({status:null,msg:'学号格式怪怪的 + _ +'});
// });

router.get('/lottery', function (req, res) {
  res.render('lottery');
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
    req.flash('success', '投票成功');
    res.redirect('/vote');
    });   
});




module.exports = router;









