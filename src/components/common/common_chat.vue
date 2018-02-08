<!-- 聊天记录 -->
<template>
    <div class="common_chat-wrapper">
        <!-- 聊天记录 -->
        <div class="common_chat-inner">
            <div class="common_chat-main" id="common_chat_main" ref="common_chat_main">
                <div>
                    <div class="common_chat-main-content">
                        <div class="inner">
                            <div v-for="(item ,index) in chatEn.msgList" :key="index">
                                <!-- 系统消息 -->
                                <div v-if="item.role=='sys'" class="item sys">
                                    <!-- 1)文本类型 -->
                                    <div v-if="item.contentType=='text'" class="text-content">
                                        <p>{{item.content}}</p>
                                    </div>
                                    <div v-else-if="item.contentType=='myd'" class="myd-content">
                                        <p class="desc">用户对您的评价</p>
                                        <p class="text">{{item.content}}</p>
                                        <p class="remark" v-show="item.mydRemark.length>0">备注：{{item.mydRemark}}</p>
                                    </div>
                                </div>
                                <!-- 客户、客服 -->
                                <div v-else class="item" :class="item.role">
                                    <!-- 头像 -->
                                    <div class="headericon-wrapper">
                                        <i v-if="item.role=='client'" class="iconfont" :class="getIconFromWay(chatEn.sourceInfo_way)"></i>
                                        <div v-else-if="item.role=='server'">
                                            <span class="kf-name">{{item.name}}</span>
                                            <img class="kf-img" src="">
                                        </div>
                                    </div>
                                    <div class="info-wrapper" :class="item.state">
                                        <div class="item-header">
                                            <span>{{item.createTimeStr}}</span>
                                        </div>
                                        <!-- 1)文本类型 -->
                                        <div v-if="item.contentType=='text'" class="item-content qqface-wrapper-global">
                                            <p class="text" v-html="getQQfaceEmoji(item.content)"></p>
                                        </div>
                                        <!-- 2)图片类型 -->
                                        <div v-else-if="item.contentType=='image'" class="item-content">
                                            <img class="img" :src="item.smallImgUrl" @click="imgViewDialog_show(item)" />
                                        </div>
                                        <!-- 3)文件类型 -->
                                        <div v-else-if="item.contentType=='file'" class="item-content">
                                            <div class="file">
                                                <i class="file-icon iconfont" :class="getFileIcon(item.fileName)"></i>
                                                <div class="file-info">
                                                    <p class="file-name">{{getFileName(item.fileName)}}</p>
                                                    <div class="file-opr">
                                                        <!-- 上传中 -->
                                                        <div v-show="item.state=='uploading'" class="uploading">
                                                            <div class="progress-bar"></div>
                                                            <a href="javascript:void(0)" @click="fileUpload_cancel(item.msgId)">取消</a>
                                                        </div>
                                                        <div v-show="item.state=='success'">
                                                            <a class="file-download" :href="item.fileUrl" target='_blank' :download="item.fileUrl">下载</a>
                                                        </div>
                                                        <div v-show="item.state=='error'" class="error">
                                                            <span class="error-tips">网络错误</span>
                                                            <a href="javascript:void(0)" @click="fileUpload_reSend(item)">重试</a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <!-- 4)语音 -->
                                        <div v-if="item.contentType=='voice'" class="item-content">
                                            <div class="voice" @click="playVoice(item)" :style="{ width: (190*item.content/60) + 'px' }">
                                                <i class="voice-play" v-show="item.playing" :class="item.role+'-voice'"></i>
                                                <i class="iconfont icon-yuyin" v-show="!item.playing"></i>
                                                <span>{{item.content}}''</span>
                                                <audio class="hide common_chat-radio" :id="'common_chat_radio_'+item.id" :src="item.fileURL"></audio>
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
            <div class="common_chat-footer" v-show="oprType!='view'">
                <div>
                    <!-- 表情、文件选择等操作 -->
                    <div class="opr-wrapper">
                        <common-chat-emoji class="item" ref="qqface" @select="qqface_selectFace"></common-chat-emoji>
                        <a class="item" href="javascript:void(0)" @click="fileUpload_click('img')">
                            <i class="iconfont icon-IMtupian"></i>
                        </a>
                        <a class="item" href="javascript:void(0)" @click="fileUpload_click('file')">
                            <i class="iconfont icon-IMwenjian"></i>
                        </a>
                        <form method="post" target="hidden_iframe" enctype="multipart/form-data">
                            <input type="file" name="fileName" id="common_chat_opr_fileUpload" style="display:none;position:absolute;left:0;top:0;width:0%;height:0%;opacity:0;">
                        </form>
                    </div>
                    <!-- 聊天输入框 -->
                    <div class="input-wrapper">
                        <div maxlength="500" class="inputContent qqface-wrapper-global" id="chat_log_input" contenteditable="true" @paste.stop="inputContent_paste" @keydown="inputContent_keydown" @mouseup="inputContent_mouseup" @mouseleave="inputContent_mouseup"></div>
                        <!-- 快捷回复 -->
                        <div ref="common_chat_shortcutPopover_wrapper" class="shortcutPopover-wrapper" v-show="shortcutPopoverVisible">
                            <p v-for="(item ,index) in shortcutMsgList" :class="{selected:item.selected}" :key="index" @click="selectShortcutItem(item.content)">
                                <span class="key" v-html="item.keyHTML"></span>
                                <span class="content" v-html="item.contentHTML"></span>
                            </p>
                            <p v-show="shortcutMsgList.length==0" class="red">没有与“
                                <span class="highlight">＃{{shortcutSearchValue}}</span>”匹配的快捷词，去除#进行快捷回复内容匹配
                            </p>
                        </div>
                        <span class="tips" contenteditable="false" @click="setInputDivFocus" v-show="tipsVisible && chatEn.state=='on'">小提示：输入 "#" 根据快捷词匹配回复</span>
                    </div>
                    <!--隐藏：快捷回复关键字(#开头)-->
                    <button type="primary" class="send-btn" :class="chatEn.state" @click="send()" v-show="chatEn.inputContent.substr(0, 1) != '#'" :disabled="chatEn.inputContent.length==0">发送</button>
                </div>
                <div v-show="chatEn.state=='off' || chatEn.state=='end'" class="off-wrapper">
                    <span class="content">会话已经结束</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import common_chat_emoji from './common_chat_emoji.vue';

export default {
    components: {
        commonChatEmoji: common_chat_emoji
    },
    data() {
        return {
            oprType: '', // 操作类型，eg：view(只读)
            chatEn: {
                inputContent: '',
                msgList: []
            },
            inputContent_setTimeout: null, // 输入文字时在输入结束才修改具体内容
            selectionRange: null, // 输入框选中的区域
            shortcutPopoverVisible: false, // 是否显示快捷回复popover
            shortcutMsgList: [], // 聊天区域的快捷回复列表
            shortcutSearchValue: '', // 快捷回复搜索关键词
            kfTransferDialogVisible: false,
            tipsVisible: true, // 提示信息是否显示，默认true
            durationStr: '00小时00分00秒', // 持续时长
            durationStr_setInterval: null, // 持续时长interval
            imgViewDialogVisible: false, // 图片查看dialog的显示
            imgViewDialog_imgSrc: '' // 图片查看dialog的图片地址
        };
    },
    computed: {
        storeShortcutReplyContent() {
            return this.$store.imStore.getters.shortcutReplyContent;
        },
        storeHaveNewMsgDelegate() {
            return this.$store.imStore.getters.haveNewMsgDelegate;
        }
    },
    watch: {
        /**
         * 快捷语句发生了变更
         */
        storeShortcutReplyContent: function(value) {
            if (value && value.length > 0) {
                this.setInputDiv(value);
            }
            // 清空选中的快捷回复
            this.$store.imStore.commit('setShortcutReplyContent', {
                value: ''
            });
        },
        /**
         * 当前会话含有新的消息
         */
        storeHaveNewMsgDelegate: function(value) {
            // 滚动到底部
            var self = this;
            this.$nextTick(function() {
                self.$refs.common_chat_main.scrollTop = self.$refs.common_chat_main.scrollHeight;
                setTimeout(function() {
                    if (self.$refs.common_chat_main.scrollTop != self.$refs.common_chat_main.scrollHeight) {
                        self.$refs.common_chat_main.scrollTop = self.$refs.common_chat_main.scrollHeight;
                    }
                }, 200);
            });
        }
    },
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
         * 发送
         */
        send: function() {
            var self = this;
            if (self.chatEn.inputContent.length == '') {
                return;
            }
            var msgContent = self.chatEn.inputContent;
            // 1.加入到消息集合里
            this.$store.imStore
                .dispatch('addChatMsg', {
                    imInfo_jobId: self.$data.chatEn.imInfo_jobId,
                    msg: {
                        role: 'server',
                        contentType: 'text',
                        content: msgContent
                    }
                })
                .then(() => {
                    // 2.清空内容并调用发送请求
                    document.getElementById('chat_log_input').innerHTML = '';
                    self.setInputContentByDiv('');
                    self.$data.tipsVisible = true;
                    self.$store.imStore.dispatch('im_send', {
                        imInfo_jobId: self.chatEn.imInfo_jobId,
                        contentType: 'text',
                        content: msgContent
                    });
                });
        },

        /**
         * 发送满意度
         */
        sendMYD: function() {
            // 清除输入内容
            document.getElementById('chat_log_input').innerHTML = '';
            // 发送关闭请求
            this.$store.imStore.dispatch('im_sendMYD', {
                imInfo_jobId: this.$data.chatEn.imInfo_jobId
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
        },

        /**
         * 设置输入框获取焦点
         */
        setInputDivFocus: function() {
            document.getElementById('chat_log_input').focus();
        },

        /**
         * 设置input输入框内容
         * @param {String} vlaue 设置的值
         */
        setInputDiv: function(value) {
            if (this.$data.selectionRange == null) {
                document.getElementById('chat_log_input').focus();
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
            value = this.getQQfaceEmoji(value);

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
        getQQfaceEmoji: function(value) {
            if (value == undefined) {
                return;
            }
            var self = this;
            return value.replace(/\[(.+?)\]/g, function(item, value) {
                return self.$refs.qqface.getImgByFaceName(value);
            });
        },

        /**
         * 播放声音
         * @param {Object} msg 消息对象
         */
        playVoice: function(msg) {
            var playing = !msg.playing;
            // 1.停止所有语言播放
            this.stopAllVoice();

            // 2.判断当前语音是否播放
            msg.playing = playing;
            if (msg.playing) {
                var audio = document.getElementById('common_chat_radio_' + msg.id);
                if (audio != null) {
                    audio.play();
                    audio.onended = function() {
                        // 播放完毕
                        msg.playing = false;
                    };
                }
            }
        },

        /**
         * 停止所有语言播放
         */
        stopAllVoice: function() {
            // 1.停止所有语音播放
            // 1)audio element
            var audioList = document.getElementsByClassName('common_chat-radio');
            for (var i = 0; i < audioList.length; i++) {
                var element = audioList[i];
                element.pause();
                element.currentTime = 0;
            }

            // 2)msg
            for (var i = 0; i < this.$data.chatEn.msgList.length; i++) {
                var msgTmp = this.$data.chatEn.msgList[i];
                if (msgTmp.contentType == 'voice') {
                    msgTmp.playing = false;
                }
            }
        },

        /**
         * 搜索快捷回复
         * @param {String} value 关键字 or 内容
         */
        searchShortcutReply: function(value) {
            var self = this;
            var searchValue = '';
            var isKeySearch = false; // 是否搜索关键字

            // 1.获取搜索字符
            if (value.substr(0, 1) == '#') {
                // 当第一个字符为 # 号时，表示搜索快捷语句的关键字
                searchValue = value.substr(1);
                isKeySearch = true;
            } else {
                searchValue = value;
                isKeySearch = false;
            }
            self.$data.shortcutSearchValue = searchValue;

            // 2.查询快捷回复
            self.$ak.Http.post({
                url: '/usystem/consult/quickReply/search.do',
                params: {
                    keyWord: searchValue,
                    pageNumber: 1,
                    pageSize: 5
                },
                successCallback: function(res) {
                    var itemList = res.result.data;
                    var enlist = [];
                    // 1)遍历返回的快捷回复集合，转换到enlist里
                    for (var i = 0; i < itemList.length; i++) {
                        var item = itemList[i];
                        // 遍历分组下具体内容
                        for (var j = 0; j < item.quickWords.length; j++) {
                            var subItem = item.quickWords[j];
                            // 2)关键字匹配
                            if (isKeySearch && subItem.keyWord.indexOf(searchValue) >= 0) {
                                enlist.push({
                                    keyWord: subItem.keyWord,
                                    content: subItem.content,
                                    selected: false
                                });
                            } else if (isKeySearch == false) {
                                enlist.push({
                                    keyWord: subItem.keyWord,
                                    content: subItem.content,
                                    selected: false
                                });
                            }
                        }
                    }
                    self.$data.shortcutPopoverVisible = true;
                    self.$data.shortcutMsgList = enlist;
                    if (enlist.length > 0) {
                        // 3)渲染关键字
                        var regex = new RegExp('(' + searchValue + ')', 'g');
                        for (var i = 0; i < enlist.length; i++) {
                            enlist[i].keyHTML = enlist[i].keyWord.replace(regex, '<span class="highlight">$1</span>');
                            if (isKeySearch) {
                                // 关键字匹配，内容区域不渲染
                                enlist[i].contentHTML = enlist[i].content;
                            } else {
                                enlist[i].contentHTML = enlist[i].content.replace(regex, '<span class="highlight">$1</span>');
                            }
                        }

                        // 4)内容搜索时，只有一个匹配项，并且快捷语句列表完全匹配searchValue，就隐藏快捷回复
                        if (enlist.length == 1 && enlist[0].content == searchValue) {
                            self.$data.shortcutPopoverVisible = false;
                        }
                    } else if (!isKeySearch) {
                        // 内容搜索没有匹配项就隐藏快捷回复
                        self.$data.shortcutPopoverVisible = false;
                    }

                    // 5)搜索关键字时默认选中第一行
                    if (enlist.length > 0 && isKeySearch) {
                        enlist[0].selected = true;
                    }
                }
            });
        },

        /**
         * 客服转接dialog_open
         */
        kfTransferDialog_open: function() {
            this.$data.kfTransferDialogVisible = true;
            var self = this;
            var initInterval = setInterval(function() {
                if (self.$refs.kfTransfer != undefined) {
                    self.$refs.kfTransfer.init({
                        chatEn: self.$data.chatEn
                    });
                    clearInterval(initInterval);
                }
            }, 200);
        },

        /**
         * 客服转接上传回调
         */
        kfTransferDialog_submit: function(rs) {
            this.$store.imStore.dispatch('addChatMsg', {
                imInfo_jobId: this.$data.chatEn.imInfo_jobId,
                msg: {
                    role: 'sys',
                    contentType: 'text',
                    content: rs.msg,
                    showTime: true
                }
            });
            this.$data.kfTransferDialogVisible = false;
        },

        /**
         * 客户转接取消回调
         */
        kfTransferDialog_cancel: function() {
            this.$data.kfTransferDialogVisible = false;
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
                    selectRange.commonAncestorContainer.parentElement.id == 'chat_log_input'
                ) {
                    // 选中了输入框内的文本
                    this.$data.selectionRange = selectRange;
                } else if (selectRange.commonAncestorContainer.id == 'chat_log_input') {
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
            // 1)ctrl、alt等键的按下直接返回
            if ([9, 16, 17, 18, 19, 20].indexOf(e.keyCode) >= 0) {
                return;
            } else if (this.$data.shortcutPopoverVisible && this.$data.shortcutMsgList.length > 0 && [13, 38, 40].indexOf(e.keyCode) >= 0) {
                // 2)快捷回复显示时，按下 ↓、↑ 、回车按键
                // 首先获取当前已选择的快捷语句
                var selectedIndex = -1;
                for (var i = 0; i < this.$data.shortcutMsgList.length; i++) {
                    var en = this.$data.shortcutMsgList[i];
                    if (en.selected) {
                        selectedIndex = i;
                    }
                    en.selected = false; // 清空所有选中状态
                }
                if (e.keyCode == 40) {
                    // ↓箭头：选择下一个
                    selectedIndex++;
                    if (selectedIndex >= this.$data.shortcutMsgList.length) {
                        selectedIndex = 0;
                    }
                } else if (e.keyCode == 38) {
                    // ↑ 箭头：选择上一个
                    selectedIndex--;
                    if (selectedIndex < 0) {
                        selectedIndex = this.$data.shortcutMsgList.length - 1;
                    }
                } else if (e.keyCode == 13) {
                    // 回车
                    if (selectedIndex != -1) {
                        // 选中了快捷回复某条内容
                        this.selectShortcutItem(this.$data.shortcutMsgList[selectedIndex].content);
                    } else if (selectedIndex == -1 && this.$data.chatEn.inputContent.substr(0, 1) != '#') {
                        // 未选中并且快捷回复非关键字匹配
                        this.send();
                        e.returnValue = false;
                        return;
                    }
                }
                this.$data.shortcutMsgList[selectedIndex].selected = true;
                // 滚动指定地方
                this.$refs.common_chat_shortcutPopover_wrapper.scrollTop =
                    (selectedIndex - 1) / this.$data.shortcutMsgList.length * this.$refs.common_chat_shortcutPopover_wrapper.scrollHeight;
                e.returnValue = false;
                return;
            } else if (this.$data.shortcutPopoverVisible && this.$data.shortcutMsgList.length == 0 && [13].indexOf(e.keyCode) >= 0) {
                // 3)快捷回复显示 && 没有数据时 && 按下了回车
                e.returnValue = false;
                return;
            } else if (e.keyCode == 13) {
                // 4)回车直接发送
                this.send();
                e.returnValue = false;
                return;
            }

            this.$data.tipsVisible = false;
            this.setInputContentSelectRange();
            var self = this;
            // keyup触发时，绑定的model还没有被变更，需要进行延后访问
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
                    var item = e.clipboardData.items[0];
                    if (item.kind == 'file' && item.type.indexOf('image') >= 0) {
                        // 粘贴板为图片类型
                        var file = e.clipboardData.items[i].getAsFile();
                        var reader = new FileReader();
                        reader.onload = function(evt) {
                            // 在消息中显示图片
                            var imgData = evt.target.result;

                            self.$store.imStore.dispatch('im_send', {
                                imInfo_jobId: self.chatEn.imInfo_jobId,
                                contentType: 'image',
                                content: imgData
                            });
                        };
                        reader.readAsDataURL(file);
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
         * @param {String} fileType 上传的文件类型
         */
        fileUpload_click: function(fileType) {
            if (fileType == 'img') {
                document.getElementById('common_chat_opr_fileUpload').accept = '.bmp,.gif,.jpg,.pic,.png,.tif,.jpeg';
            } else {
                document.getElementById('common_chat_opr_fileUpload').accept = '';
            }
            document.getElementById('common_chat_opr_fileUpload').onchange = this.fileUpload_change;
            document.getElementById('common_chat_opr_fileUpload').click();
        },

        /**
         * 文件上传_选中文件
         */
        fileUpload_change: function(e) {
            var fileNameIndex =
                $('#common_chat_opr_fileUpload')
                    .val()
                    .lastIndexOf('\\') + 1;
            var fileName = $('#common_chat_opr_fileUpload')
                .val()
                .substr(fileNameIndex);
            var extend = fileName.substring(fileName.lastIndexOf('.') + 1);
            // 1.判断有效
            // 1)格式
            if (
                [
                    'txt',
                    'doc',
                    'docx',
                    'hlp',
                    'wps',
                    'rtf',
                    'html',
                    'pdf',
                    'xls',
                    'xlsx',
                    'ppt',
                    'pptx',
                    'rar',
                    'zip',
                    'arj',
                    'gz',
                    'z',
                    '7z',
                    'wav',
                    'aif',
                    'au',
                    'mp3',
                    'ram',
                    'wma',
                    'mmf',
                    'amr',
                    'aac',
                    'flac',
                    'avi',
                    'mpg',
                    'mov',
                    'swf',
                    'mp4',
                    'bmp',
                    'gif',
                    'jpg',
                    'pic',
                    'png',
                    'tif',
                    'jpeg'
                ].indexOf(extend) < 0
            ) {
                $('#common_chat_opr_fileUpload').val('');
                this.$ak.Msg.toast('格式错误', 'error');
                return;
            } else if ($('#common_chat_opr_fileUpload')[0].files[0].size >= 1000 * 1000 * 10) {
                // 2)大小
                this.$ak.Msg.toast('文件大小不能超过10M', 'error');
                $('#common_chat_opr_fileUpload').val('');
                return false;
            }

            // 2.文件上传
            var self = this;
            self.$store.imStore.dispatch('im_send', {
                imInfo_jobId: self.chatEn.imInfo_jobId,
                contentType: 'file',
                fileFieldName: 'from-file',
                fileName: fileName,
                fileData: $('#common_chat_opr_fileUpload')[0].files[0],
                successCallbcak: function(rs) {
                    $('#common_chat_opr_fileUpload').val('');
                }
            });

            // 3.增加到信息集合里
            this.$store.imStore.dispatch('addChatMsg', {
                imInfo_jobId: this.$data.chatEn.imInfo_jobId,
                msg: {
                    role: 'server',
                    contentType: 'file',
                    fileName: fileName,
                    state: 'uploading'
                }
            });

            this.$nextTick(function() {
                self.$refs.common_chat_main.scrollTop = self.$refs.common_chat_main.scrollHeight;
            });
        },

        /**
         * 取消上传
         * @param {String} msgId 消息Id
         */
        fileUpload_cancel: function(msgId) {
            for (var i = 0; i < this.$data.chatEn.msgList.length; i++) {
                var msgTmp = this.$data.chatEn.msgList[i];
                if (msgTmp.state == 'uploading' && msgTmp.msgId == msgId) {
                    this.$data.chatEn.msgList.splice(i, 1);
                    $('#common_chat_opr_fileUpload').val('');
                    break;
                }
            }
        },

        /**
         * 重新发送
         * @param {Object} item 消息对象
         */
        fileUpload_reSend: function(item) {
            var self = this;
            item.state = 'uploading';
            self.$store.imStore.dispatch('im_send', {
                imInfo_jobId: self.chatEn.imInfo_jobId,
                contentType: 'file',
                fileFieldName: 'from-file',
                fileName: item.fileName,
                fileData: item.fileData,
                successCallbcak: function(rs) {}
            });
        },

        /**
         * 加载历史数据
         */
        loadHistoryMsg: function() {
            var self = this;
            var chatEn = this.$data.chatEn;
            // 保存载入前的sroll高度
            var oldMsgDivScrollHeight = self.$refs.common_chat_main.scrollHeight;

            // 调用数据
            var imInfo_jobId = this.$data.chatEn.imInfo_jobId;
            this.$ak.Http.post({
                url: '/udesktop/im/allHistory/info.do',
                params: {
                    agentId: window.agentId,
                    companyId: window.companyId,
                    clientId: chatEn.imInfo_clientId,
                    jobId: imInfo_jobId,
                    pageNumber: chatEn.imInfo_pageNumber,
                    pageSize: 10
                },
                successCallback: function(res) {
                    // 1.添加到消息集合里
                    var enlist = res.result.data;
                    for (var i = 0; i < enlist.length; i++) {
                        var en = enlist[i];
                        self.$store.imStore.dispatch('addChatMsg', {
                            imInfo_jobId: imInfo_jobId,
                            historyMsg: en,
                            isHistoryMsg: true,
                            successCallbcak: function() {
                                self.$nextTick(function() {
                                    // 载入数据完成后，滚动条定位到点击时的位置
                                    self.$refs.common_chat_main.scrollTop = self.$refs.common_chat_main.scrollHeight - oldMsgDivScrollHeight;
                                });
                            }
                        });
                    }

                    // 2.修改状态
                    var haveHistoryMsg = enlist.length > 0 ? true : false;
                    chatEn.imInfo_pageNumber++;
                    self.$store.imStore.dispatch('extendChatEn', {
                        imInfo_jobId: imInfo_jobId,
                        extends: {
                            haveHistoryMsg: haveHistoryMsg,
                            imInfo_pageNumber: chatEn.imInfo_pageNumber
                        }
                    });

                    // 3.没有历史记录，显示消息
                    if (haveHistoryMsg == false) {
                        self.$store.imStore.dispatch('addChatMsg', {
                            imInfo_jobId: imInfo_jobId,
                            msg: {
                                role: 'sys',
                                contentType: 'text',
                                content: '没有更多记录',
                                isNewMsg: false
                            }
                        });
                    }
                }
            });
        },

        /**
         * qqface选中表情
         */
        qqface_selectFace: function(rs) {
            var imgStr = rs.imgStr;
            this.setInputDiv(imgStr);
        },

        /**
         * 获取文件的icon
         * @param {String} fileName 文件名称
         */
        getFileIcon: function(fileName) {
            if (!fileName) {
                return;
            }
            var extend = fileName.substring(fileName.lastIndexOf('.') + 1);
            var className = '';
            switch (extend) {
                case 'bmp':
                case 'gif':
                case 'jpg':
                case 'pic':
                case 'png':
                case 'tif':
                case 'jpeg':
                    className = 'icon-fumeititupian';
                    break;
                case 'doc':
                case 'docx':
                    className = 'icon-fumeitiword';
                    break;
                case 'xls':
                case 'xlsx':
                    className = 'icon-fumeitiexcel';
                    break;
                case 'pdf':
                    className = 'icon-fumeitipdf';
                    break;
                case 'ppt':
                case 'pptx':
                    className = 'icon-fumeitippt';
                    break;
                case 'html':
                    className = 'icon-fumeitihtml';
                    break;
                case 'zip':
                case 'arj':
                case 'gz':
                case 'z':
                case '7z':
                case 'rar':
                    className = 'icon-fumeitiyasuowenjian';
                    break;
                case 'avi':
                case 'mpg':
                case 'mov':
                case 'swf':
                case 'mp4':
                    className = 'icon-fumeitishipinwenjian';
                    break;
                case 'wav':
                case 'aif':
                case 'au':
                case 'mp3':
                case 'ram':
                case 'wma':
                case 'mmf':
                case 'amr':
                case 'aac':
                case 'flac':
                    className = 'icon-fumeitiyinpinwenjian';
                    break;
                default:
                    className = 'icon-fumeititongyongwenjian';
                    break;
            }
            return className;
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
            this.$data.imgViewDialog_imgSrc = item.imgUrl;
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
        }
    },
    mounted() {}
};
</script>
<style lang="less">
.common_chat-wrapper {
    @keyframes progress-bar-stripes {
        from {
            background-position: 40px 0;
        }
        to {
            background-position: 0 0;
        }
    }
    .common_chat-inner {
        width: 100%;
        height: 100%;
        position: relative;
        font-size: 12px;
        float: left;
        border: 0px;
        .common_chat-header {
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
        .common_chat-main {
            overflow-y: auto;
            overflow-x: hidden;
            position: relative;
            height: calc(~'100% - 240px');
            clear: both;
            .common_chat-main-header {
                text-align: center;
                padding-top: 14px;
                .el-button {
                    font-size: 12px;
                    color: #8d8d8d;
                    padding: 0px;
                }
            }
            .common_chat-main-content {
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
                        color: #b0b0b0;
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
                    .client,
                    .server {
                        font-size: 12px;
                        margin-top: 18px;
                        .headericon-wrapper {
                            float: left;
                        }
                        .info-wrapper {
                            text-align: left;
                            font-size: 12px;
                            position: relative;
                            .item-header {
                                position: relative;
                                color: #b0b0b0;
                            }
                            .item-content {
                                max-width: 330px;
                                color: #3e3e3e;
                                font-size: 12px;
                                position: relative;
                                margin-top: 10px;
                                .text {
                                    white-space: normal;
                                    word-wrap: break-word;
                                    word-break: break-all;
                                    padding: 13px 12px;
                                }
                                .qqface {
                                    width: 24px;
                                    height: 24px;
                                }
                                .img {
                                    white-space: normal;
                                    word-wrap: break-word;
                                    word-break: break-all;
                                    padding: 5px;
                                    max-width: 320px;
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
                                            white-space: nowrap;
                                            text-overflow: ellipsis;
                                            overflow: hidden;
                                            line-height: 1.3;
                                        }
                                        .file-opr {
                                            margin-top: 10px;
                                            .uploading {
                                                .progress-bar {
                                                    width: 120px;
                                                    display: inline-block;
                                                    -webkit-animation: progress-bar-stripes 2s linear infinite;
                                                    animation: progress-bar-stripes 2s linear infinite;
                                                    background-image: linear-gradient(
                                                        45deg,
                                                        rgba(255, 255, 255, 0.15) 25%,
                                                        transparent 25%,
                                                        transparent 50%,
                                                        rgba(255, 255, 255, 0.15) 50%,
                                                        rgba(255, 255, 255, 0.15) 75%,
                                                        transparent 75%,
                                                        transparent
                                                    );
                                                    background-size: 20px 20px;
                                                    background-color: #20a0ff;
                                                    height: 7px;
                                                    border-radius: 10px;
                                                    box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.15);
                                                }
                                            }
                                            .error {
                                                .error-tips {
                                                    display: inline-block;
                                                    width: 70px;
                                                    color: #8d8d8d;
                                                }
                                            }
                                        }
                                    }
                                    .file-icon {
                                        font-size: 40px;
                                        float: left;
                                    }
                                    .file-download {
                                        color: #00a8d7;
                                        cursor: pointer;
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
                    .item.client {
                        margin-left: 5px;
                        .headericon-wrapper {
                            padding: 15px 18px 15px 13px;
                            .iconfont {
                                border-width: 0px;
                                border-radius: 50%;
                                padding: 7px;
                                color: white;
                                font-size: 16px;
                            }
                        }
                        .info-wrapper {
                            .item-content {
                                background-color: #f9fbfc;
                                border: 1px solid #e6e6e6;
                                border-radius: 5px;
                                float: left;
                            }
                        }
                    }
                    .item.server {
                        .headericon-wrapper {
                            float: right;
                            padding: 0px 18px 0px 13px;
                            .kf-name {
                                width: 40px;
                                display: block;
                                white-space: nowrap;
                                text-overflow: ellipsis;
                                overflow: hidden;
                                text-align: center;
                                color: #b0b0b0;
                                font-size: 12px;
                            }
                            .kf-img {
                                width: 40px;
                                margin-top: 10px;
                            }
                        }
                        .info-wrapper {
                            float: right;
                            &::before {
                                font-family: 'iconfont';
                                font-size: 16px;
                                content: '\e61d';
                                color: #ff3939;
                                position: absolute;
                                left: -35px;
                                top: 30%;
                                display: none;
                            }
                            &.error::before {
                                display: inherit;
                            }
                            .item-header {
                                text-align: right;
                            }
                            .item-content {
                                background-color: #d2f4fd;
                                border: 1px solid #c3e9f6;
                                border-radius: 5px;
                                .voice {
                                    text-align: left;
                                    .voice-play,
                                    .icon-yuyin {
                                        float: right;
                                    }
                                    .icon-yuyin {
                                        transform: rotate(180deg);
                                    }
                                }
                            }
                        }
                    }
                }
                & > .empty-wrapper {
                    font-size: 16px;
                    color: #3e3e3e;
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    margin-top: 18px;
                    .content {
                        width: 170px;
                        height: 200px;
                        margin: 0px auto;
                        text-align: center;
                        .empty-img {
                            img {
                                width: 120px;
                                height: 120px;
                            }
                        }
                        .title {
                            margin-top: 25px;
                        }
                    }
                }
            }
        }
        .common_chat-footer {
            position: relative;
            height: 190px;
            width: 100%;
            border-top: 1px solid #e6e6e6;
            .opr-wrapper {
                text-align: left;
                height: 20px;
                padding: 20px 0px 18px 16px;
                & > .item {
                    margin-right: 12px;
                    float: left;
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
    .kfTransfer-dialog {
        .el-dialog {
            width: 350px;
            .el-dialog__body {
                padding: 0px;
                padding-top: 12px;
            }
        }
    }
    .imgView-dialog {
        background: #00000080;
        height: 101%;
        .el-dialog {
            max-width: 75%;
            width: auto;
            .el-dialog__header {
                display: none;
            }
            .el-dialog__body {
                padding: 0px;
                .header {
                    background: transparent;
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
                .img {
                    width: 100%;
                }
            }
        }
    }
}
</style>

