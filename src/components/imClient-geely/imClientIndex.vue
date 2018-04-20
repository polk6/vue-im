<!-- im客户端 入口 -->
<template>
    <div class="imClientIndex-wrapper">
        <header class="imClientIndex-header">
            <div class="name-wrapper position-v-mid">
                <span v-if="chatInfoEn.chatState == 'robot'">您与机器人{{robotEn.robotName}}的对话</span>
                <span v-else-if="chatInfoEn.chatState == 'agent'">您与客服{{serverChatEn.serverChatName}}的对话</span>
            </div>
            <div class="position-h-v-mid">
                {{projectEn.projectName}}
            </div>
            <div class="close-wrapper position-v-mid">
                <i class="el-icon-close" @click="closeChat()"></i>
            </div>
        </header>
        <main class="imServerIndex-main">
            <client-chat class="item client-chat" ref="client_chat" :chatInfoEn="chatInfoEn" :oprRoleName="'client'" @sendMsg="sendMsg"></client-chat>
            <client-notice class="item client-notice"></client-notice>
        </main>
    </div>
</template>

<script >
import clientChat from './imClientChat';
import clientNotice from './imClientNotice';

export default {
    components: {
        clientChat: clientChat,
        clientNotice: clientNotice
    },
    data() {
        return {
            socket: null,
            chatInfoEn: {
                chatState: 'robot', // chat状态；robot 机器人、agent 客服、agentOff 离线、agentTransiting 客服转接中
                connectionState: 'on', // 连接状态;on ：在线；off：离线
                lastMsgTime: null, // 上一次消息的创建时间
                playSound: true,
                inputContent: '',
                msgList: [],
                state: 'on',
                lastMsgShowTime: null // 最后一个消息的显示时间
            }, // 会话信息，包括聊天记录、状态
            clientChatEn: {
                clientChatId: '',
                clientChatName: '',
                avatarUrl: '/static/image/im_client_avatar.png'
            }, // 当前账号的信息
            serverChatEn: {
                serverChatName: '专员001',
                avatarUrl: '/static/image/im_server_avatar.png'
            }, // 服务端chat信息
            robotEn: {
                robotName: '小旺',
                avatarUrl: '/static/image/im_server_avatar.png'
            }, // 机器人信息
            projectEn: {
                projectName: '吉利在线客服'
            }, // 项目信息
        };
    },
    computed: {},
    watch: {},
    methods: {
        /**
         * 注册账号信息
         */
        regclientChatEn: function() {
            // 1.注册用户信息
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

            // 2.注册socket
            this.regSocket();
        },

        /**
         * 注册socket
         */
        regSocket: function() {
            var self = this;
            self.$data.socket = require('socket.io-client')('http://localhost:3001');
            self.$data.socket.on('connect', function() {
                // 上线
                self.$data.socket.emit('clientOn', {
                    clientChatId: self.$data.clientChatEn.clientChatId,
                    clientChatName: self.$data.clientChatEn.clientChatName
                });

                // 服务端链接成功
                self.$data.socket.on('serverConnected', function(data) {
                    // 1)获取客服消息
                    self.$data.serverChatEn.serverChatId = data.serverChatId;
                    self.$data.serverChatEn.serverChatName = data.serverChatName;

                    // 2)添加消息
                    self.addChatMsg({
                        role: 'sys',
                        contentType: 'text',
                        content: '客服 ' + data.serverChatName + ' 为你服务'
                    });
                });

                //  接受服务端信息
                self.$data.socket.on('serverSendMsg', function(data) {
                    if (self.$data.chatState == 'robot') {
                        data.msg.avatarUrl = self.$data.robotEn.avatarUrl;
                    } else if (self.$data.chatState == 'agent') {
                        data.msg.avatarUrl = self.$data.serverChatEn.avatarUrl;
                    }
                    self.addChatMsg(data.msg, () => {
                        self.$refs.client_chat.goEnd();
                    });
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

            var msgList = this.$data.chatInfoEn.msgList ? this.$data.chatInfoEn.msgList : [];

            // 2.插入消息
            // 1)插入日期
            // 实际场景中，在消息上方是否显示时间是由后台传递给前台的消息中附加上的，可参考 微信Web版
            // 此处进行手动设置，5分钟之内的消息，只显示一次消息
            msg.createTime = new Date(msg.createTime);
            if (
                this.$data.chatInfoEn.lastMsgShowTime == null ||
                msg.createTime.getTime() - this.$data.chatInfoEn.lastMsgShowTime.getTime() > 1000 * 60 * 5
            ) {
                msgList.push({
                    role: 'sys',
                    contentType: 'text',
                    content: this.$ak.Utils.getDateTimeStr(msg.createTime, 'Y-m-d H:i:s')
                });
                this.$data.chatInfoEn.lastMsgShowTime = msg.createTime;
            }

            // 2)插入消息
            msgList.push(msg);

            // 3.设置chat对象相关属性
            this.$data.chatInfoEn.msgList = msgList;

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
            msg.avatarUrl = this.$data.clientChatEn.avatarUrl;
            // 1.socket发送消息
            this.$data.socket.emit('clientSendMsg', {
                serverChatId: self.$data.serverChatEn.serverChatId,
                clientChatId: self.$data.clientChatEn.clientChatId,
                msg: msg
            });
            // 2.添加到消息集合李
            this.addChatMsg(msg, () => {
                this.$refs.client_chat.goEnd();
            });
        },

        /**
         * 关闭会话
         */
        closeChat: function() {
            console.log(1);
        }
    },
    mounted() {
        this.regclientChatEn();
    }
};
</script>

<style lang="less">
@import '../../common/css/base.less';

.imClientIndex-wrapper {
    #common-wrapper();
}

.imClientIndex-wrapper {
    width: 850px;
    height: 550px;
    margin: 10px;
    overflow: hidden;
    .imClientIndex-header {
        position: relative;
        height: 35px;
        box-sizing: border-box;
        background: #000000;
        font-size: 13px;
        color: #ffffff;
        .name-wrapper {
            margin-left: 20px;
        }
        .close-wrapper {
            right: 20px;
            font-size: 16px;
            cursor: pointer;
        }
    }
    .imServerIndex-main {
        max-width: 100%;
        height: 100%;
        position: relative;
        & > .item {
            float: left;
            height: 100%;
            border: 1px solid #e6e6e6;
            border-top-width: 0px;
            border-right-width: 0px;
            box-sizing: border-box;
            &:last-child {
                border-right-width: 1px;
            }
        }
        & > .client-chat {
            width: calc(~'100% - 250px');
        }
        & > .client-notice {
            width: 250px;
        }
    }
}
</style>
