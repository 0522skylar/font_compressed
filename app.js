const express = require('express')
// 处理路径
const path = require('path');
// 引入body-parse模块, 用来处理post请求参数
const bodyParser = require('body-parser');
const app = express()
const port = 3000
//开放静态资源文件
app.use(express.static(path.join(__dirname, 'public')));
// 告诉express框架模板所在的位置
app.set('views', path.join(__dirname, 'views'));
// 告诉express框架模板的默认后缀是什么
app.set('view engine', 'html');
//当渲染后缀名为art的模板时,所使用的模板引擎是什么
app.engine('html', require('express-art-template'));
app.use(bodyParser.json({
  limit: '10mb'
})); // for parsing application/json
app.use(bodyParser.urlencoded({
  limit: '10mb',
  extended: true
})); // for parsing application/x-www-form-urlencoded

// 引入路由模块
const home = require('./route/home');
const admin = require('./route/admin');

// 为路由匹配路径
app.use('/home', home);
app.use('/admin', admin);

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


app.get('/', (req, res) => {
  res.render('./index.html');
})


app.get('/active', function (req, res) {
  res.render('./activefont.html');
})

app.get('/list', function (req, res) {
  res.send({
    list: 'hello',
    code: 200
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
  console.log(`http://localhost:${port}/`)
})