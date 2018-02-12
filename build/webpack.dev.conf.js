'use strict'
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const path = require('path')
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const portfinder = require('portfinder')

const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)

const devWebpackConfig = merge(baseWebpackConfig, {
    module: {
        rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap, usePostCSS: true })
    },
    // cheap-module-eval-source-map is faster for development
    devtool: config.dev.devtool,

    // these devServer options should be customized in /config/index.js
    devServer: {
        clientLogLevel: 'warning',
        historyApiFallback: {
            rewrites: [
                { from: /.*/, to: path.posix.join(config.dev.assetsPublicPath, 'index.html') },
            ],
        },
        hot: true,
        contentBase: false, // since we use CopyWebpackPlugin.
        compress: true,
        host: HOST || config.dev.host,
        port: PORT || config.dev.port,
        open: config.dev.autoOpenBrowser,
        overlay: config.dev.errorOverlay ? { warnings: false, errors: true } : false,
        publicPath: config.dev.assetsPublicPath,
        proxy: config.dev.proxyTable,
        quiet: true, // necessary for FriendlyErrorsPlugin
        watchOptions: {
            poll: config.dev.poll,
        }
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': require('../config/dev.env')
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
        new webpack.NoEmitOnErrorsPlugin(),
        // https://github.com/ampedandwired/html-webpack-plugin
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html',
            inject: true
        }),
        // copy custom static assets
        new CopyWebpackPlugin([{
            from: path.resolve(__dirname, '../static'),
            to: config.dev.assetsSubDirectory,
            ignore: ['.*']
        }])
    ]
})

module.exports = new Promise((resolve, reject) => {
    portfinder.basePort = process.env.PORT || config.dev.port
    portfinder.getPort((err, port) => {
        if (err) {
            reject(err)
        } else {
            // publish the new Port, necessary for e2e tests
            process.env.PORT = port
                // add port to devServer config
            devWebpackConfig.devServer.port = port

            // Add FriendlyErrorsPlugin
            devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
                compilationSuccessInfo: {
                    messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`],
                },
                onErrors: config.dev.notifyOnErrors ?
                    utils.createNotifierCallback() : undefined
            }))

            resolve(devWebpackConfig)
        }
    })
})

// express
const app = require('express')();
const fileUpload = require('express-fileupload');
app.use(fileUpload()); // for parsing multipart/form-data

// 上传文件
app.post('/upload', function(req, res) {
    if (!req.files) {
        return res.status(400).send('No files were uploaded.');
    }

    // save file
    // <input type="file" name="uploadFile" />
    let file = req.files.uploadFile;
    file.mv(path.resolve(__dirname, '../static/upload/') + '/' + file.name, function(err) {
        if (err) {
            return res.status(500).send({
                code: err.code,
                data: err,
                message: '文件上传失败'
            });
        }
        res.send({
            code: 0,
            data: {
                fileName: file.name,
                fileURL: `http://${devWebpackConfig.devServer.host}:3000/static/upload/${file.name}`
            },
            message: '文件上传成功'
        });
    });
});

// 获取文件
app.get('/static/upload/:fileName', function(req, res) {
    console.log(req.params.fileName);
    res.sendFile(path.resolve(__dirname, '../static/upload') + '/' + req.params.fileName);
});
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
    next();
});

// socket
var server = require('http').createServer(app);
var io = require('socket.io')(server, { origins: '*:*' });;

var serverSocketDic = {}; // 客服Socket字典
var clientSocketDic = {}; // 客户端Socket字典

// 开启scoket
io.on('connection', function(socket) {

    // 服务端新上线
    socket.on('serverOn', function(msg) {
        var rs = JSON.parse(msg);
        console.log('有新的服务端socket连接了，服务端Id：' + rs.serverId);
        serverSocketDic[rs.serverId] = socket;
    });

    // 服务端发送了信息
    socket.on('serverSendMsg', function(msg) {
        var rs = JSON.parse(msg);
        console.log('接受到服务端消息: ' + msg);
        // 服务端接收消息
        if (clientSocketDic[rs.serverId]) {
            clientSocketDic[rs.serverId].emit('receiveServerMsg', JSON.stringify(rs));
        }
    });

    // 客户端新上线
    socket.on('clientOn', function(msg) {
        var rs = JSON.parse(msg);
        console.log('有新的客户socket连接了，客户Id：' + rs.clientId);
        clientSocketDic[rs.clientId] = socket;
    });

    // 客户端发送了信息
    socket.on('clientSendMsg', function(msg) {
        var rs = JSON.parse(msg);
        console.log('接受到客户端消息: ' + rs.data);

        // 服务端接收消息
        if (serverSocketDic[rs.serverId]) {
            serverSocketDic[rs.serverId].emit('receiveClientMsg', JSON.stringify(rs));
        }

    });
});

app.listen(3000);
