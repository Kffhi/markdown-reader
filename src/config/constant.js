const fs = require('fs')
const path = require('path')

// BASE_URL从配置文件中读取，且，配置文件不上传
const configFilePath = path.join(path.resolve('./'), '/src/_config.json')
const config = JSON.parse(fs.readFileSync(configFilePath, 'utf8'))

const BASE_URL = config.BASE_URL

module.exports = {
    BASE_URL
}
