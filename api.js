const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const fs = require('fs');

app.use(bodyParser.json());
app.use(cors());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

const fileDisplay = (url) => {
    return new Promise((resolve, reject) => {
        fs.readdir(url, (err, files) => {
            if (files && files.length) {
                let newfiles = files.sort((a, b) => a.length - b.length)
                resolve(newfiles);
            } else {
                resolve([]);
            }
        })
    })
}

// 定义GET请求的路由
app.get('/api', (req, res) => {
    let assetPath = './assets/img'
    fileDisplay(`${assetPath}/${req.query.url}`).then(async (arr) => {
        let allFile = []
        if (arr && arr.length) {
            for (let index = 0; index < arr.length; index++) {
                const element = arr[index];
                let fileList = await fileDisplay(`${assetPath}/${req.query.url}/${element}`)
                if (fileList && fileList.length) {
                    let previewFile = `${assetPath}/${req.query.url}/${element}/${fileList.filter(fi => fi.includes('index')).join(',')}`
                    let detailFiles = fileList.map(ma => {
                        if (!ma.includes('index')) {
                            return `${assetPath}/${req.query.url}/${element}/${ma}`
                        }
                    })
                    allFile.push(
                        {
                            "id": index + 1,
                            previewFile,
                            detailFiles: detailFiles.filter(item => item)
                        }
                    )
                }
            }
        }
        res.send(allFile);
    })
});

// 启动服务器
app.listen(9000, () => {
    console.log('Server started on port 9000');
});
