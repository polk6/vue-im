<!-- im客户端 入口 -->
<template>
    <div class="imClientIndex-wrapper">
        <header class="imClientIndex-header">

        </header>
        <main class="imClientIndex-main">
            <common-chat ref="common_chat" :chatEn="clientChatEn" @sendMsg="sendMsg"></common-chat>
        </main>
    </div>
</template>

<script >
import commonChat from '@/components/common/common_chat.vue';

export default {
    components: {
        commonChat: commonChat
    },
    data() {
        return {
            socket: null,
            clientChatEn: {
                clientChatId: '',
                clientChatName: '',
                inputContent: '',
                msgList: [],
                state: 'on',
                lastMsgTime: new Date(),
                lastMsgContent: '你好，我想咨询',
                newMsgCount: 2,
                lastMsgShowTime: null // 最后一个消息的显示时间
            }, // 当前账号的信息
            serverChatEn: {} // 服务端chat信息
        };
    },
    computed: {},
    watch: {},
    methods: {
        /**
         * 注册账号信息
         */
        regclientChatEn: function() {
            this.$data.clientChatEn.clientChatId = Number.parseInt(Date.now() + Math.random());
            // 名称格式：姓+6位数字
            var userName = '';
            switch (this.$data.clientChatEn.clientChatId % 5) {
                case 0:
                    userName = '张';
                    break;
                case 1:
                    userName = '李';
                    break;
                case 2:
                    userName = '王';
                    break;
                case 3:
                    userName = '赵';
                    break;
                case 4:
                    userName = '孙';
                    break;
            }
            var tmpId = this.$data.clientChatEn.clientChatId.toString();
            userName += tmpId.substr(tmpId.length - 6, 6);
            this.$data.clientChatEn.clientChatName = userName;
        },

        /**
         * 注册socket
         */
        regSocket: function() {
            var self = this;
            self.$data.socket = require('engine.io-client')('http://localhost:3001');
            self.$data.socket.on('open', function() {
                // 上线
                self.$data.socket.send(
                    JSON.stringify({
                        type: 'clientOn',
                        data: {
                            clientChatId: self.$data.clientChatEn.clientChatId,
                            clientChatName: self.$data.clientChatEn.clientChatName
                        }
                    })
                );

                // 【接收消息】
                self.$data.socket.on('message', function(message) {
                    message = JSON.parse(message);
                    if (message.type == 'serverConnected') {
                        // 1.服务端连接成功
                        // 1)获取客服消息
                        self.$data.serverChatEn.serverChatId = message.data.serverChatId;
                        self.$data.serverChatEn.serverChatName = message.data.serverChatName;
                        // 2)添加消息
                        self.addChatMsg({
                            role: 'sys',
                            contentType: 'text',
                            content: '客服 ' + message.data.serverChatName + ' 为你服务'
                        });
                    } else if (message.type == 'serverSendMsg') {
                        // 2.服务端发送了消息
                        var msg = message.data.msg;
                        self.addChatMsg(message.data.msg, () => {
                            self.$refs.common_chat.goEnd();
                        });
                    }
                });
            });
        },

        /**
         * 添加chat对象的msg
         * @param {Object} msg 消息对象；eg：{role:'sys',content:'含有新的消息'}
         * @param {String} msg.role 消息所有者身份；eg：'sys'系统消息；
         * @param {String} msg.contentType 消息类型；text:文本(默认)；image:图片
         * @param {String} msg.content 消息内容
         * @param {Function} successCallback 添加消息后的回调
         */
        addChatMsg: function(msg, successCallback) {
            // 1.设定默认值
            msg.createTime = msg.createTime == undefined ? new Date() : msg.createTime;

            var msgList = this.$data.clientChatEn.msgList ? this.$data.clientChatEn.msgList : [];

            // 2.插入消息
            // 1)插入日期
            // 实际场景中，在消息上方是否显示时间是由后台传递给前台的消息中附加上的，可参考 微信Web版
            // 此处进行手动设置，5分钟之内的消息，只显示一次消息
            msg.createTime = new Date(msg.createTime);
            if (
                this.$data.clientChatEn.lastMsgShowTime == null ||
                msg.createTime.getTime() - this.$data.clientChatEn.lastMsgShowTime.getTime() > 1000 * 60 * 5
            ) {
                msgList.push({
                    role: 'sys',
                    contentType: 'text',
                    content: this.$ak.Utils.getDateTimeStr(msg.createTime, 'H:i')
                });
                this.$data.clientChatEn.lastMsgShowTime = msg.createTime;
            }

            // 2)插入消息
            msgList.push(msg);

            // 3.设置chat对象相关属性
            this.$data.clientChatEn.msgList = msgList;

            // 4.回调
            successCallback && successCallback();
        },

        /**
         * 发送消息
         * @param {Object} rs 回调对象
         */
        sendMsg: function(rs) {
            var self = this;
            var msg = rs.msg;
            msg.role = 'client';
            // 1.socket发送消息
            this.$data.socket.send(
                JSON.stringify({
                    type: 'clientSendMsg',
                    data: {
                        serverChatId: self.$data.serverChatEn.serverChatId,
                        clientChatId: self.$data.clientChatEn.clientChatId,
                        msg: msg
                    }
                })
            );

            this.addChatMsg(msg, () => {
                this.$refs.common_chat.goEnd();
            });
        }
    },
    mounted() {
        this.regclientChatEn();
        this.regSocket();
    }
};
</script>

<style lang="less">
@import '../../common/css/base.less';

.imClientIndex-wrapper {
    #common-wrapper();
}

.imClientIndex-wrapper {
    margin: 10px;
    width: 500px;
    height: 550px;
    border: 1px solid #cccccc;
    overflow: hidden;
    .imClientIndex-main {
        height: 100%;
        max-width: 100%;
        position: relative;
        & > .item {
            float: left;
            border-right: 1px solid #e6e6e6;
            height: 100%;
        }
        & > .im-record {
            width: 280px;
        }
        & > .im-chat {
            width: calc(~'99% - 280px');
        }
    }
}
</style>
