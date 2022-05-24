
const iconv = require("iconv-lite"); // 用iconv-lite去除乱码
var spawn = require("child_process").spawn;
var result = spawn("cmd.exe", ["font-spider .\test.html"]);
 
//输出正常情况下的控制台信息
result.stdout.on("data", function(data) {
    console.log(data);
});
 
//输出报错信息
result.stderr.on("data", function(data) {
    console.log("stderr: " + data);
});
 
//当程序执行完毕后的回调，那个code一般是0
result.on("exit", function(code) {
    console.log("child process exited with code " + code);
});