const upyun = require('upyun')
const fs = require('fs')
const path = require('path')
const cdnConfig = require('../app.config').cdn
const excludeFiles = ['index.html', 'server.ejs', 'server-entry.js']

const {
  serviceName,
  operatorName,
  password,
  remoteUrl,
  remoteFileName,
} = cdnConfig

// 需要填写本地路径，云存储路径
const localFile = '../dist'



const service = new upyun.Service(serviceName, operatorName, password)
const client = new upyun.Client(service);


/**
 * 异步图片上传预处理
 */
function imageASyncProcess(file,localFile) {
  // params 参数详见云处理，云存储参数说明文档
  var params = { }
  return client.formPutFile(`${remoteFileName}${file}`, fs.createReadStream(localFile), params)
    .then(res => res.url)
    .catch(err => err)
}

// imageASyncProcess(remoteFile)

const files = fs.readdirSync(path.join(__dirname,localFile))
const uploads = files.map(file => {
  if (excludeFiles.indexOf(file) === -1) {
    return imageASyncProcess(file,path.join(__dirname, localFile, file))
  } else {
    return Promise.resolve(`${file} no need to load`)
  }

})
Promise.all(uploads).then(res => {
  console.log('upload success:', res)
}).catch(err => {
  console.log('upload fail:', err)
  process.exit(0)
})
