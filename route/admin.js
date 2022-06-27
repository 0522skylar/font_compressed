const express = require('express')
const admin = express.Router();
const path = require('path');
const Fontmin = require('fontmin');
const fs = require('fs');
const cpu = require('child_process');
const ttf2woff2 = require('ttf2woff2');
const multer = require('multer') //导入multer中间件
const removeFile = require('../util/removeFile')


// 根据当前文件目录指定文件夹
const dir = path.resolve(__dirname, '../public/upload');
//大小限制KB
const SIZELIMIT = 50000000; //1923148  18412920  8125644

const storage = multer.diskStorage({
    // 指定文件路径
    destination: function (req, file, cb) {
        // ！！！相对路径时以node执行目录为基准，避免权限问题，该目录最好已存在*
        cb(null, dir);
    },
    // 指定文件名
    filename: function (req, file, cb) {
        // filedName指向参数key值
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage: storage
});
const initDir = path.resolve(__dirname, '../public/init');

const initStorage = multer.diskStorage({
     // 指定文件路径
     destination: function (req, file, cb) {
        // ！！！相对路径时以node执行目录为基准，避免权限问题，该目录最好已存在*
        cb(null, initDir);
    },
    // 指定文件名
    filename: function (req, file, cb) {
        // filedName指向参数key值
        cb(null, file.originalname);
    }
})
const initFont = multer({
    storage: initStorage
})


admin.all("*", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header("Cache-Control", "no-store"); //禁用缓存
    next();
})


//--------------------------------动态解析字体------------------

admin.get('/font-test', (req, res) => { // 根据传递过来的文字，打印输出包含该文字的字体包
    delete require.cache[require.resolve('../data/test.json')];
    const data = require('../data/test.json');
    
    // 字体源文件 
    let {font, type} = req.query;
    console.log(font, ' 字体包名称', type)
    var srcPath = path.join(__dirname, '../public/init/' + font + '.' + type);
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
admin.get('/ttf-to-woff', (req, res) => {
    let fileName = req.query.name;
    if (fileName === undefined) {
        res.send({
            code: -1,
            msg: '系统中没有该文件名'
        })
    }
    console.log(fileName, '---woff2--------')

    removeFile('woff2', fileName)

    // 同步读取文件
    // var input = fs.readFileSync('../public/upload' + fileName);
    var input = fs.readFileSync(path.join(__dirname, '../public/upload/'+ fileName));
    fileName = fileName.split('.')[0];
    cpu.execFile('/bin/ls', ['-l', '.'],function(err,stdout){
        fs.writeFile(path.join(__dirname, '../public/woff2/'+ fileName + '.woff2'), ttf2woff2(input), (err) => {
            console.log('writing-------finish---------------', err)
            res.send({
                code: 200,
                msg: '转换成功',
                url: fileName + '.woff2'
            })
        });
    });
    // ttf格式转换成woff2格式
    /*
    fs.writeFile(path.join(__dirname, '../public/woff2/'+ fileName + '.woff2'), ttf2woff2(input), (err) => {
        console.log('writing-------finish---------------', err)
        res.send({
            code: 200,
            msg: '转换成功',
            url: fileName + '.woff2'
        })
    });
    */
})

//---------------------------------ttf-->woff-------------------
admin.get('/ttf-to-woffone', (req, res) => {
    console.log(req.query.name)
    let fileName = req.query.name;
    if (fileName === undefined) {
        res.send({
            code: -1,
            msg: '系统中没有该文件名'
        })
    }
    // 删除上次文件夹中上传的文件
    removeFile('woff', fileName)

    // 同步读取文件
    var input = fs.readFileSync(path.join(__dirname, '../public/upload/'+ fileName));
    fileName = fileName.split('.')[0];
    // ttf格式转换成woff格式
    var fontmin = new Fontmin().src(input).use(Fontmin.ttf2woff({
        deflate: true
    }))
    fontmin.run(function (err, files, stream) {
        if (err) {
            // 异常捕捉
            console.error(err);
        } else {
            console.log('解析完毕， 保存到路由中，没有保存到本地')
            fs.writeFile(path.join(__dirname, '../public/woff/'+ fileName + '.woff'), files[0].contents, (err) => {
                res.send({
                    code: 200,
                    msg: '转换成功',
                    url: fileName + '.woff',
                })
            });
        }
    });
})

//---------------------------------ttf-->eot-------------------
admin.get('/ttf-to-eot', (req, res) => {
    console.log(req.query.name)
    let fileName = req.query.name;
    if (fileName === undefined) {
        res.send({
            code: -1,
            msg: '系统中没有该文件名'
        })
    }
    // 删除上次文件夹中上传的文件
    removeFile('eot', fileName)
    // 同步读取文件
    var input = fs.readFileSync(path.join(__dirname, '../public/upload/'+ fileName));
    fileName = fileName.split('.')[0];
    // ttf格式转换成eot格式
    var fontmin = new Fontmin().src(input).use(Fontmin.ttf2eot({
        deflate: true
    }))
    fontmin.run(function (err, files, stream) {
        if (err) {
            console.error(err);
        } else {
            fs.writeFile(path.join(__dirname, '../public/eot/'+ fileName + '.eot'), files[0].contents, (err) => {
                res.send({
                    code: 200,
                    msg: '转换成功',
                    url: fileName + '.eot'
                })
            });
        }
    });
})

//---------------------------------otf-->ttf-------------------
admin.get('/otf-to-ttf', (req, res) => {
    console.log(req.query.name)
    let fileName = req.query.name;
    if (fileName === undefined) {
        res.send({
            code: -1,
            msg: '系统中没有该文件名'
        })
    }
    // 删除上次文件夹中上传的文件
    removeFile('ttf', fileName)
    // 同步读取文件
    var input = fs.readFileSync(path.join(__dirname, '../public/upload/'+ fileName));
    fileName = fileName.split('.')[0];
    // otf格式转换成ttf格式
    var fontmin = new Fontmin().src(input).use(Fontmin.otf2ttf({
        deflate: true
    }))
    fontmin.run(function (err, files, stream) {
        if (err) {
            // 异常捕捉
            console.error(err);
        } else {
            fs.writeFile(path.join(__dirname, '../public/ttf/'+ fileName + '.ttf'), files[0].contents, (err) => {
                res.send({
                    code: 200,
                    msg: '转换成功',
                    url: fileName + '.ttf'
                })
            });
        }
    });
})
//--------------------------------upload------------------------------------

admin.post('/upload', upload.single('file'), async (req, res) => {

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
    // 保存文件时，先删除上次长传的文件
    removeFile('upload', filename)

    const types = ['ttf', 'otf'];
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
    // fs.unlink(dir + "\\" + filename, async (err) => {
    //   if (err) {
    //     console.log('err-----------', err);
    //     res.json({
    //       status: 1,
    //       msg: '删除文件失败'
    //     })
    //   } else {

    //   }
    // })
});

admin.post('/initFont', initFont.single('file'), async(req, res) => {
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
    const types = ['ttf', 'woff', 'woff2'];
    const textName = originalname.split('.')[0];
    const tmpTypes = originalname.split('.')[1];

    files = fs.readdirSync(path.resolve(__dirname, '../public/init'));
    files.forEach((file) => {
        if(file != filename && file != 'heiti.ttf') {
            let curPath = path.resolve(__dirname, '../public/init') + "/" + file;
            fs.unlinkSync(curPath); //删除文件
        }
    });


    console.log('fileInfo', size, originalname, tmpTypes, filename)
    // 不检查文件大小
    // 检查文件类型
    if (types.indexOf(tmpTypes) < 0) {
        return res.send({
            errno: -1,
            msg: 'not accepted filetype'
        });
    }
    // 路径可根据设置的静态目录指定
    const url = '/public/init/' + filename;
    res.json({
        errno: 0,
        msg: 'upload success',
        type: tmpTypes,
        url,
        fileName: textName
    });
})

// 传送文字给页面
admin.post('/send-word', (req, res) => {
    // const data = fs.readFileSync(path.join(__dirname, '../data/test.json'))
    // const data = require("../data/test.json")
    fs.readFile(path.join(__dirname, '../data/test.json'),'utf-8', function(err, data) {
        if(err) {
            console.log(err, 'reading---')
            res.send({
                code: -1,
                data: '未成功读取到数据'
            })
        }
        else {
            let str =  data.toString();
            let obj = JSON.parse(str);
            console.log('传送文字成功！')
            res.send({
                code: 200,
                ...obj
            })
        }
    })
    
})
// 把页面中添加的文字写入文件中
admin.post('/write-word', (req, res) => {
    let word = req.body.addtext;
    let jsonObj = {
        text: word
    }
    console.log('开始写入--------')
    fs.writeFile(path.join(__dirname, '../data/test.json'), JSON.stringify(jsonObj), (err) => {
        // fs.writeFile('../data/test.json', JSON.stringify(jsonObj), (err) => {
        console.log(err)
        console.log('写入成功！')
        res.send({
            code: 200,
            msg: '写入成功'
        })
    })

})


module.exports = admin;