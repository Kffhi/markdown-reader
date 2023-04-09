// 引入其他模块
const fs = require('fs')
const path = require('path')
const marked = require('marked')
const cheerio = require('cheerio')
const { v4: uuidv4 } = require('uuid')
const constant = require('../config/constant')

/**
 * 获取指定目录下的所有markdown文件，并以树形结构返回
 * @param basePath
 * @param filePath
 */
function getMarkdownFiles(basePath, filePath) {
    return new Promise((resolve, reject) => {
        const result = []
        fs.readdir(filePath, { withFileTypes: true }, (err, files) => {
            if (err) {
                reject(err)
                return
            }
            let remainingFiles = files.length
            if (!remainingFiles) {
                resolve(result)
                return
            }
            files.forEach((file) => {
                if (file.name.startsWith('.') || file.name === 'README.md') {
                    remainingFiles--
                    return
                }
                const fullPath = path.join(filePath, file.name)
                const relativePath = fullPath.replace(basePath, '')
                if (file.isFile() && path.extname(file.name) === '.md') {
                    // Add markdown file to result array
                    result.push({
                        path: relativePath,
                        name: file.name,
                        children: [],
                        content: null
                    })
                    remainingFiles--
                    if (!remainingFiles) {
                        resolve(result)
                    }
                } else if (file.isDirectory()) {
                    getMarkdownFiles(basePath, fullPath)
                        .then((children) => {
                            result.push({
                                path: relativePath,
                                name: file.name,
                                children,
                                content: null
                            })
                            remainingFiles--
                            if (!remainingFiles) {
                                resolve(result)
                            }
                        })
                        .catch((err) => {
                            reject(err)
                            return
                        })
                } else {
                    remainingFiles--
                    if (!remainingFiles) {
                        resolve(result)
                    }
                }
            })
        })
    })
}

/**
 * 根据数据解析出标题组成的大纲
 * @param data
 * @returns {*[]}
 */
function getOutline(data) {
    let result = []
    let stack = []
    let prevLevel = 0

    for (let i = 0; i < data.length; i++) {
        let item = data[i]

        while (stack.length && item.level <= stack[stack.length - 1].level) {
            stack.pop()
        }

        if (stack.length) {
            stack[stack.length - 1].children = stack[stack.length - 1].children || []
            stack[stack.length - 1].children.push(item)
        } else {
            result.push(item)
        }

        stack.push(item)
        prevLevel = item.level
    }

    return result
}

/**
 * 根据path获取markdown的具体内容
 * @param filePath
 * @returns {Promise<unknown>}
 */
function getMarkdownFileByPath(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                reject(err)
            } else {
                // 解析md
                const name = path.basename(filePath)
                const content = marked.parse(data)
                const $ = cheerio.load(content)

                // 处理标题
                const root = { level: 0, text: '', children: [] }
                $('h1, h2, h3, h4, h5, h6').each(function () {
                    const level = parseInt(this.name.slice(1))
                    const text = $(this).text().trim()
                    // 给一个id是为了后面做大纲的点击滚动定位
                    const id = uuidv4()
                    $(this).attr('id', id)
                    root.children.push({ level, text, id })
                })
                const outline = getOutline(root.children)

                // 处理图片路径
                $('img').each(function () {
                    const src = $(this).attr('src')
                    if (src && !src.startsWith('http') && !src.startsWith('data')) {
                        $(this).attr('src', `${constant.BASE_URL}/${src}`)
                    }
                })

                // 返回
                resolve({ name, content: $('body').html(), outline })
            }
        })
    })
}

module.exports = {
    getMarkdownFileByPath,
    getMarkdownFiles
}
