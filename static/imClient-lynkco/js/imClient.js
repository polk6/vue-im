var Utils = Utils || {};
Utils.getDateTimeStr = function(sValue, dateFormat) {
    if (dateFormat == undefined) {
        dateFormat = 'Y-m-d'; // 默认显示年月日
    }

    var dt = sValue;

    // 2.转换
    // 1)转换成对象 'Y-m-d H:i:s'
    var obj = {}; //返回的对象，包含了 year(年)、month(月)、day(日)
    obj.Y = dt.getFullYear(); //年
    obj.m = dt.getMonth() + 1; //月
    obj.d = dt.getDate(); //日期
    obj.H = dt.getHours();
    obj.i = dt.getMinutes();
    obj.s = dt.getSeconds();
    //2.2单位的月、日都转换成双位
    if (obj.m < 10) {
        obj.m = '0' + obj.m;
    }
    if (obj.d < 10) {
        obj.d = '0' + obj.d;
    }
    if (obj.H < 10) {
        obj.H = '0' + obj.H;
    }
    if (obj.i < 10) {
        obj.i = '0' + obj.i;
    }
    if (obj.s < 10) {
        obj.s = '0' + obj.s;
    }
    // 3.解析
    var rs = dateFormat
        .replace('Y', obj.Y)
        .replace('m', obj.m)
        .replace('d', obj.d)
        .replace('H', obj.H)
        .replace('i', obj.i)
        .replace('s', obj.s);

    return rs;
};

/**
 * qq表情组件
 */
Vue.component('qq-emoji', {
    template:
        '<div class="qqEmoji-wrapper qqEmoji-wrapper-global">' +
        '    <a href="javascript:void(0)" @click="toggleFaceHidden">' +
        '        <i class="iconfont icon-IMbiaoqing float-left"></i>' +
        '    </a>' +
        '    <div class="list-wrapper" v-show="!faceHidden">' +
        '        <div class="list-inner" @click="selectFace">' +
        '            <a v-for="(item, index) in qqEmojiList" class="qqEmoji" :title="item" :text="[item]" :class="\'qqEmoji\'+index"></a>' +
        '        </div>' +
        '    </div>' +
        '    <input type="text" id="imClient_qqEmoji_txt" @blur="hideFaceWrapper" style="width:0px;height:0px;border: 0px;" />' +
        '</div>',
    data: function() {
        return {
            qqEmojiList: [
                '微笑',
                '撇嘴',
                '色',
                '发呆',
                '得意',
                '流泪',
                '害羞',
                '闭嘴',
                '睡',
                '大哭',
                '尴尬',
                '发怒',
                '调皮',
                '呲牙',
                '惊讶',
                '难过',
                '酷',
                '冷汗',
                '抓狂',
                '吐',
                '偷笑',
                '愉快',
                '白眼',
                '傲慢',
                '饥饿',
                '困',
                '惊恐',
                '流汗',
                '憨笑',
                '悠闲',
                '奋斗',
                '咒骂',
                '疑问',
                '嘘',
                '晕',
                '疯了',
                '衰',
                '骷髅',
                '敲打',
                '再见',
                '擦汗',
                '抠鼻',
                '鼓掌',
                '糗大了',
                '坏笑',
                '左哼哼',
                '右哼哼',
                '哈欠',
                '鄙视',
                '委屈',
                '快哭了',
                '阴险',
                '亲亲',
                '吓',
                '可怜',
                '菜刀',
                '西瓜',
                '啤酒',
                '篮球',
                '乒乓',
                '咖啡',
                '饭',
                '猪头',
                '玫瑰',
                '凋谢',
                '嘴唇',
                '爱心',
                '心碎',
                '蛋糕',
                '闪电',
                '炸弹',
                '刀',
                '足球',
                '瓢虫',
                '便便',
                '月亮',
                '太阳',
                '礼物',
                '拥抱',
                '强',
                '弱',
                '握手',
                '胜利',
                '抱拳',
                '勾引',
                '拳头',
                '差劲',
                '爱你',
                'NO',
                'OK',
                '爱情',
                '飞吻',
                '跳跳',
                '发抖',
                '怄火',
                '转圈',
                '磕头',
                '回头',
                '跳绳',
                '投降',
                '激动',
                '乱舞',
                '献吻',
                '左太极',
                '右太极'
            ],
            faceHidden: true
        };
    },
    methods: {
        /**
         * 切换face界面的显示
         */
        toggleFaceHidden: function() {
            this.$data.faceHidden = !this.$data.faceHidden;
            if (!this.$data.faceHidden) {
                document.getElementById('imClient_qqEmoji_txt').focus();
            }
        },

        /**
         * 关闭表情窗口
         */
        hideFaceWrapper: function() {
            var self = this;
            // 选中face也会隐藏表情窗口，这时判断是否已经隐藏了
            setTimeout(function() {
                if (!self.$data.faceHidden) {
                    self.$data.faceHidden = true;
                }
            }, 200);
        },

        /**
         * 选中face
         */
        selectFace: function(e) {
            var faceName = e.target.getAttribute('text');
            if (!faceName) {
                return;
            }
            var imgStr = this.getImgByFaceName(faceName);
            this.$emit('select', {
                faceName: faceName,
                imgStr: imgStr
            }); // 事件上传

            // 关闭窗口
            this.$data.faceHidden = true;
        },

        /**
         * 根据face名称返回一个img图片
         * @param {String} faceName face名称
         */
        getImgByFaceName: function(faceName) {
            var imgStr = '<img class="qqEmoji small qqEmoji@faceIndex" src="image/qqEmoji_spacer.gif" text="@faceName"/>';
            var faceIndex = 0;
            for (var i = 0; i < this.$data.qqEmojiList.length; i++) {
                if (this.$data.qqEmojiList[i] == faceName) {
                    faceIndex = i;
                    break;
                }
            }
            imgStr = imgStr.replace(/@faceIndex/g, faceIndex).replace(/@faceName/g, faceName);
            return imgStr;
        }
    }
});

/**
 * imVm
 */
var imVm = new Vue({
    el: '#im_client_app',
    data: {
        socket: null,
        oprRoleName: 'client',
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
            serverChatName: '专员001',
            avatarUrl: 'image/im_server_avatar.png'
        }, // 服务端chat信息
        robotEn: {
            robotName: '小旺',
            avatarUrl: 'image/im_server_avatar.png'
        }, // 机器人信息
        projectEn: {
            projectName: '领克在线客服'
        }, // 项目信息
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
    },
    watch: {},
    methods: {
        /**
         * 注册账号信息
         */
        regclientChatEn: function() {
            // 1.注册用户信息
            this.$data.clientChatEn.clientChatId = Date.now() + Math.random();
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

            var self = this;
            // 2.机器人消息
            var tmpArray = [
                {
                    role: 'robot',
                    avatarUrl: self.$data.robotEn.avatarUrl,
                    contentType: 'issueList',
                    issueList: [
                        {
                            title: '全额退款的步骤',
                            content:
                                '步骤：申请退款-未收到货-退款原因-提交<br/>1、 若未收到货：点击--"订单详情"---"延长收货时间" 或 "申请退款"<br/>2、 若已收到货且需退换货：可申请退款<br/>3、 若已收到货且商品无问题，请确认收货'
                        },
                        {
                            title: '没有收到货怎么办？',
                            content: '我也没办法'
                        },
                        {
                            title: '信用评价注意事项',
                            content: '只能评价五星好评'
                        }
                    ]
                },
                {
                    role: 'robot',
                    avatarUrl: self.$data.robotEn.avatarUrl,
                    contentType: 'issueExtend',
                    content: '312元',
                    issueList: [
                        {
                            title: '没有收到货怎么办？'
                        },
                        {
                            title: '上门安装费用是多少？'
                        }
                    ]
                },
                {
                    role: 'robot',
                    avatarUrl: self.$data.robotEn.avatarUrl,
                    issueResultScoreState: 0,
                    contentType: 'issueResult',
                    content:
                        '如果您需要安装的普通挂架，我们的工程师会携带挂架上门， 向您收取150元的服务费。如果您是特殊墙面， 我们需要向您额外收取50元特殊墙面处理费。'
                }
            ];

            for (var i = 0; i < tmpArray.length; i++) {
                var item = tmpArray[i];
                this.addChatMsg(item);
            }
        },

        /**
         * 注册socket
         */
        regSocket: function() {
            var self = this;
            self.$data.socket = io('http://localhost:3001');
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
                    if (self.$data.chatInfoEn.chatState == 'robot') {
                        data.msg.avatarUrl = self.$data.robotEn.avatarUrl;
                    } else if (self.$data.chatInfoEn.chatState == 'agent') {
                        data.msg.avatarUrl = self.$data.serverChatEn.avatarUrl;
                    }
                    self.addChatMsg(data.msg, function() {
                        self.goEnd();
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
            if (this.$data.chatInfoEn.lastMsgShowTime == null || msg.createTime.getTime() - this.$data.chatInfoEn.lastMsgShowTime.getTime() > 1000 * 60 * 5) {
                msgList.push({
                    role: 'sys',
                    contentType: 'text',
                    content: Utils.getDateTimeStr(msg.createTime, 'Y-m-d H:i:s')
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
         * @param {Object} msg 消息对象
         */
        sendMsg: function(msg) {
            msg.role = 'client';
            msg.avatarUrl = this.$data.clientChatEn.avatarUrl;
            if (this.$data.chatInfoEn.chatState == 'robot') {
                // 机器人发送接口
            } else if (this.$data.chatInfoEn.chatState == 'agent') {
                // 客服接口
                this.$data.socket.emit('clientSendMsg', {
                    serverChatId: this.$data.serverChatEn.serverChatId,
                    clientChatId: this.$data.clientChatEn.clientChatId,
                    msg: msg
                });
            }
            // 2.添加到消息集合李
            var self = this;
            this.addChatMsg(msg, function() {
                self.goEnd();
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
            var tmpInputContent = htmlStr.replace(/<img.+?text=\"(.+?)\".?>/g, '[$1]').replace(/<.+?>/g, '');

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
                        var formData = new FormData();
                        formData.append('uploadFile', file);
                        this.$http.uploadFile({
                            url: '/upload',
                            params: formData,
                            successCallback: function(rs) {
                                document.getElementById('imClientChat_opr_fileUpload').value = '';
                                self.sendMsg({
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
         * 输入框的拖拽
         */
        inputContent_drop: function(e) {
            var self = this;
            setTimeout(function() {
                self.setInputContentByDiv();
            }, 100);
        },

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
            // 2.文件上传
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
         * 显示登出的confirm
         */
        showLogoutConfirm: function() {
            this.$data.im_logoutVisible = false;
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
        queueDialog_changeItem: function(e) {},

        /**
         * 队列dialog_提交
         */
        queueDialog_submit: function() {
            if (this.$data.im_queueDialog_selectedItem.length == 0) {
                this.$message.error('请选择咨询内容');
                return;
            }
            this.$data.im_queueDialogVisible = false;
            this.$data.chatInfoEn.chatState = 'agent';
            this.regSocket();
            this.goEnd();
        },

        /**
         * 显示满意度Dailog
         */
        mydDialog_show: function() {
            if (this.$data.chatInfoEn.chatState == 'agent') {
                this.$data.im_mydDialogVisible = true;
                this.$data.im_mydDialogSubmitOk = false;
                this.$data.im_mydDialog_form.selectedItem = '';
                this.$data.im_mydDialog_form.remark = '';
            }
        },

        /**
         * 设置满意度
         */
        mydDialog_setMyd: function(value) {
            this.$data.im_mydDialog_form.selectedItem = value;
        },

        /**
         * 满意度dialog_提交
         */
        mydDialog_submit: function() {
            if (this.$data.im_mydDialog_form.selectedItem == '') {
                this.$message.error('请进行评分');
                return;
            }
            this.$data.im_mydDialogSubmitOk = true;
            var score = this.$data.im_mydDialog_form.selectedItem.toString();
            score = 6 - score; // 后台数据库 1表示非常满意
        },

        /**
         * 发起新的会话
         */
        mydDialog_createNewChat: function() {
            this.$data.im_mydDialogVisible = false;
            this.regclientChatEn();
        },

        /**
         * 显示留言Dialog
         */
        leaveMsgDialog_show: function() {
            this.$data.im_leaveMsgVisible = true;
            this.$data.im_leaveMsgResultVisible = false;
            this.$data.im_leaveMsgDialog_form = {
                email: '',
                phone: '',
                content: ''
            };
            this.$refs.im_leaveMsgDialog_form && this.$refs.im_leaveMsgDialog_form.resetFields();
        },

        /**
         * 留言dialog_提交
         */
        leaveMsgDialog_submit: function() {
            var self = this;
            this.$refs.im_leaveMsgDialog_form.validate(function(valid) {
                if (valid) {
                    self.$data.im_leaveMsgResultVisible = true;
                }
            });
        },

        /**
         * qqEmoji选中表情
         */
        qqEmoji_selectFace: function(rs) {
            var imgStr = rs.imgStr;
            if (this.$data.selectionRange == null) {
                document.getElementById('im_client_input').click();
                return;
            }
            // 1.设置selectionRange
            if (window.getSelection) {
                window.getSelection().removeAllRanges();
                window.getSelection().addRange(this.$data.selectionRange);
            } else {
                this.$data.selectionRange && this.$data.selectionRange.select();
            }

            // 2.填充表情
            var sel, range;
            if (window.getSelection) {
                // IE9 and non-IE
                sel = window.getSelection();
                if (sel.getRangeAt && sel.rangeCount) {
                    range = sel.getRangeAt(0);
                    range.deleteContents();

                    var elemnet;
                    if (range.createContextualFragment) elemnet = range.createContextualFragment(imgStr);
                    else {
                        var o = document.createElement('div');
                        o.innerHTML = imgStr;
                        elemnet = document.createDocumentFragment();
                        for (var r, c; (r = o.firstChild); ) c = elemnet.appendChild(r);
                    }
                    var lastNode = elemnet.lastChild;
                    if (lastNode != null) {
                        range.insertNode(elemnet);
                        range.setStartAfter(lastNode);
                        sel.removeAllRanges();
                        sel.addRange(range);
                    }
                }
            } else if (document.selection && document.selection.type != 'Control') {
                // IE < 9
                document.selection.createRange().pasteHTML(imgStr);
            }

            // 3.修改inputContent
            this.setInputContentByDiv();
        },

        /**
         * 关闭IM
         */
        closeChat: function() {
            if (this.$data.chatInfoEn.chatState == 'robot') {
                this.leaveMsgDialog_show();
            } else {
                this.$data.im_logoutVisible = true;
            }
        },

        /**
         * 注销dialog_提交
         */
        logoutDialog_submit: function() {
            this.$data.im_logoutVisible = false;
            this.addChatMsg({
                role: 'sys',
                content: '本次会话已结束'
            });
        },

        /**
         * 注销dialog_取消
         */
        logoutDialog_cancel: function() {
            this.$data.im_logoutVisible = false;
        },

        /**
         * 相关问题点击
         */
        issueExtendFastSelect: function(msgContent) {
            this.sendMsg({
                contentType: 'text',
                content: msgContent
            });
        },

        /**
         * 设置问题结果
         */
        setIssueResult: function(item, resultFlag) {},

        /**
         * 聊天记录滚动到底部
         */
        goEnd: function() {
            var self = this;
            this.$nextTick(function() {
                setTimeout(function() {
                    self.$refs.imClientChat_main.scrollTop = self.$refs.imClientChat_main.scrollHeight;
                }, 100);
            });
        }
    },
    mounted: function() {
        // 登录
        this.regclientChatEn();
    }
});
