<!-- 聊天记录 -->
<template>
    <div class="imChat-wrapper">
        <!-- 头部 -->
        <header class="imChat-inner">
            <div class="float-left name">
                <span class="inner">{{chatEn.userName}}</span>
            </div>
            <div class="float-right opr" v-show="chatEn.state=='off'">
                <a href="javascript:void(0)" type="text" @click="close()">关闭会话</a>
            </div>
        </header>
        <common-chat></common-chat>
    </div>
</template>

<script>
import commonChat from '@/components/common/common_chat.vue';

export default {
    components: {
        commonChat: commonChat
    },
    data() {
        return {
            oprType: '', // 操作类型，eg：view(只读)
            chatEn: ''
        };
    },
    computed: {},
    watch: {},
    methods: {
        /**
         * 初始化
         * @param {Object} opts 可选对象
         * @param {String} opts.oprType 操作类型,默认add
         * @param {Object} opts.chatEn im会话对象
         */
        init: function(opts) {
            var self = this;
            this.$data.oprType = opts.oprType == undefined ? '' : opts.oprType;
            this.$data.chatEn = opts.chatEn;
            // 初始化状态
            document.getElementById('chat_log_input').innerHTML = '';
            self.$data.shortcutPopoverVisible = false;
            self.$refs.qqface.$data.faceHidden = true;
            self.$data.durationStr = '00小时00分00秒';
            clearInterval(this.$data.durationStr_setInterval);

            // 在线状态
            if (this.$data.chatEn.state == 'on') {
                // 1)显示在输入框的内容
                setTimeout(function() {
                    // 未断开获取焦点
                    document.getElementById('chat_log_input').focus();
                    self.setInputContentSelectRange();
                    // 设置之前保存的输入框内容
                    if (self.$data.chatEn.inputContent) {
                        self.setInputDiv(self.$data.chatEn.inputContent);
                    }
                }, 200);

                // 2)定时更新连接时长
                var seconds = Number.parseInt((Date.now() - self.$data.chatEn.accessTime) / 1000);
                self.$data.durationStr = self.$ak.Utils.getSFM(seconds, 'H小时i分s秒');
                this.$data.durationStr_setInterval = setInterval(function() {
                    // 获取相差的秒数
                    var seconds = Number.parseInt((Date.now() - self.$data.chatEn.accessTime) / 1000);
                    self.$data.durationStr = self.$ak.Utils.getSFM(seconds, 'H小时i分s秒');
                }, 1000 * 1);
            } else {
                document.getElementById('chat_log_input').blur();
            }

            // 2.清空语音消息的播放状态
            if (this.$data.chatEn.msgList) {
                for (var i = 0; i < this.$data.chatEn.msgList.length; i++) {
                    var msgTmp = this.$data.chatEn.msgList[i];
                    if (msgTmp.contentType == 'voice') {
                        msgTmp.playing = false;
                    }
                }
            }

            // 3.首次加载历史消息
            var imInfo_jobId = self.$data.chatEn.imInfo_jobId;
            if (this.$data.chatEn.firstMsgLoaded === false) {
                // 1)当从'imInfo(会话信息)组件'中加载此组件，agentId 参数不需要传递
                var queryParams = {
                    companyId: window.companyId,
                    jobId: imInfo_jobId
                };
                if (this.$data.oprType != 'view') {
                    queryParams.agentId = window.agentId;
                }
                var url = '/udesktop/im/history/info.do';
                // 2)新接入的会话从此接口获取聊天记录，e.g. 转接的会话
                if (this.$data.chatEn.isNewChat) {
                    url = '/udesktop/im/transfer/info.do';
                }

                this.$ak.Http.post({
                    url: url,
                    params: queryParams,
                    successCallback: function(res) {
                        var msgList = res.result.data;
                        for (var i = 0; i < msgList.length; i++) {
                            var msg = msgList[i];
                            self.$store.imStore.dispatch('addChatMsg', {
                                imInfo_jobId: imInfo_jobId,
                                historyMsg: msg,
                                isHistoryMsg: true
                            });
                        }
                    }
                });
                // 设置extendInfoLoaded为true
                this.$store.imStore.dispatch('extendChatEn', {
                    imInfo_jobId: this.$data.chatEn.imInfo_jobId,
                    extends: {
                        firstMsgLoaded: true
                    }
                });
            }

            // 4.滚动到底部
            this.$nextTick(function() {
                self.$refs.common_chat_main.scrollTop = self.$refs.common_chat_main.scrollHeight;
            });
        },

        /**
         * 结束会话
         */
        end: function() {
            var self = this;
            // 清除输入内容
            document.getElementById('chat_log_input').innerHTML = '';
            // 发送关闭请求
            this.$store.imStore.dispatch('im_end', {
                imInfo_jobId: this.$data.chatEn.imInfo_jobId,
                successCallback: function() {
                    // 客户端结束会话、会话转接、发送满意度、异常断开都只是‘结束会话’，只有当座席端自己点击【结束会话】，才会直接触发【关闭会话】的功能，其他都是需要再一次点击【关闭会话】。
                    self.close();
                }
            });
        },

        /**
         * 关闭会话
         */
        close: function() {
            // 清除输入内容
            document.getElementById('chat_log_input').innerHTML = '';
            // 发送关闭请求
            this.$store.imStore.dispatch('im_close', {
                imInfo_jobId: this.$data.chatEn.imInfo_jobId
            });
        },

        /**
         * 快捷回复：选中
         * @param {String} value 选中快捷回复的内容
         */
        selectShortcutItem: function(value) {
            document.getElementById('chat_log_input').innerHTML = '';
            this.setInputDiv(value);
            this.$data.shortcutPopoverVisible = false;
        },

        /**
         * 获取来源平台的图标
         */
        getIconFromWay: function(value) {
            var className = this.$ak.BLL.getIconFromWay(value);
            return className;
        },

        /**
         * 设置输入内容
         * 根据input输入框innerHTML转换为纯文本
         */
        setInputContentByDiv: function() {
            var self = this;
            // 去除非表情的html标签
            var htmlStr = document.getElementById('chat_log_input').innerHTML;

            // 1.有内容时触发快捷回复搜索
            if (htmlStr.length > 0) {
                self.searchShortcutReply(htmlStr);
            } else {
                self.$data.shortcutPopoverVisible = false;
            }

            // 2.转换表情为纯文本：<img textanme="[笑]"/> => [笑]
            var tmpInputContent = htmlStr.replace(/<img.+?text=\"(.+?)\".+?>/g, '[$1]').replace(/<.+?>/g, '');

            // 3.设置最长长度
            if (tmpInputContent.length > 500) {
                document.getElementById('chat_log_input').innerHTML = '';
                var value = tmpInputContent.substr(0, 499).replace(/\[(.+?)\]/g, function(item, value) {
                    return self.$refs.qqface.getImgByFaceName(value);
                });
                this.setInputDiv(value);
            }

            // 4.修改store
            this.$data.chatEn.inputContent = tmpInputContent;
            this.$store.imStore.dispatch('extendChatEn', {
                imInfo_jobId: this.$data.chatEn.imInfo_jobId,
                extends: {
                    inputContent: tmpInputContent
                }
            });

            // 5.是否显示tips
            if (tmpInputContent.length > 0) {
                this.$data.tipsVisible = false;
            } else {
                this.$data.tipsVisible = true;
            }
        }
    },
    mounted() {}
};
</script>
<style lang="less">
.imChat-wrapper {
    .imChat-inner {
        width: 100%;
        height: 100%;
        position: relative;
        font-size: 12px;
        float: left;
        border: 0px;
        .imChat-header {
            width: 100%;
            height: 12px;
            border-bottom: 1px solid #e6e6e6;
            font-size: 12px !important;
            padding: 12px 0px;
            color: #3e3e3e;
            .name {
                width: 35%;
                .inner {
                    margin-left: 13px;
                }
            }
            .online-time {
                width: 30%;
                text-align: center;
            }
            .opr {
                width: 35%;
                color: #0b24fb;
                text-align: right;
                .el-button {
                    font-size: 12px;
                    padding: 0px;
                    margin-right: 14px;
                }
                .el-button:last-child {
                    margin-right: 15px;
                }
            }
        }
    }
}
</style>

