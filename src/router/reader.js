const express = require('express')
const router = express.Router()
const fileUtil = require('../helper/fileUtil')
const constant = require('../config/constant')
const ResultBody = require('../helper/httpResult')

// 获取文件资源树
router.get('/getTree', function (req, res) {
    fileUtil.getMarkdownFiles(constant.BASE_URL, constant.BASE_URL).then(data => {
        res.json(ResultBody.success(data))
    }).catch(err => {
        res.json(ResultBody.error(err))
    })
})

// 根据路径获取具体的md文件内容信息等
router.get('/getContent', function (req, res) {
    const { path } = req.body
    fileUtil.getMarkdownFileByPath(`${constant.BASE_URL}${path}`).then(data => {
        res.json(ResultBody.success(data))
    }).catch(err => {
        res.json(ResultBody.error(err))
    })
})

module.exports = router

