const express = require('express')
// 处理路径
const path = require('path');

// 引入body-parse模块, 用来处理post请求参数
const bodyPaser = require('body-parser');
const Fontmin = require('fontmin');

const data = require('./data/fan.json');
const fs = require('fs');
const ttf2woff2 = require('ttf2woff2');
const multer = require('multer')        //导入multer中间件
const app = express()
const port = 3000


//开放静态资源文件
app.use(express.static(path.join(__dirname, 'public')));

// 告诉express框架模板所在的位置
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'html');
// 告诉express框架模板的默认后缀是什么

//当渲染后缀名为art的模板时,所使用的模板引擎是什么
app.engine('html', require('express-art-template'));


app.use(bodyPaser.json({
  limit: '10mb'
})); // for parsing application/json
app.use(bodyPaser.urlencoded({
  limit: '10mb',
  extended: true
})); // for parsing application/x-www-form-urlencoded




// 错误处理中间件
app.use((err, req, res, next) => {
  // console.log();
  console.log(err);

  const result = JSON.parse(err);
  let params = [];
  for (let attr in result) {
    if (attr != 'path') {
      params.push(attr + '=' + result[attr]);
    }
  }
  res.redirect(`${result.path}?${params.join('&')}`);
})



app.all("*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
})
app.get('/', (req, res) => {
  // res.send('Hello World!')
  res.render('./index.html');
})


app.get('/list', function (req, res) {
  res.send({
    list: listdata,
    code: 200
  })
})


app.get('/active', function (req, res) {
  res.render('./activefont.html');
})

//--------------------------------动态解析字体------------------


app.get('/font-test', (req, res) => { // 根据传递过来的文字，打印输出包含该文字的字体包
  // 字体源文件
  let font = req.query.font;
  console.log(font)
  var srcPath = path.join(__dirname, './assets/fonts/' + font + '.ttf');
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

  fontmin.run(function (err, files, stream) {
    if (err) {
      // 异常捕捉
      console.error(err);
    }
    console.log('解析完毕， 保存到路由中，没有保存到本地')
    res.send(files[0].contents);
  });
})
//---------------------------------ttf-->woff2-------------------


app.get('/ttf-to-woff', (req, res) => {
  console.log(req.query.name)
  let fileName = req.query.name;
  if(fileName === undefined) {
    res.send({
      code: -1,
      msg: '系统中没有该文件名'
    })
  }
  // 同步读取文件
  var input = fs.readFileSync('./public/upload/' + fileName);
  fileName = fileName.split('.')[0];
  // ttf格式转换成woff2格式
  fs.writeFile('./public/woff/'+fileName+'.woff2', ttf2woff2(input), (err) => {
    console.log('weite  ing-------finish---------------')
    res.send({
      code: 200,
      msg: '转换成功',
      url:fileName+'.woff2'
    })
  });
})

//--------------------------------upload------------------------------------
app.use('/public', express.static(path.join(__dirname, './static')));

// 根据当前文件目录指定文件夹
const dir = path.resolve(__dirname, './public/upload');
// 图片大小限制KB
const SIZELIMIT = 5000000;//1923148

const storage = multer.diskStorage({
  // 指定文件路径
  destination: function (req, file, cb) {
    // ！！！相对路径时以node执行目录为基准，避免权限问题，该目录最好已存在*
    // cb(null, './uploads');

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

app.post('/upload', upload.single('file'), async (req, res) => {
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


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
  console.log(`localhost:${port}`)
})