const http = require('http');
const fs = require('fs')
const path = require('path');

let readFile = (paths, res) => {
    fs.readFile(path.join(__dirname, 'www', paths), 'utf8', (err, content) => {
        if (err) {
            // res.end('server error')
            res.writeHead(404, {
                'Content-Type': 'text/plain;charset=utf8'
            })
        } else {
            res.end(content)
        }
    })
}
let server = http.createServer((req, res) => {
    if (req.url.startsWith('/index')) {
        readFile('index.html', res)
    } else {
        // res.end('访问资源不存在')
        let data = "404 Not Found";
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.write(data)
        res.end()
    }

})

server.listen(3000)