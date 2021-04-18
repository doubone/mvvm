const http = require('http');
const querystring = require('querystring')

const server =  http.createServer((req,res)=>{
    const ip = res.socket.remoteAddress;
    const port = res.socket.remotePort;
    res.end(`您的 IP 地址是 ${ip}，您的源端口是 ${port}`);
    if(req.url.startsWith('/login')){

    }
    if(req.method === 'POST'){
        let pdata = '';
        req.on('data',(chunk)=>{
            pdata = chunk
        });
        req.on('end',()=>{
            let obj = querystring.parse(pdata);
            if(obj.username == 'admin' && obj.password == '123'){
                res.end('success')
            }else{
                res.end('failure')
            }
        })
    }
});
server.listen(3000,()=>{
    console.log("running in 3000")
})