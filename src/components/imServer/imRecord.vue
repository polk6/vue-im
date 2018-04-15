<!-- 会话记录 -->
<template>
    <div class="imRecord-wrapper">
        <header class="header">
            <div class="kf-info-wrapper">
                <img class="kf-avatar" :src="storeServerChatEn.avatarUrl" />
                <span class="kf-name position-h-v-mid">{{storeServerChatEn.serverChatName}}</span>
            </div>
        </header>
        <main class="main">
            <div v-if="storeCurrentChatEnlist.length>0" class="item-list">
                <div class="item" v-for="(tmpEn, index) in storeCurrentChatEnlist" :key="index" @click="selectChat(tmpEn)" v-bind:class="{ active: selectedChatEn!=null && tmpEn.chatId==selectedChatEn.chatId}">
                    <div class="followicon-wrapper">
                        <i class="iconfont icon-zhidingwujiaoxing position-h-v-mid" :class="{ active: tmpEn.isFollow}" @click.stop="toggleFollowIcon(tmpEn)"></i>
                    </div>
                    <div class="platicon-wrapper">
                        <div class="header-img position-h-v-mid" :class="getBgClass(tmpEn.chatName)">{{tmpEn.chatName.substr(0,1)}}</div>
                    </div>
                    <div class="info-wrapper">
                        <p class="first-p">
                            <span class="name">{{tmpEn.chatName}}</span>
                            <span class="lastMsgTime">{{getLastMsgTimeStr(tmpEn.lastMsgTime)}}</span>
                        </p>
                        <p class="second-p">
                            <span class="lastMsgContent" v-html="tmpEn.lastMsgContent"></span>
                            <el-badge class="newMsgCount" :value="tmpEn.newMsgCount" :max="99" v-show="tmpEn.newMsgCount>0"></el-badge>
                        </p>
                    </div>
                </div>
            </div>
            <div v-else-if="storeCurrentChatEnlist.length==0" class="empty-wrapper">
                <div class="content">
                    <i class="iconfont icon-chat empty-img"></i>
                    <p class="title">当前没有会话</p>
                </div>
            </div>
        </main>
    </div>
</template>

<script>
export default {
    data() {
        return {};
    },
    computed: {
        selectedChatEn() {
            return this.$store.imServerStore.getters.selectedChatEn;
        },
        // 当前会话列表
        storeCurrentChatEnlist() {
            return this.$store.imServerStore.getters.currentChatEnlist;
        },
        storeServerChatEn() {
            return this.$store.imServerStore.getters.serverChatEn;
        }
    },
    watch: {},
    methods: {
        /**
         * 选中当前列表的chat
         * @param {Object} en call实体类
         */
        selectChat: function(en) {
            this.$store.imServerStore.dispatch('selectChat', { chatId: en.chatId });
            this.$emit('selectedChat', {}); // 事件上传
        },

        /**
         * 设置关注
         */
        toggleFollowIcon: function(en) {
            en.isFollow = !en.isFollow;
            // 排序
            this.$store.imServerStore.commit('sortCurrentChatEnlist', {});
        },

        /**
         * 获取背景class
         * @param {string} chatName 姓名
         */
        getBgClass: function(chatName) {
            var rs = chatName.charCodeAt(0) % 5;
            return 'bg' + rs;
        },

        /**
         * 返回chat对象的最后一次消息时间
         * @param {String|Date} sValue 传入的时间字符串
         */
        getLastMsgTimeStr: function(sValue) {
            if (sValue == null) {
                return '';
            }
            var rs = this.$ak.Utils.getDateTimeStr(sValue, 'H:i:s');
            return rs;
        }
    }
};
</script>

<style lang="less">
.imRecord-wrapper {
    width: 100%;
    height: 550px;
    overflow: hidden;
    border: 0px;
    & > .header {
        height: 50px;
        .kf-info-wrapper {
            position: relative;
            width: 150px;
            height: 50px;
            padding: 0 20px;
            .kf-avatar {
                width: 50px;
                height: 50px;
            }
            .kf-name{
                font-size: 16px;
            }
        }
    }
    & > .main {
        height: calc(~'100% - 50px');
        position: relative;
        .item-list {
            height: calc(~'100% - 46px');
            overflow-y: auto;
            .item {
                position: relative;
                height: 63px;
                padding: 0px;
                border-bottom: 1px solid #e6e6e6;
                cursor: pointer;
                &.active,
                &:hover {
                    background-color: #0095ff;
                    .info-wrapper .first-p .name,
                    .info-wrapper .second-p .lastMsgContent,
                    .info-wrapper .first-p .lastMsgTime {
                        color: #eaf4fb;
                    }
                    .iconfont {
                        display: initial !important;
                    }
                }
                .followicon-wrapper {
                    position: relative;
                    float: left;
                    width: 30px;
                    height: 100%;
                    .iconfont {
                        display: none;
                        font-size: 12px;
                        color: #eaf4fb;
                        &.active {
                            color: #f9ce1d;
                            display: initial;
                        }
                    }
                }
                .platicon-wrapper {
                    float: left;
                    position: relative;
                    width: 50px;
                    height: 100%;
                    .header-img {
                        padding: 10px;
                        color: #fff;
                        font-size: 16px;
                        border-radius: 50%;
                        &.bg0 {
                            background-color: #ef7777;
                        }
                        &.bg1 {
                            background-color: #00bcd4;
                        }
                        &.bg2 {
                            background-color: #009688;
                        }
                        &.bg3 {
                            background-color: #ffc107;
                        }
                        &.bg4 {
                            background-color: #ff5722;
                        }
                    }
                }
                .info-wrapper {
                    float: left;
                    width: 190px;
                    position: relative;
                    padding-left: 5px;
                    padding-top: 5px;
                    .first-p {
                        clear: both;
                        padding-top: 11px;
                        .name {
                            width: 50%;
                            color: #3e3e3e;
                            display: inline-block;
                            white-space: nowrap;
                            text-overflow: ellipsis;
                            overflow: hidden;
                            font-size: 14px;
                            float: left;
                            text-align: left;
                            font-weight: bolder;
                        }
                        .lastMsgTime {
                            float: right;
                            color: #8d8d8d;
                            font-size: 12px;
                        }
                    }
                    .second-p {
                        clear: both;
                        padding-top: 5px;
                        line-height: 1.2;
                        .lastMsgContent {
                            width: 150px;
                            color: #8d8d8d;
                            display: inline-block;
                            white-space: nowrap;
                            text-overflow: ellipsis;
                            overflow: hidden;
                            font-size: 12px;
                            float: left;
                            text-align: left;
                            margin-top: 3px;
                        }
                        .newMsgCount {
                            float: right;
                            .el-badge__content {
                                border: 1px solid #ffffff00;
                            }
                        }
                    }
                }
            }
        }
        .empty-wrapper {
            font-size: 16px;
            color: #3e3e3e;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            .content {
                width: 170px;
                height: 200px;
                margin: 0px auto;
                text-align: center;
                color: #867c7c;
                .iconfont {
                    font-size: 90px;
                }
                .title {
                    margin-top: 5px;
                }
            }
        }
    }
}
</style>
