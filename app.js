const express = require('express')
// 处理路径
const path = require('path');

// 引入body-parse模块, 用来处理post请求参数
const bodyPaser = require('body-parser');
const Fontmin = require('fontmin');

const data = require('./data/fan.json');
const fs = require('fs');
const ttf2woff2 = require('ttf2woff2');
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


app.use(bodyPaser.json({limit: '10mb'})); // for parsing application/json
app.use(bodyPaser.urlencoded({limit: '10mb', extended: true })); // for parsing application/x-www-form-urlencoded




// 错误处理中间件
app.use((err, req, res, next) => {
  // console.log();
  console.log(err);

  const result = JSON.parse(err);
  let params = [];
  for(let attr in result) {
      if(attr != 'path') {
          params.push(attr + '=' + result[attr]);
      }
  }
  res.redirect(`${result.path}?${params.join('&')}`);
})



app.all("*", function(req, res, next) {
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


app.get('/font-test', (req, res) => { // 根据传递过来的文字，打印输出包含该文字的字体包
    // 字体源文件
    let font = req.query.font;
    console.log(font)
    var srcPath = path.join(__dirname, './assets/fonts/'+ font + '.ttf'); 
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

    fontmin.run(function(err, files, stream) {
        if (err) {
            // 异常捕捉
            console.error(err);
        }
        console.log('解析完毕， 保存到路由中，没有保存到本地')
        res.send(files[0].contents);
    });
})
//---------------------------------ttf-->woff2-------------------


app.get('/ttf-to-woff', (res, req) => {
var input = fs.readFileSync('./public/fonts/font-test.ttf');

fs.writeFile('font.woff2', ttf2woff2(input), (err) => {
    console.log('weite  ing-------finish---------------')
});

})
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
  console.log(`localhost:${port}`)
})
