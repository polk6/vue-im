/*!
 *  im服务端Store
 */

import Vue from 'vue';
import Vuex from 'vuex';
import ak from '@/common/ak.js';

Vue.use(Vuex);
export const imServerStore = new Vuex.Store({
    state: {
        serverChatInfo: {
            serverChatId: Number.parseInt(Date.now() + Math.random()),
            serverChatName: '小P',
        },
        selectedChatEn: null, // 选取的会话对象
        currentChatEnlist: [{
            userName: '张三',
            inputContent: '',
            msgList: [],
            state: 'on',
            lastMsgTime: new Date(),
            lastMsgContent: '你好，我想咨询',
            newMsgCount: 2,
        }], // 当前chat实体集合
        notificationChatEnlist: [], // 通知chat实体集合
        changeSelectIMDelegate: null, // 更改选中im的委托
        haveNewMsgDelegate: null, // 当前已选中的用户含有新消息
    },
    mutations: {

        /**
         * 添加chat对象
         * @param {Object} payload 载荷对象
         * @param {String} payload.chatEn chat对象
         * @param {String} payload.listName 集合
         */
        addChat: function(state, payload) {
            var chatEn = payload.chatEn;
            var listName = payload.listName;

            // 1.公共属性
            chatEn.chatId = Number.parseInt(Date.now() + Math.random());
            chatEn.msgList = [];
            chatEn.state = 'on';
            chatEn.accessTime = new Date(); // 访问时间
            chatEn.inputContent = ''; // 输入框内容
            chatEn.newMsgCount = 0;
            chatEn.isFollow = false; // 是否关注
            chatEn.lastMsgTime = '';
            chatEn.lastMsgShowTime = null; // 最后一个消息的显示时间
            state.currentChatEnlist.push(payload.chatEn);
        },

        /**
         * 触发选择im
         * @param {Object} payload 载荷对象
         */
        triggerChangeSelectIMDelegate: function(state, payload) {
            state.changeSelectIMDelegate = Date.now();
        },

        /**
         * 排序当前会话列表
         */
        sortCurrentChatEnlist: function(state, payload) {
            var enlist = state.currentChatEnlist.concat();

            // 排序规则：
            // 1)已关注放最前面，关注状态下按最后一条获取时间正序
            // 2)非关注状态下，按最后一条获取时间正序

            // 1.首先按最后一次更新时间排序
            for (var i = 0; i < enlist.length; i++) {
                for (var j = i; j < enlist.length; j++) {
                    var iTimeSpan = Date.parse('2017-03-31 ' + enlist[i].lastMsgTime);
                    var jTimeSpan = Date.parse('2017-03-31 ' + enlist[j].lastMsgTime);
                    if (iTimeSpan < jTimeSpan) {
                        var tmp = enlist[i];
                        enlist[i] = enlist[j];
                        enlist[j] = tmp;
                    }
                }
            }

            // 2.已关注的排在最前面并按最后一次时间倒序
            var followEnlist = [];
            var unfollowEnlist = [];
            for (var i = 0; i < enlist.length; i++) {
                var en = enlist[i];
                if (en.isFollow) {
                    followEnlist.push(en);
                } else {
                    unfollowEnlist.push(en);
                }
            }

            // 3.合并
            state.currentChatEnlist = followEnlist.concat(unfollowEnlist);
        },

        /**
         * 清除通知chat
         */
        clearNotificationChat: function(state) {
            state.notificationChatEnlist = [];
        }
    },
    actions: {
        /**
         * 初始化
         */
        init: function(context, payload) {},

        /**
         * 坐席间即时消息
         * @param {Object} rs 回调rs，含有如下成员
         * json:即时消息的相关信息
         * id:类型
         * username:用户名
         * formNumber:发送方
         * toNumber:接收方
         * contentType:发送类型1图片2文件0普通文本4webcall12临时文本
         * message:发送的消息内容
         */
        Agent_OnDialogEventAll: function(context, { rs }) {
            // 1.文本消息
            if (rs.msg.contentType == '0') {
                // 过滤【系统提醒】
                if (rs.msg.message.indexOf('【系统提醒】') == 0) {
                    return;
                }
                context.dispatch('addChatMsg', {
                    chatId: rs.msg.jobId,
                    msg: {
                        role: 'client',
                        contentType: 'text',
                        content: rs.msg.message
                    }
                });
            } else if (rs.msg.contentType == '1') {
                // 图片
                var imgObj = JSON.parse(rs.msg.message);
                var imgUrl = imgObj.begin;
                var smallImgUrl = imgObj.end;
                // TODO 替换域名前缀 http://120.55.88.191:10080
                imgUrl = imgUrl.replace(/http:\/\/(.+?)\//g, stateStore.getters.accountInfo.ipcc_url + '/');
                smallImgUrl = smallImgUrl.replace(/http:\/\/(.+?)\//g, stateStore.getters.accountInfo.ipcc_url + '/');
                // end TOTO

                context.dispatch('addChatMsg', {
                    chatId: rs.msg.jobId,
                    msg: {
                        role: 'client',
                        contentType: 'image',
                        content: '[图片]',
                        imgUrl: imgUrl,
                        smallImgUrl: smallImgUrl
                    }
                });
            } else if (rs.msg.contentType == '2') {
                // 文件
                var fileObj = JSON.parse(rs.msg.message);
                var fileName = fileObj.fileName.substring(32);
                // 转义文件名称的特殊字符
                fileName = fileName.replace(/(&.+?;)/g, function(item, value) {
                    if (value.indexOf('&#') == 0) {
                        // 16进制
                        var num = value.replace('&#', '').replace(';', '');
                        if (num.indexOf('x') == 0) {
                            num = Number.parseInt(num, 16); // 16进制转换为10进制
                        } else {
                            num = Number.parseInt(num); // 10进制
                        }
                        var rs = String.fromCharCode(num);
                        return rs;
                    }
                    return value;
                });
                var fileUrl = fileObj.webbotDownloadUrl + '/' + fileObj.fileName;
                // TODO 替换域名前缀
                fileUrl = fileUrl.replace(/http:\/\/(.+?)\//g, stateStore.getters.accountInfo.ipcc_url + '/');
                // end TODO

                context.dispatch('addChatMsg', {
                    chatId: rs.msg.jobId,
                    msg: {
                        role: 'client',
                        contentType: 'file',
                        content: '[文件]',
                        fileName: fileName,
                        fileUrl: fileUrl
                    }
                });
            } else if (rs.msg.contentType == '12') {
                // 临时文本
                if (rs.msg.message == '[none]') {
                    // [none]为预定的协议，表示清空预输入
                    context.dispatch('getChatEnByChatId', { chatId: rs.msg.jobId }).then(chatEn => {
                        for (var i = 0; i < chatEn.msgList.length; i++) {
                            var item = chatEn.msgList[i];
                            if (item.contentType == 'preInput') {
                                chatEn.msgList.splice(i, 1);
                                break;
                            }
                        }
                    });
                } else {
                    context.dispatch('addChatMsg', {
                        chatId: rs.msg.jobId,
                        msg: {
                            role: 'client',
                            contentType: 'preInput',
                            content: rs.msg.message
                        }
                    });
                }
            }
        },

        /**
         * im发送
         * @param {Object} payload object
         * @param {String} payload.chatId 需要修改的chatEn的id，根据此id匹配当前集合或历史集合
         * @param {Stirng} payload.contentType 内容类型；text：文本；image：图片
         * @param {Stirng} payload.content 需要发送的内容
         * @param {Stirng} payload.fileFieldName 上传文件时的input name
         * @param {Stirng} payload.fileData 上传文件时的文件数据
         * @param {Function} payload.successCallbcak 成功发送的回调
         */
        im_send: function(context, payload) {
            context.dispatch('getChatEnByChatId', { chatId: payload.chatId }).then(chatEn => {
                var value = payload.content;
                // 1.文本消息
                if (payload.contentType == 'text') {
                    ak.Http.post({
                        url: '/udesktop/im/msg/send.do',
                        params: {
                            agentId: window.agentId,
                            companyId: window.companyId,
                            clientId: chatEn.imInfo_fromNumber,
                            jobId: chatEn.chatId,
                            message: value
                        },
                        successCallback: function(res) {
                            console.log('imServerStore：-------- im_send_text ---------');
                            payload.successCallbcak && payload.successCallbcak();
                        }
                    });
                } else if (payload.contentType == 'image') {
                    // 2.图片消息
                    ak.Http.post({
                        url: '/udesktop/im/shot/send.do',
                        params: {
                            agentId: window.agentId,
                            companyId: window.companyId,
                            clientId: chatEn.imInfo_fromNumber,
                            jobId: chatEn.chatId,
                            message: value.replace(/^data:image\/(png|jpg);base64,/, '')
                        },
                        successCallback: function(res) {
                            console.log('imServerStore：-------- im_send_image ---------');
                            console.log(res);
                            var imgUrl = res.result.resultPath.begin;
                            var smallImgUrl = res.result.resultPath.end;
                            // TODO 替换域名前缀 http://120.55.88.191:10080
                            imgUrl = imgUrl.replace(/http:\/\/(.+?)\//g, stateStore.getters.accountInfo.ipcc_url + '/');
                            smallImgUrl = smallImgUrl.replace(/http:\/\/(.+?)\//g, stateStore.getters.accountInfo.ipcc_url + '/');
                            // end
                            context.dispatch('addChatMsg', {
                                chatId: chatEn.chatId,
                                msg: {
                                    role: 'server',
                                    contentType: 'image',
                                    content: '[图片]',
                                    imgUrl: imgUrl,
                                    smallImgUrl: smallImgUrl
                                }
                            });
                            payload.successCallbcak && payload.successCallbcak();
                        }
                    });
                } else if (payload.contentType == 'file') {
                    // 3.文件
                    var params = {
                        agentId: window.agentId,
                        companyId: window.companyId,
                        jobId: chatEn.chatId,
                        fromNumber: chatEn.imInfo_toNumber,
                        toNumber: chatEn.imInfo_fromNumber
                    };
                    var fileParams = {}; // 文件参数
                    fileParams[payload.fileFieldName] = payload.fileData;
                    ak.Http.uploadFile({
                        url: '/udesktop/im/file/send.do',
                        params: params,
                        fileParams: fileParams,
                        successCallback: function(res) {
                            var fileState = '';
                            var fileData = payload.fileData;
                            var fileUrl = '';
                            var fileName = payload.fileName;
                            if (res.resultCode == '0') {
                                // 获取当前的ChatEn的消息集合，变更状态为成功
                                fileState = 'success';
                                fileData = '';
                                fileUrl = res.result.resultPath;
                                // TODO 替换域名前缀 http://120.55.88.191:10080
                                fileUrl = fileUrl.replace(/http:\/\/(.+?)\//g, stateStore.getters.accountInfo.ipcc_url + '/');
                                // end
                            } else {
                                fileState = 'error';
                            }

                            for (var i = 0; i < chatEn.msgList.length; i++) {
                                var msgTmp = chatEn.msgList[i];
                                if (msgTmp.state == 'uploading' && msgTmp.fileName == fileName) {
                                    msgTmp.state = fileState;
                                    msgTmp.fileUrl = fileUrl;
                                    msgTmp.fileData = fileData;
                                }
                            }
                            payload.successCallbcak && payload.successCallbcak(res.result);
                        }
                    });
                }
            });
        },

        /**
         * 关闭会话
         * @param {String} payload.chatId 需要修改的chatEn的id，根据此id匹配当前集合或历史集合
         */
        im_close: function(context, payload) {
            context.dispatch('getChatEnByChatId', { chatId: payload.chatId }).then(chatEn => {
                ak.Http.post({
                    url: '/udesktop/ipcc/workRoundUp.do',
                    params: {
                        jobId: chatEn.chatId,
                        agentId: 'sip:' + window.agentId + '@u3c.com'
                    },
                    ignoreFail: true,
                    successCallback: function(res) {
                        var currentIndex = 0;
                        var nextIndex = 0;
                        var state = context.state;
                        var chatId = chatEn.chatId;
                        // 1.关闭当前会话，并移到【历史会话列表】里
                        for (var i = 0; i < state.currentChatEnlist.length; i++) {
                            var tmpEn = state.currentChatEnlist[i];
                            if (tmpEn.chatId == chatId) {
                                currentIndex = i;
                                context.dispatch('extendChatEn', {
                                    chatId: tmpEn.chatId,
                                    extends: {
                                        state: 'end'
                                    }
                                });
                                console.log(1);
                                state.currentChatEnlist.splice(i, 1);
                                state.historyChatEnlist.unshift(tmpEn);
                                break;
                            }
                        }

                        // 2.会切换到当前会话列表中所关闭会话的下一个会话，若下一个会话没有，就选中上一个会话
                        var nextChatEn = {};
                        if (currentIndex >= 0 && currentIndex < state.currentChatEnlist.length) {
                            // 1)选中下一个
                            nextChatEn = state.currentChatEnlist[currentIndex];
                        } else if (currentIndex > state.currentChatEnlist.length - 1) {
                            // 2)最后一个
                            currentIndex = state.currentChatEnlist.length - 1;
                            nextChatEn = state.currentChatEnlist[currentIndex];
                        }

                        // 3.选中
                        if (nextChatEn && nextChatEn.chatId) {
                            context.dispatch('selectChat', { chatId: nextChatEn.chatId });
                        }
                    }
                });
            });
        },

        /**
         * 根据jobId获取chat对象
         * @param {String} chatId 需要修改的chatEn的id，根据此id匹配当前集合或历史集合
         * @param {String} listName 指定的集合名称；e.g. currentChatEnlist、historyChatEnlist、allHistoryChatEnlist
         */
        getChatEnByChatId: function(context, { chatId, listName }) {
            var chatEn = null;

            if (listName) {
                // 1.指定了列表
                var targetList = context.state[listName];
                for (var i = 0; i < targetList.length; i++) {
                    var tmpEn = targetList[i];
                    if (tmpEn.chatId == chatId) {
                        chatEn = tmpEn;
                        break;
                    }
                }
            } else {
                // 2.未指定列表
                // 1)从当前会话列表查找
                for (var i = 0; i < context.state.currentChatEnlist.length; i++) {
                    var tmpEn = context.state.currentChatEnlist[i];
                    if (tmpEn.chatId == chatId) {
                        chatEn = tmpEn;
                        break;
                    }
                }

                // 2)从历史会话列表查找
                if (chatEn == null) {
                    for (var i = 0; i < context.state.historyChatEnlist.length; i++) {
                        var tmpEn = context.state.historyChatEnlist[i];
                        if (tmpEn.chatId == chatId) {
                            chatEn = tmpEn;
                            break;
                        }
                    }
                }

                // 3)显示全部历史界面时，直接从allHistoryChatEnlist列表获取
                if (chatEn == null) {
                    for (var i = 0; i < context.state.allHistoryChatEnlist.length; i++) {
                        var tmpEn = context.state.allHistoryChatEnlist[i];
                        if (tmpEn.chatId == chatId) {
                            chatEn = tmpEn;
                            break;
                        }
                    }
                }
            }

            return chatEn;
        },

        /**
         * 修改Chat对象的属性
         * @param {Object} payload 载荷对象
         * @param {Object} payload.chatId 需要修改的chatEn的id，根据此id匹配当前集合或历史集合
         * @param {Array} payload.extends Chat需要变更的属性对象数组
         */
        extendChatEn: function(context, payload) {
            return context.dispatch('getChatEnByChatId', { chatId: payload.chatId }).then(chatEn => {
                // 1.若没有，就附加到当前会话列表里
                if (chatEn == null) {
                    return;
                }

                // 2.extend属性
                for (var key in payload.extends) {
                    Vue.set(chatEn, key, payload.extends[key]);
                }

                // 3.若选中的当前chatEn 与 传入的一直，更新选中额chatEn
                if (context.state.selectedChatEn.chatId == chatEn.chatId) {
                    context.state.selectedChatEn = Object.assign({}, chatEn);
                    Vue.nextTick(function() {});
                }
                return chatEn;
            });
        },

        /**
         * 添加chat对象的msg
         * @param {String} chatId 会话Id
         * @param {Object} msg 消息对象；eg：{role:'sys',content:'含有新的消息'}
         * @param {String} msg.role 消息所有者身份；eg：'sys'系统消息；
         * @param {String} msg.contentType 消息类型；text:文本(默认)；image:图片
         * @param {String} msg.content 消息内容
         */
        addChatMsg: function(context, { chatId, msg }) {
            context.dispatch('getChatEnByChatId', { chatId: chatId }).then(chatEn => {
                if (chatEn == null) {
                    return;
                }

                // 1.设定默认值
                msg.createTime = msg.createTime == undefined ? new Date() : msg.createTime;
                msg.isNewMsg = msg.isNewMsg == undefined ? true : msg.isNewMsg;

                var msgList = chatEn.msgList ? chatEn.msgList : [];

                // 2.插入消息
                if (msg.isNewMsg) {
                    // 1)插入日期
                    // 实际场景中，在消息上方是否显示时间是由后台传递给前台的消息中附加上的，可参考 微信Web版
                    // 此处进行手动设置，5分钟之内的消息，只显示一次消息
                    msg.createTime = new Date(msg.createTime);
                    if (chatEn.lastMsgShowTime == null || msg.createTime.getTime() - chatEn.lastMsgShowTime.getTime() > 1000 * 60 * 5) {
                        msgList.push({
                            role: 'sys',
                            contentType: 'text',
                            content: ak.Utils.getDateTimeStr(msg.createTime, 'H:i')
                        });
                        chatEn.lastMsgShowTime = msg.createTime;
                    }

                    // 2)插入消息
                    msgList.push(msg);

                } else {
                    // TODO：这里不进行历史消息操作
                }

                // 3.设置chat对象相关属性
                chatEn.msgList = msgList;
                if (msg.isNewMsg) {
                    // 新消息时 更新最后一条记录和时间
                    chatEn.lastMsgTime = msg.createTime;
                    if (msg.role != 'sys') {
                        switch (msg.contentType) {
                            case 'text':
                                chatEn.lastMsgContent = msg.content;
                                break;
                            case 'image':
                                chatEn.lastMsgContent = '[图片]';
                                break;
                            case 'file':
                                chatEn.lastMsgContent = '[文件]';
                                break;
                            case 'sound':
                                chatEn.lastMsgContent = '[语音]';
                                break;
                        }
                    }
                }
                // 更新列表
                if (chatEn.chatId == context.state.selectedChatEn.chatId) {
                    chatEn.newMsgCount = 0;
                    context.state.selectedChatEn = Object.assign({}, chatEn);
                } else {
                    chatEn.newMsgCount++;
                }

                // 4.排序
                context.commit('sortCurrentChatEnlist', {});

                // 5.加入通知
                if (msg.isNewMsg && msg.role == 'client' && msg.contentType != 'preInput') {
                    context.dispatch('addNotificationChat', {
                        chatEn: chatEn,
                        oprType: 'msg'
                    });
                }

            });
        },

        /**
         * 选中会话
         * @param {String} chatId 选中会话Id
         */
        selectChat: function(context, { chatId }) {
            context.dispatch('getChatEnByChatId', { chatId: chatId }).then(chatEn => {
                var state = context.state;
                chatEn.newMsgCount = 0; // 设置新消息为0
                // 1.设置当前选中的会话
                context.state.selectedChatEn = Object.assign({}, chatEn);

                // 2.刷新当前会话集合
                for (var i = 0; i < state.currentChatEnlist.length; i++) {
                    var tmpEn = state.currentChatEnlist[i];
                    if (tmpEn.chatId == chatEn.chatId) {
                        state.currentChatEnlist[i] = state.selectedChatEn;
                        break;
                    }
                }

                context.commit('triggerChangeSelectIMDelegate');
                context.dispatch('refreshMenuOfMsgCount');
            });
        },

        /**
         * 刷新菜单上的消息总数
         */
        refreshMenuOfMsgCount: function(context, payload) {
            var allNewMsgCount = 0;
            context.state.currentChatEnlist.forEach(item => {
                if (Number.isInteger(item.newMsgCount)) {
                    allNewMsgCount += item.newMsgCount;
                }
            });
        },

        /**
         * 添加通知chat
         * @param {Object} chatEn 会话对象
         * @param {String} oprType 操作类型；eg：chat(添加会话)、msg(添加消息)
         */
        addNotificationChat: function(context, { chatEn, oprType }) {
            var state = context.state;
            // 当前的路由是否在im模块里，若不在im模块里，才显示通知
            if (window.polkVue.$route.name == 'im') {
                return;
            }

            // 1.判断当前通知集合里是否已存在次会话，若已存在去除此会话
            for (var i = 0; i < state.notificationChatEnlist.length; i++) {
                if (state.notificationChatEnlist[i].chatId == chatEn.chatId) {
                    state.notificationChatEnlist.splice(i, 1);
                    break;
                }
            }

            // 2.集合最多只能有5个
            if (state.notificationChatEnlist.length > 5) {
                state.notificationChatEnlist = state.notificationChatEnlist.splice(4);
            }

            // 3.转换后加入到当前通知集合里
            var tmpChatEn = {
                chatId: chatEn.chatId,
                sourceInfo_way: chatEn.sourceInfo_way,
                site: window.location.host
            };
            if (oprType == 'chat') {
                tmpChatEn.title = '新用户';
                tmpChatEn.content = '客户 ' + chatEn.userName + ' 接入新会话';
            } else if (oprType == 'msg') {
                tmpChatEn.title = '客户 ' + chatEn.userName + ' ' + chatEn.newMsgCount + '条新消息';
                tmpChatEn.content = chatEn.lastMsgContent;
            }

            // 4.内容大于25个截断
            if (tmpChatEn.content.length > 25) {
                tmpChatEn.content = tmpChatEn.content.substr(0, 24) + '...';
            }

            // 5.加入到集合里
            state.notificationChatEnlist.push(tmpChatEn);

            // 6.当通知数量大于5个时清除通知
            window.imServerStore_notificationList = window.imServerStore_notificationList || [];
            if (window.imServerStore_notificationList.length > 5) {
                window.imServerStore_notificationList.forEach((item, index) => {
                    item.close();
                });
                window.imServerStore_notificationList = [];
            }

            // 7.显示通知
            for (var i = 0; i < state.notificationChatEnlist.length; i++) {
                const item = state.notificationChatEnlist[i];
                // 1)已存在的通知列表是否包含此会话，若存在就关闭并移除
                for (var j = 0; j < window.imServerStore_notificationList.length; j++) {
                    if (window.imServerStore_notificationList[j].data == item.chatId) {
                        window.imServerStore_notificationList[j].close();
                        break;
                    }
                }

                // 2)创建新的通知
                const notification = new Notification(item.title, {
                    body: item.content,
                    data: item.chatId,
                    tag: Date.now(),
                    icon: ak.BLL.getPngFromWay(item.sourceInfo_way)
                });
                notification.onclick = function(e) {
                    window.focus();
                    window.polkVue.$router.push('im');
                    context.commit('clearNotificationChat');
                    context.dispatch('selectChat', { chatId: item.chatId });
                    notification.close();
                    imServerStore_notificationList = [];
                };

                notification.onclose = function(e) {
                    // remove en
                    for (var i = 0; i < state.notificationChatEnlist.length; i++) {
                        if (state.notificationChatEnlist[i].chatId == item.chatId) {
                            state.notificationChatEnlist.splice(i, 1);
                            break;
                        }
                    }
                    // remove notification
                    for (var i = 0; i < window.imServerStore_notificationList.length; i++) {
                        if (window.imServerStore_notificationList[i].tag == notification.tag) {
                            window.imServerStore_notificationList.splice(i, 1);
                            break;
                        }
                    }
                };

                setTimeout(function() {
                    notification && notification.close();
                }, 1000 * 10);

                window.imServerStore_notificationList.push(notification);
            }
        },

        /**
         * 会话是否在当前会话列表内
         * @param {String} chatId 选中会话Id
         */
        isChatInCurrentList: function(context, { chatId }) {
            var exists = false;
            for (var i = 0; i < context.state.currentChatEnlist.length; i++) {
                var tmpEn = context.state.currentChatEnlist[i];
                if (tmpEn.chatId == chatId) {
                    exists = true;
                    break;
                }
            }
            return exists;
        }
    },
    getters: {
        /**
         * 获取选中的会话对象
         */
        selectedChatEn: function(state) {
            return state.selectedChatEn;
        },

        /**
         * 当前会话集合
         */
        currentChatEnlist: function(state) {
            return state.currentChatEnlist;
        },

        /**
         * 是否更改选中im
         */
        changeSelectIMDelegate: function(state) {
            return state.changeSelectIMDelegate;
        },

        /**
         * 客服chat信息
         */
        serverChatInfo: function(state) {
            return state.serverChatInfo
        }
    }
});