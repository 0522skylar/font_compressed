const express = require('express')
const home = express.Router();
const path = require('path');
const Fontmin = require('fontmin');
const fs = require('fs');
const ttf2woff2 = require('ttf2woff2');
const multer = require('multer') //导入multer中间件


// 根据当前文件目录指定文件夹
const dir = path.resolve(__dirname, '../public/upload');
// 图片大小限制KB
const SIZELIMIT = 5000000; //1923148
const storage = multer.diskStorage({
    // 指定文件路径
    destination: function (req, file, cb) {
        cb(null, dir);
    },
    // 指定文件名
    filename: function (req, file, cb) {
        // filedname指向参数key值
        cb(null, file.originalname);
    }
});
const upload = multer({
    storage: storage
});
// 引入常用文字
const data = require('../data/fan.json');
home.all("*", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header("Cache-Control", "no-store"); //禁用缓存
    next();
})



//--------------------------------动态解析字体------------------


home.get('/font-test', (req, res) => { // 根据传递过来的文字，打印输出包含该文字的字体包
    // 字体源文件
    let font = req.query.font;
    console.log(font, ' 字体包名称')
    var srcPath = path.join(__dirname, '../assets/fonts/' + font + '.ttf');
    var text = data.text;

    // 文字去重
    var textArr = Array.from(new Set(text.split('')));
    text = textArr.join('');

    // 初始化
    var fontmin = new Fontmin().src(srcPath).use(
        // 字型提取插件
        Fontmin.glyph({
            text: text // 所需文字
        })
    );
    if (font.length === 0) {
        res.send({
            code: 0,
            msg: '没有传输字体包名称'
        })
        return
    }
    fontmin.run(function (err, files, stream) {
        if (err) {
            // 异常捕捉
            console.error(err);
        } else {
            console.log('解析完毕， 保存到路由中，没有保存到本地')
            res.send(files[0].contents);
        }
    });
})
//---------------------------------ttf-->woff2-------------------


home.get('/ttf-to-woff', (req, res) => {
    console.log(req.query.name)
    let fileName = req.query.name;
    if (fileName === undefined) {
        res.send({
            code: -1,
            msg: '系统中没有该文件名'
        })
    }
    // 同步读取文件
    var input = fs.readFileSync(path.join(__dirname, '../public/upload/'+ fileName));
    fileName = fileName.split('.')[0];
    // ttf格式转换成woff2格式
    fs.writeFile(path.join(__dirname, '../public/woff/'+ fileName + '.woff2'), ttf2woff2(input), (err) => {
        console.log('write  ing-------finish---------------')
        res.send({
            code: 200,
            msg: '转换成功',
            url: fileName + '.woff2'
        })
    });
})

//--------------------------------upload------------------------------------

home.post('/upload', upload.single('file'), async (req, res) => {
    // 即将上传图片的key值 form-data对象{key: value}
    // 检查是否有文件待上传
    if (req.file === undefined) {
        return res.send({
            errno: -1,
            msg: 'no file'
        });
    }
    const {
        size,
        originalname,
        filename
    } = req.file;
    const types = ['ttf'];
    const tmpTypes = originalname.split('.')[1];
    console.log('fileInfo', size, originalname, filename)
    // 检查文件大小
    if (size >= SIZELIMIT) {
        return res.send({
            errno: -1,
            msg: 'file is too large'
        });
    }
    // 检查文件类型
    else if (types.indexOf(tmpTypes) < 0) {
        return res.send({
            errno: -1,
            msg: 'not accepted filetype'
        });
    }
    // 路径可根据设置的静态目录指定
    const url = '/public/upload/' + filename;
    res.json({
        errno: 0,
        msg: 'upload success',
        url,
        fileName: filename
    });
});

// 传送文字给页面
home.post('/send-word', (req, res) => {
    console.log('传送成功！')
    res.send({
        code: 200,
        ...data
    })
})
// 把页面中添加的文字写入文件中
home.post('/write-word', (req, res) => {
    let word = req.body.addtext
    let strWord = data.text + word;
    let arr = [...new Set(strWord.split(' '))]
    let jsonObj = {
        text: arr.join('')
    }
    console.log('开始写入--------')
    fs.writeFile(path.join(__dirname, '../data/fan.json'), JSON.stringify(jsonObj), (err) => {
        console.log('写入成功！', err)
        res.send({
            code: 200,
            msg: '写入成功'
        })
    })

})


module.exports = home;