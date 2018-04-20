<!-- 聊天记录 -->
<template>
    <div class="imClientChat-wrapper">
        <div class="imClientChat-inner">
            <!-- 聊天记录 -->
            <div class="imClientChat-main" id="imClientChat_main" ref="imClientChat_main">
                <div class="imClientChat-main-content">
                    <div class="inner">
                        <div v-for="(item ,index) in chatInfoEn.msgList" :key="index">
                            <!-- 系统消息 -->
                            <div v-if="item.role=='sys'" class="item sys">
                                <!-- 1)文本类型 -->
                                <div v-if="item.contentType=='text'" class="text-content">
                                    <p>{{item.content}}</p>
                                </div>
                            </div>
                            <!-- 客户、客服 -->
                            <div v-else class="item" :class="{ sender: item.role == oprRoleName, receiver: item.role != oprRoleName }">
                                <div class="info-wrapper" :class="item.state">
                                    <!-- 头像 -->
                                    <div class="headericon-wrapper">
                                        <img class="kf-img" :src="item.avatarUrl">
                                    </div>
                                    <!-- 1)文本类型 -->
                                    <div v-if="item.contentType=='text'" class="item-content imClientChat_emoji-wrapper-global">
                                        <p class="text" v-html="getqqemojiEmoji(item.content)"></p>
                                    </div>
                                    <!-- 2)图片类型 -->
                                    <div v-else-if="item.contentType=='image'" class="item-content">
                                        <img class="img" :src="item.fileUrl" @click="imgViewDialog_show(item)" />
                                    </div>
                                    <!-- 3)文件类型 -->
                                    <div v-else-if="item.contentType=='file'" class="item-content">
                                        <div class="file">
                                            <i class="file-icon iconfont icon-file"></i>
                                            <div class="file-info">
                                                <p class="file-name">{{getFileName(item.fileName)}}</p>
                                                <div class="file-opr">
                                                    <div v-show="item.state=='success'">
                                                        <a class="file-download" :href="item.fileUrl" target='_blank' :download="item.fileUrl">下载</a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 底部区域 -->
            <div class="imClientChat-footer">
                <div>
                    <!-- 表情、文件选择等操作 -->
                    <div class="opr-wrapper">
                        <div v-show="chatInfoEn.chatState=='agent'" class="float-left icon-group">
                            <common-chat-emoji class="item" ref="qqemoji" @select="qqemoji_selectFace"></common-chat-emoji>
                            <a class="item" href="javascript:void(0)" @click="fileUpload_click('file')">
                                <i class="item iconfont icon-IMwenjian"></i>
                            </a>
                            <form method="post" enctype="multipart/form-data">
                                <input type="file" name="uploadFile" id="imClientChat_opr_fileUpload" style="display:none;position:absolute;left:0;top:0;width:0%;height:0%;opacity:0;">
                            </form>
                        </div>
                        <div class="text-r agent-group">
                            <el-button type="text" @click="queueDialog_show" v-show="chatInfoEn.chatState=='robot'">转人工</el-button>
                        </div>
                    </div>
                    <!-- 聊天输入框 -->
                    <div class="input-wrapper">
                        <div maxlength="500" class="inputContent imClientChat_emoji-wrapper-global" id="imClientChat_input" contenteditable="true" @paste.stop="inputContent_paste" @keydown="inputContent_keydown" @mouseup="inputContent_mouseup" @mouseleave="inputContent_mouseup"></div>
                    </div>
                    <!-- 发送按钮 -->
                    <el-button type="primary" size="small" class="send-btn" :class="chatInfoEn.state" @click="sendText()" :disabled="chatInfoEn.inputContent.length==0">发送</el-button>
                </div>
                <!-- 离线 -->
                <div v-show="chatInfoEn.state=='off' || chatInfoEn.state=='end'" class="off-wrapper">
                    <span class="content">会话已经结束</span>
                </div>
            </div>
        </div>
        <!-- 图片查看dialog -->
        <el-dialog title="" :visible.sync="imgViewDialogVisible" class="imgView-dialog" :modal="false">
            <div class="header">
                <i class="iconfont icon-IM-tupianguanbi" @click="imgViewDialog_close"></i>
            </div>
            <div class="main">
                <img class="img" :src="imgViewDialog_imgSrc" />
            </div>
        </el-dialog>
        <!-- 转人工dialog -->
        <el-dialog title="请选择咨询内容" class="im-queueDialog" :visible.sync="im_queueDialogVisible" :close-on-click-modal="false" :close-on-press-escape="false">
            <div class="main">
                <el-radio-group v-model="im_queueDialog_selectedItem" class="item-group" @change="im_queueDialog_changeItem">
                    <div class="item" v-for="(item, index) in im_queueDialog_kfList">
                        <el-radio-button :label="item.queueId">{{item.queueName}}</el-radio-button>
                    </div>
                </el-radio-group>
            </div>
            <div class="footer">
                <el-button type="primary" :disabled="im_queueDialog_selectedItem.length==0" @click="im_queueDialog_submit">开始咨询</el-button>
            </div>
        </el-dialog>
        <!-- 满意度dialog-->
        <el-dialog class="im-mydDialog" :visible.sync="im_mydDialogVisible" :close-on-click-modal="false" :close-on-press-escape="false">
            <div v-show="!im_mydDialogSubmitOk" class="main">
                <p class="title">
                    感谢你的咨询，请对我们的服务进行评价
                </p>
                <el-row>
                    <el-rate v-model="im_mydDialog_form.selectedItem" show-text :texts="['非常不满意', '不满意', '一般', '满意', '非常满意']">
                    </el-rate>
                </el-row>
                <el-row>
                    <el-input type="textarea" :maxlength="50" :rows="4" resize="none" placeholder="备注(选填，50字符以内)" v-model="im_mydDialog_form.remark"></el-input>
                </el-row>
                <el-button type="primary" class="submit-btn" @click="im_mydDialog_submit" :disabled="im_mydDialog_form.selectedItem.length==0">确定</el-button>
            </div>
            <div v-show="im_mydDialogSubmitOk" class="submit-main">
                <i class="iconfont icon-tijiaochenggong"></i>
                <p class="title">评价提交成功</p>
                <p class="sub-title">
                    <el-button type="text" @click="im_mydDialog_createNewChat">发起新的会话</el-button>
                </p>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import imClientChat_emoji from './imClientChat_emoji.vue';

export default {
    components: {
        commonChatEmoji: imClientChat_emoji
    },
    props: {
        chatInfoEn: {
            required: true,
            type: Object,
            default: {
                inputContent: '',
                msgList: []
            }
        },
        oprRoleName: {
            required: true,
            type: String,
            default: ''
        } // 操作者名称；e.g. server:服务端、client:客服端
    },
    data() {
        return {
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
            }
        };
    },
    computed: {},
    watch: {},
    methods: {
        /**
         * 发送文本
         */
        sendText: function() {
            var self = this;
            if (self.chatInfoEn.inputContent.length == '') {
                return;
            }
            var msgContent = self.chatInfoEn.inputContent;
            document.getElementById('imClientChat_input').innerHTML = '';
            self.setInputContentByDiv();

            this.sendMsg({
                contentType: 'text',
                content: msgContent
            });
        },

        /**
         * 设置输入内容
         * 根据input输入框innerHTML转换为纯文本
         */
        setInputContentByDiv: function() {
            var self = this;
            // 去除非表情的html标签
            var htmlStr = document.getElementById('imClientChat_input').innerHTML;

            // 1.转换表情为纯文本：<img textanme="[笑]"/> => [笑]
            var tmpInputContent = htmlStr.replace(/<img.+?text=\"(.+?)\".+?>/g, '[$1]').replace(/<.+?>/g, '');

            // 2.设置最长长度
            if (tmpInputContent.length > 500) {
                document.getElementById('imClientChat_input').innerHTML = '';
                var value = tmpInputContent.substr(0, 499).replace(/\[(.+?)\]/g, function(item, value) {
                    return self.$refs.qqemoji.getImgByFaceName(value);
                });
                this.setInputDiv(value);
            }

            // 3.修改store
            this.chatInfoEn.inputContent = tmpInputContent;
        },

        /**
         * 设置input输入框内容
         * @param {String} vlaue 设置的值
         */
        setInputDiv: function(value) {
            if (this.$data.selectionRange == null) {
                document.getElementById('imClientChat_input').focus();
                return;
            }
            // 1.设置selectionRange
            if (window.getSelection) {
                window.getSelection().removeAllRanges();
                window.getSelection().addRange(this.$data.selectionRange);
            } else {
                this.$data.selectionRange && this.$data.selectionRange.select();
            }

            // 2.表情转换为img
            value = this.getqqemojiEmoji(value);

            // 3.填充内容
            var sel, range;
            if (window.getSelection) {
                // IE9 and non-IE
                sel = window.getSelection();
                if (sel.getRangeAt && sel.rangeCount) {
                    range = sel.getRangeAt(0);
                    range.deleteContents();

                    var elemnet;
                    if (range.createContextualFragment) elemnet = range.createContextualFragment(value);
                    else {
                        var o = document.createElement('div');
                        o.innerHTML = value;
                        elemnet = document.createDocumentFragment();
                        for (var r, c; (r = o.firstChild); ) c = elemnet.appendChild(r);
                    }
                    var lastNode = elemnet.lastChild;
                    range.insertNode(elemnet);
                    range.setStartAfter(lastNode);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            } else if (document.selection && document.selection.type != 'Control') {
                // IE < 9
                document.selection.createRange().pasteHTML(imgStr);
            }

            // 4.修改inputContent
            this.setInputContentByDiv();
        },

        /**
         * 转换为QQ表情
         */
        getqqemojiEmoji: function(value) {
            if (value == undefined) {
                return;
            }
            var self = this;
            return value.replace(/\[(.+?)\]/g, function(item, value) {
                return self.$refs.qqemoji.getImgByFaceName(value);
            });
        },

        /**
         * 设置input输入框的选择焦点
         */
        setInputContentSelectRange: function() {
            if (window.getSelection && window.getSelection().rangeCount > 0) {
                var selectRange = window.getSelection().getRangeAt(0);
                if (
                    selectRange.commonAncestorContainer.nodeName == '#text' &&
                    selectRange.commonAncestorContainer.parentElement &&
                    selectRange.commonAncestorContainer.parentElement.id == 'imClientChat_input'
                ) {
                    // 选中了输入框内的文本
                    this.$data.selectionRange = selectRange;
                } else if (selectRange.commonAncestorContainer.id == 'imClientChat_input') {
                    // 选中了输入框
                    this.$data.selectionRange = selectRange;
                }
            }
        },

        /**
         * 输入框的mouseup
         */
        inputContent_mouseup: function(e) {
            this.setInputContentSelectRange();
        },

        /**
         * 输入框的keydown
         */
        inputContent_keydown: function(e) {
            // 1.快捷键判断
            if (e.keyCode == 13) {
                // 回车直接发送
                this.sendText();
                e.returnValue = false;
                return;
            }

            this.setInputContentSelectRange();
            var self = this;
            // keyup触发时，绑定的数据还没有被变更，需要进行延后访问
            clearTimeout(this.$data.inputContent_setTimeout);
            this.$data.inputContent_setTimeout = setTimeout(function() {
                self.setInputContentByDiv();
            }, 200);
        },

        /**
         * 输入框的粘贴
         */
        inputContent_paste: function(e) {
            var self = this;
            var isImage = false;
            if (e.clipboardData && e.clipboardData.items.length > 0) {
                // 1.上传图片
                for (var i = 0; i < e.clipboardData.items.length; i++) {
                    var item = e.clipboardData.items[i];
                    if (item.kind == 'file' && item.type.indexOf('image') >= 0) {
                        // 粘贴板为图片类型
                        var file = item.getAsFile();
                        let formData = new FormData();
                        formData.append('uploadFile', file);
                        this.$http.uploadFile({
                            url: '/upload',
                            params: formData,
                            successCallback: rs => {
                                console.log(file);
                                console.log(rs);
                                document.getElementById('imClientChat_opr_fileUpload').value = '';
                                this.sendMsg({
                                    contentType: 'image',
                                    fileName: rs.fileName,
                                    fileUrl: rs.fileUrl,
                                    state: 'success'
                                });
                            }
                        });
                        isImage = true;
                    }
                }

                // 2.非图片，粘贴纯文本
                if (!isImage) {
                    e.stopPropagation();
                    e.preventDefault();
                    var str = e.clipboardData.getData('text/plain');
                    // 转化为纯文字
                    var span = document.createElement('span');
                    span.innerHTML = str;
                    var txt = span.innerText;
                    this.setInputDiv(
                        txt
                            .replace(/\n/g, '')
                            .replace(/\r/g, '')
                            .replace(/</g, '&lt;')
                            .replace(/>/g, '&gt;')
                    );
                }
            }
        },

        /**
         * 文件上传_点击
         */
        fileUpload_click: function(fileType) {
            document.getElementById('imClientChat_opr_fileUpload').onchange = this.fileUpload_change;
            document.getElementById('imClientChat_opr_fileUpload').click();
        },

        /**
         * 文件上传_选中文件
         */
        fileUpload_change: function(e) {
            var fileNameIndex = document.getElementById('imClientChat_opr_fileUpload').value.lastIndexOf('\\') + 1;
            var fileName = document.getElementById('imClientChat_opr_fileUpload').value.substr(fileNameIndex);
            var extend = fileName.substring(fileName.lastIndexOf('.') + 1);
            // 1.判断有效
            // 1)大小
            if (document.getElementById('imClientChat_opr_fileUpload').files[0].size >= 1000 * 1000 * 10) {
                this.$ak.Msg.toast('文件大小不能超过10M', 'error');
                document.getElementById('imClientChat_opr_fileUpload').value = '';
                return false;
            }

            // 2.文件上传
            let formData = new FormData();
            formData.append('uploadFile', document.getElementById('imClientChat_opr_fileUpload').files[0]);
            this.$http.uploadFile({
                url: '/upload',
                params: formData,
                successCallback: rs => {
                    console.log(rs);
                    document.getElementById('imClientChat_opr_fileUpload').value = '';
                    this.sendMsg({
                        contentType: ['png', 'jpg', 'jpeg', 'gif', 'bmp'].indexOf(extend) >= 0 ? 'image' : 'file',
                        fileName: fileName,
                        fileUrl: rs.fileUrl,
                        state: 'success'
                    });
                }
            });
        },

        /**
         * qqemoji选中表情
         */
        qqemoji_selectFace: function(rs) {
            var imgStr = rs.imgStr;
            this.setInputDiv(imgStr);
        },

        /**
         * 转换文件名，若文件名称超过9个字符，将进行截取处理
         * @param {String} fileName 文件名称
         */
        getFileName: function(fileName) {
            if (!fileName) {
                return;
            }
            var name = fileName.substring(0, fileName.lastIndexOf('.'));
            var extend = fileName.substring(fileName.lastIndexOf('.') + 1);
            if (name.length > 9) {
                name = name.substring(0, 3) + '...' + name.substring(name.length - 3);
            }
            return name + '.' + extend;
        },

        /**
         * 图片查看dialog_显示
         */
        imgViewDialog_show: function(item) {
            this.$data.imgViewDialogVisible = true;
            this.$data.imgViewDialog_imgSrc = item.fileUrl;
        },

        /**
         * 图片查看dialog_显示
         */
        imgViewDialog_close: function() {
            this.$data.imgViewDialogVisible = false;
            var self = this;
            setTimeout(function() {
                self.$data.imgViewDialog_imgSrc = '';
            }, 100);
        },

        /**
         * 发送消息，e.g. 文本、图片、文件
         * @param {Object} msg 消息对象
         */
        sendMsg: function(msg) {
            var self = this;
            // 1.传递
            this.$emit('sendMsg', {
                msg: msg,
                successCallbcak: function() {
                    document.getElementById('imClientChat_input').focus();
                    self.goEnd();
                }
            });
        },

        /**
         * 显示队列Dialog
         * @param {Number} robotMode 1:工作时间内，所有会话由人工客服先接待。
         */
        queueDialog_show: function(robotMode) {
            this.$data.im_queueDialog_kfList = [{ queueId: '1', queueName: '咨询' }, { queueId: '2', queueName: '反馈' }];
            this.$data.im_queueDialogVisible = true;
            this.$data.im_queueDialog_selectedItem = [];
        },

        /**
         * 队列dialog_选中
         */
        im_queueDialog_changeItem: function(e) {},

        /**
         * 队列dialog_提交
         */
        im_queueDialog_submit: function() {
            this.$data.im_queueDialogVisible = false;
            // 转人工
            var kfId = this.$data.im_queueDialog_selectedItem.toString();
            if (kfId) {
                chatHelper.wcToAgent(kfId);
            }
        },

        /**
         * 显示满意度Dailog
         */
        showMydDialog: function() {
            if (this.$data.chatState == 'agent') {
                this.$data.im_mydDialogVisible = true;
                this.$data.im_mydDialogSubmitOk = false;
                this.$data.im_mydDialog_form.selectedItem = [];
                this.$data.im_mydDialog_form.remark = '';
            }
        },

        /**
         * 满意度dialog_提交
         */
        im_mydDialog_submit: function() {
            this.$data.im_mydDialogSubmitOk = true;
            var score = this.$data.im_mydDialog_form.selectedItem.toString();
            score = 6 - score; // 后台数据库 1表示非常满意
            // 满意度提交
            chatHelper.wcSendSatisfactionResult(this.$data.imInfo.jobId, score, this.$data.im_mydDialog_form.remark, function() {});
        },

        /**
         * 发起新的会话
         */
        im_mydDialog_createNewChat: function() {
            this.$data.im_mydDialogVisible = false;
            this.connection();
        },

        /**
         * 显示留言Dialog
         */
        showLeaveMsgDialog: function() {
            this.$data.chatState = 'agentOff';
            this.$data.im_leaveMsgDialog_form = {
                userName: '',
                phone: '',
                content: ''
            };
        },

        /**
         * 留言dialog_提交
         */
        im_leaveMsgDialog_submit: function() {
            var self = this;
            // 校验
            this.$refs['im_leaveMsgDialog_form'].validate(function(valid) {
                if (valid) {
                    self.http_post({
                        url: '/uticket/ticket/saveTicketForLeavMessage.do',
                        params: {
                            channel: 'ie',
                            name: self.$data.im_leaveMsgDialog_form.userName,
                            mobile: self.$data.im_leaveMsgDialog_form.phone,
                            content: self.$data.im_leaveMsgDialog_form.content
                        },
                        successCallback: function(res) {
                            self.$data.im_leaveMsgResultVisible = true;
                        }
                    });
                }
            });
        },

        /**
         * 聊天记录滚动到底部
         */
        goEnd: function() {
            this.$nextTick(() => {
                setTimeout(() => {
                    this.$refs.imClientChat_main.scrollTop = this.$refs.imClientChat_main.scrollHeight;
                }, 100);
            });
        }
    },
    mounted() {}
};
</script>
<style lang="less">
.imClientChat-wrapper {
    @keyframes progress-bar-stripes {
        from {
            background-position: 40px 0;
        }
        to {
            background-position: 0 0;
        }
    }
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
    font-size: 12px;
    float: left;
    border: 0px;
    .imClientChat-inner {
        width: 100%;
        height: 100%;
        .imClientChat-main {
            position: relative;
            height: calc(~'100% - 190px');
            overflow-y: auto;
            overflow-x: hidden;
            background: #1a1a1a;
            .imClientChat-main-header {
                text-align: center;
                padding-top: 14px;
                .el-button {
                    font-size: 12px;
                    color: #8d8d8d;
                    padding: 0px;
                }
            }
            .imClientChat-main-content {
                position: absolute;
                width: 100%;
                height: calc(~'100% - 30px');
                & > .inner {
                    padding-bottom: 20px;
                    .item {
                        clear: both;
                        overflow: hidden;
                    }
                    .sys {
                        text-align: center;
                        color: #00c7b2;
                        font-size: 12px;
                        .text-content {
                            padding-top: 20px;
                        }
                        .myd-content {
                            .desc {
                                margin-top: 18px;
                            }
                            .text {
                                color: #3e3e3e;
                                margin-top: 12px;
                            }
                            .remark {
                                margin-top: 10px;
                            }
                        }
                    }
                    .receiver,
                    .sender {
                        font-size: 12px;
                        margin-top: 18px;
                        .headericon-wrapper {
                            float: left;
                            margin: 10px 8px 0px;
                            border-radius: 50%;
                            background: #ffffff;
                            .kf-img {
                                width: 40px;
                                height: 40px;
                            }
                        }
                        .info-wrapper {
                            text-align: left;
                            font-size: 12px;
                            position: relative;
                            .item-content {
                                position: relative;
                                max-width: 330px;
                                margin-top: 10px;
                                color: #3e3e3e;
                                font-size: 13px;
                                line-height: 1.8;
                                border-radius: 6px;
                                .text {
                                    white-space: normal;
                                    word-wrap: break-word;
                                    word-break: break-all;
                                    padding: 10px 12px;
                                }
                                .qqemoji {
                                    width: 24px;
                                    height: 24px;
                                }
                                .img {
                                    max-width: 320px;
                                    max-height: 240px;
                                    white-space: normal;
                                    word-wrap: break-word;
                                    word-break: break-all;
                                    padding: 5px;
                                    cursor: pointer;
                                }
                                .file {
                                    padding: 10px 8px;
                                    overflow: hidden;
                                    margin: 3px;
                                    background: #fff;
                                    border-radius: 5px;
                                    width: 220px;
                                    .el-button {
                                        padding: 0px;
                                        font-size: 12px;
                                    }
                                    .file-info {
                                        padding: 0px 8px;
                                        float: left;
                                        .file-name {
                                            width: 160px;
                                            display: inline-block;
                                            color: #333333;
                                            white-space: nowrap;
                                            text-overflow: ellipsis;
                                            overflow: hidden;
                                            line-height: 1.3;
                                        }
                                    }
                                    .file-opr {
                                        margin-top: 8px;
                                    }
                                    .file-icon {
                                        font-size: 40px;
                                        float: left;
                                        color: #663399;
                                    }
                                    .file-download {
                                        color: #00a8d7;
                                        cursor: pointer;
                                        text-decoration: blink;
                                    }
                                }
                                .preInput {
                                    position: relative;
                                    color: #8d8d8d;
                                    img {
                                        height: 15px;
                                        position: relative;
                                        top: 3px;
                                    }
                                }
                            }
                        }
                    }
                    .item.receiver {
                        margin-left: 5px;
                        .headericon-wrapper {
                        }
                        .info-wrapper {
                            .item-content {
                                background-color: #00c7b2;
                                border: 1px solid #00c7b2;
                                color: #000000;
                                float: left;
                            }
                        }
                    }
                    .item.sender {
                        margin-right: 5px;
                        .headericon-wrapper {
                            float: right;
                        }
                        .info-wrapper {
                            float: right;
                            .item-content {
                                float: right;
                                background: #2b2c2d;
                                border: 1px solid #2b2c2d;
                                color: #ffffff;
                            }
                        }
                    }
                }
            }
        }
        .imClientChat-footer {
            position: relative;
            height: 190px;
            width: 100%;
            border-top: 1px solid #e6e6e6;
            .opr-wrapper {
                text-align: left;
                height: 20px;
                padding: 10px 0px 10px 16px;
                & > .icon-group > .item {
                    margin-right: 12px;
                    float: left;
                    font-weight: normal;
                    text-decoration: blink;
                    & > .iconfont {
                        color: #aaa;
                        font-size: 20px;
                    }
                }
            }
            .input-wrapper {
                padding: 2px 15px 0px;
                position: relative;
                .inputContent {
                    width: 99%;
                    padding: 2px;
                    height: 85px;
                    resize: none;
                    overflow: auto;
                    line-height: 1.5;
                    outline: 0px solid transparent;
                }
                .shortcutPopover-wrapper {
                    position: absolute;
                    top: 30px;
                    left: 10px;
                    width: 440px;
                    max-height: 80px;
                    overflow-y: auto;
                    border: 1px solid #9b9aab;
                    border-radius: 3px;
                    font-size: 12px;
                    background-color: #fff;
                    padding: 4px;
                    cursor: pointer;
                    p {
                        padding: 4px;
                        &.selected {
                            background-color: #ded1cc;
                        }
                        .key {
                            width: 50px;
                            display: inline-block;
                            white-space: nowrap;
                            text-overflow: ellipsis;
                            overflow: hidden;
                        }
                        .content {
                            margin-left: 10px;
                            width: 350px;
                            display: inline-block;
                            white-space: nowrap;
                            text-overflow: ellipsis;
                            overflow: hidden;
                        }
                        .highlight {
                            color: #00a8d7;
                        }
                    }
                }
                .tips {
                    position: absolute;
                    top: 7px;
                    left: 20px;
                    width: auto;
                    color: #8d8d8d;
                }
            }
            .send-btn {
                float: right;
                margin-right: 16px;
                &.off,
                &.end {
                    background-color: #ccc;
                    border-color: #ccc;
                }
            }
            .off-wrapper {
                position: absolute;
                top: 0px;
                left: 0px;
                width: 100%;
                height: 100%;
                background-color: rgba(255, 255, 255, 0.6);
                font-size: 14px;
                .content {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }
            }
        }
    }
}
.imgView-dialog {
    background: #00000080;
    height: 100%;
    .el-dialog {
        max-width: 75%;
        position: relative;
        background: transparent;
        box-shadow: none;
        .el-dialog__header {
            display: none;
        }
        .el-dialog__body {
            padding: 0px;
            text-align: center;
            position: relative;
            .header {
                text-align: right;
                position: relative;
                height: 0px;
                .icon-IM-tupianguanbi {
                    font-size: 42px;
                    color: white;
                    position: relative;
                    right: -50px;
                    top: -30px;
                    cursor: pointer;
                }
            }
            .main {
                .img {
                    max-width: 100%;
                    max-height: 100%;
                    height: 100%;
                }
            }
        }
    }
}
</style>

