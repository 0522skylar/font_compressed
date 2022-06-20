const fs = require('fs');
const path = require('path');

function removeFile(folder, filename) {
  files = fs.readdirSync(path.resolve(__dirname, '../public/' + folder));
  files.forEach((file) => {
      if(file != filename) {
          let curPath = path.resolve(__dirname, '../public/' + folder) + "/" + file;
          fs.unlinkSync(curPath); //删除文件
      }
  });
}
module.exports = removeFile