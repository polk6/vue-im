<!-- im客户端 入口 -->
<template>
    <div class="imClientIndex-wrapper">
        <div class="imClientIndex-inner">
            <header class="imClientIndex-header">
                <div class="name-wrapper position-v-mid">
                    <span v-if="chatInfoEn.chatState == 'robot'">您与机器人{{robotEn.robotName}}的对话</span>
                    <span v-else-if="chatInfoEn.chatState == 'agent'">您与客服{{serverChatEn.serverChatName}}的对话</span>
                </div>
                <div class="position-h-v-mid">
                    <img class="logo" src="image/lynkco_logo.png" />
                </div>
                <div class="close-wrapper position-v-mid">
                    <i class="el-icon-close" @click="closeChat()"></i>
                </div>
            </header>
            <main class="imClientIndex-main">
                <common-chat ref="common_chat" :chatInfoEn="chatInfoEn" :oprRoleName="'client'" @sendMsg="sendMsg"></common-chat>
            </main>
        </div>
        <!-- 转人工dialog -->
        <el-dialog title="请选择咨询内容" class="im-queueDialog" :visible.sync="im_queueDialogVisible" :close-on-click-modal="false" :close-on-press-escape="false">
            <div class="main">
                <el-radio-group v-model="im_queueDialog_selectedItem" class="item-group" @change="queueDialog_changeItem">
                    <div class="item" v-for="(item, index) in im_queueDialog_kfList">
                        <el-radio-button :label="item.queueId">{{item.queueName}}</el-radio-button>
                    </div>
                </el-radio-group>
            </div>
            <div class="footer">
                <el-button type="primary" :disabled="im_queueDialog_selectedItem.length==0" @click="queueDialog_submit">开始咨询</el-button>
            </div>
        </el-dialog>
        <!-- 满意度dialog-->
        <el-dialog class="im-mydDialog" :visible.sync="im_mydDialogVisible" :close-on-click-modal="false" :close-on-press-escape="false">
            <div v-show="!im_mydDialogSubmitOk" class="main">
                <p class="title">
                    感谢你的咨询，请对我们的服务进行评价
                </p>
                <el-row class="rate-wrapper">
                    <div class="rate-item" :class="{active:im_mydDialog_form.selectedItem=='5'}" @click="mydDialog_setMyd(5)">
                        <img src="image/rota-5.png" />
                        <p>非常满意</p>
                    </div>
                    <div class="rate-item" :class="{active:im_mydDialog_form.selectedItem=='4'}" @click="mydDialog_setMyd(4)">
                        <img src="image/rota-4.png">
                        <p>满意</p>
                    </div>
                    <div class="rate-item" :class="{active:im_mydDialog_form.selectedItem=='3'}" @click="mydDialog_setMyd(3)">
                        <img src="image/rota-3.png">
                        <p>一般</p>
                    </div>
                    <div class="rate-item" :class="{active:im_mydDialog_form.selectedItem=='2'}" @click="mydDialog_setMyd(2)">
                        <img src="image/rota-2.png">
                        <p>不满意</p>
                    </div>
                    <div class="rate-item" :class="{active:im_mydDialog_form.selectedItem=='1'}" @click="mydDialog_setMyd(1)">
                        <img src="image/rota-1.png">
                        <p>非常不满意</p>
                    </div>
                </el-row>
                <el-row>
                    <el-input type="textarea" :maxlength="50" :rows="4" resize="none" placeholder="备注(选填，50字符以内)" v-model="im_mydDialog_form.remark"></el-input>
                </el-row>
                <el-button type="primary" class="submit-btn position-h-mid" @click="mydDialog_submit" :disabled="im_mydDialog_form.selectedItem==''">确定</el-button>
            </div>
            <div v-show="im_mydDialogSubmitOk" class="submit-main">
                <i class="iconfont icon-tijiaochenggong"></i>
                <p class="title">评价提交成功</p>
                <p class="sub-title">
                    <el-button type="text" @click="mydDialog_createNewChat">发起新的会话</el-button>
                </p>
            </div>
        </el-dialog>
        <!-- 离线留言 -->
        <el-dialog class="im-leaveDialog" :visible.sync="im_leaveMsgVisible" :close-on-click-modal="false" :close-on-press-escape="false">
           
        </el-dialog>
        <!-- 结束会话-->
        <el-dialog class="im-logoutDialog" :visible.sync="im_logoutVisible" :close-on-click-modal="false" :close-on-press-escape="false">
            <p class="title">结束本次会话？</p>
            <div class="footer">
                <el-button type="primary" @click="logoutDialog_cancel">取消</el-button>
                <el-button type="primary" @click="logoutDialog_submit">结束会话</el-button>
            </div>
        </el-dialog>
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
                avatarUrl: 'image/im_client_avatar.png'
            }, // 当前账号的信息
            serverChatEn: {
                serverChatName: '',
                avatarUrl: ''
            }, // 服务端chat信息
            robotEn: {
                robotName: '小旺',
                avatarUrl: 'image/im_server_avatar.png'
            }, // 机器人信息
            faqList: [
                { title: '如何更改于网上订购的机票？', content: '请联系对应的航空公司' },
                {
                    title: '如何预订“加长空间座位”？',
                    content: '成功更改订票上的出发日期或时间后，网上系统会于一小时内签发电子机票并把电子票务收据发送到您在网上订票时所提供的电邮地址。'
                },
                { title: '我可享有多少寄舱行李限额？', content: '请联系对应的航空公司' },
                { title: '我可携带多少手提行李？', content: '请联系对应的航空公司' },
                { title: '要怎样才能申请退票？', content: '请联系对应的航空公司' }
            ],
            faqSelected: '-1',
            inputContent_setTimeout: null, // 输入文字时在输入结束才修改具体内容
            selectionRange: null, // 输入框选中的区域
            shortcutMsgList: [], // 聊天区域的快捷回复列表
            imgViewDialogVisible: false, // 图片查看dialog的显示
            imgViewDialog_imgSrc: '', // 图片查看dialog的图片地址
            im_queueDialogVisible: false, // 转人工队列dialog
            im_queueDialog_kfList: [], // 转人工队列集合
            im_queueDialog_selectedItem: '', // 选中的item对象
            im_mydDialogSubmitOk: false, // 满意度已提交
            im_mydDialogVisible: false, // 满意度dialog
            im_mydDialog_form: {
                selectedItem: '', // 选中的item
                remark: ''
            },
            im_leaveMsgVisible: false, // 离线留言
            im_leaveMsgResultVisible: false, // 离线留言已提交
            im_leaveMsgDialog_form: {
                email: '',
                phone: '',
                content: ''
            },
            im_leaveMsgDialog_rules: {
                email: [
                    {
                        validator: function(rule, value, callback) {
                            if (!/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(value)) {
                                callback(new Error('请输入正确的邮箱'));
                            } else {
                                callback();
                            }
                        },
                        trigger: 'change'
                    }
                ],
                phone: [
                    {
                        validator: function(rule, value, callback) {
                            if (!/^((\d{3,4})|\d{3,4}-)?\d{7,8}$|^1[3-8]\d{9}$|^\d{5}$/.test(value)) {
                                callback(new Error('请输入正确的电话号码'));
                            } else {
                                callback();
                            }
                        },
                        trigger: 'change'
                    }
                ],
                content: [
                    {
                        max: 100,
                        message: '请输入2-100个字符',
                        trigger: 'change'
                    },
                    {
                        min: 2,
                        message: '请输入2-100个字符',
                        trigger: 'change'
                    }
                ]
            },
            im_logoutVisible: false // 结束会话显示
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
                    self.addChatMsg(data.msg, () => {
                        self.$refs.common_chat.goEnd();
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
            this.$data.socket.emit('clientSendMsg', {
                serverChatId: self.$data.serverChatEn.serverChatId,
                clientChatId: self.$data.clientChatEn.clientChatId,
                msg: msg
            });
            // 2.添加到消息集合李
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

.imClientIndex-inner {
    margin: 10px;
    width: 500px;
    height: 550px;
    border: 1px solid #cccccc;
    overflow: hidden;
    .imClientIndex-header {
        height: 35px;
        box-sizing: border-box;
        background: #000000;
    }
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
