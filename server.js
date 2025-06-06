const net = require('net');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// 创建HTTP服务器
app.use(bodyParser.json());

// REST API 路由
app.get('/api/data', (req, res) => {
    res.json({ message: 'Hello from Node.js Server!' });
});

app.post('/api/message', (req, res) => {
    console.log('收到POST请求:', req.body);
    res.json({ 
        status: 'success',
        message: '数据已接收',
        data: req.body 
    });
});

// 启动HTTP服务器
const httpServer = app.listen(3000, () => {
    console.log('HTTP服务器运行在端口 3000');
});

// 创建TCP服务器
const tcpServer = net.createServer((socket) => {
    console.log('客户端已连接');

    // 设置编码
    socket.setEncoding('utf8');

    // 处理数据
    socket.on('data', (data) => {
        console.log('收到数据:', data);
        
        try {
            // 尝试解析JSON
            const jsonData = JSON.parse(data);
            console.log('解析的JSON:', jsonData);
            
            // 发送响应
            socket.write(JSON.stringify({
                status: 'success',
                message: '数据已接收',
                data: jsonData
            }));
        } catch (e) {
            // 如果不是JSON，直接回显
            socket.write(`服务器收到: ${data}`);
        }
    });

    // 处理客户端断开连接
    socket.on('end', () => {
        console.log('客户端断开连接');
    });

    // 处理错误
    socket.on('error', (err) => {
        console.log('连接错误:', err);
    });
});

// 启动TCP服务器
tcpServer.listen(8080, () => {
    console.log('TCP服务器运行在端口 8080');
}); 