<!-- 会话记录 -->
<template>
    <div class="imRecord-wrapper">
        <header class="header">
            <p>
                <span class="">客服姓名：</span>
            </p>
        </header>
        <main class="main">
            <div v-if="storeCurrentChatEnlist.length>0" class="item-list">
                <div class="item" v-for="(tmpEn, index) in storeCurrentChatEnlist" :key="index" @click="selectChat(tmpEn)" v-bind:class="{ active: selectedChatEn!=null && tmpEn.chatId==selectedChatEn.chatId}">
                    <div class="followicon-wrapper">
                        <i class="iconfont icon-zhidingwujiaoxing" :class="{ active: tmpEn.isFollow}" @click.stop="toggleFollowIcon(tmpEn)"></i>
                    </div>
                    <div class="platicon-wrapper">
                        <div class="header-img" :class="getBgClass(tmpEn.userName)">{{tmpEn.userName.substr(0,1)}}</div>
                    </div>
                    <div class="info-wrapper">
                        <p class="first-p">
                            <span class="name">{{tmpEn.userName}}</span>
                            <span class="lastMsgTime">{{getDateTimeStr(tmpEn.lastMsgTime,'H:i:s')}}</span>
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
            return this.$store.imStore.getters.selectedChatEn;
        },
        // 当前会话列表
        storeCurrentChatEnlist() {
            return this.$store.imStore.getters.currentChatEnlist;
        }
    },
    watch: {},
    methods: {
        /**
         * 选中当前列表的chat
         * @param {Object} en call实体类
         */
        selectChat: function(en) {
            this.$store.imStore.dispatch('selectChat', { chatId: en.chatId });
            this.$emit('selectedChat', {}); // 事件上传
        },

        /**
         * 设置关注
         */
        toggleFollowIcon: function(en) {
            en.isFollow = !en.isFollow;
            // 排序
            this.$store.imStore.commit('sortCurrentChatEnlist', {});
        },

        /**
         * 获取背景class
         * @param {string} userName 姓名
         */
        getBgClass: function(userName) {
            var rs = userName.charCodeAt(0) % 5;
            return 'bg' + rs;
        },

        /**
         * 对传入的时间值进行格式化。后台传入前台的时间有两种个是：Sql时间和.Net时间
         * @param {String|Date} sValue 传入的时间字符串
         * @param {dateFormat | bool} dateFormat  日期格式，日期格式：eg：'Y-m-d H:i:s'
         * @return {String} 2014-03-01 这种格式
         * @example
         * 1) Sql时间格式：2015-02-24T00:00:00
         * 2) .Net时间格式：/Date(1410744626000)/
         */
        getDateTimeStr: function(sValue, dateFormat) {
            if (dateFormat == undefined) {
                dateFormat = 'Y-m-d'; // 默认显示年月日
            }

            var dt;
            // 1.先解析传入的时间对象，
            if (sValue) {
                if (toString.call(sValue) !== '[object Date]') {
                    // 不为Date格式，就转换为DateTime类型
                    sValue = sValue + '';
                    if (sValue.indexOf('T') > 0) {
                        // 1)格式：2015-02-24T00:00:00
                        var timestr = sValue.replace('T', ' ').replace(/-/g, '/'); //=> 2015/02/24 00:00:00
                        dt = new Date(timestr);
                    } else if (sValue.indexOf('Date') >= 0) {
                        // 2).Net格式：/Date(1410744626000)/
                        //Convert date type that .NET can bind to DateTime
                        //var date = new Date(parseInt(sValue.substr(6)));
                        var timestr = sValue.toString().replace(/\/Date\((\d+)\)\//gi, '$1'); //
                        dt = new Date(Math.abs(timestr));
                    } else {
                        dt = new Date(sValue);
                    }
                } else {
                    dt = sValue;
                }
            }

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
    }
    & > .main {
        height: calc(~'100% - 50px');
        position: relative;
        .item-list {
            height: calc(~'100% - 46px');
            overflow-y: auto;
            .item {
                height: 63px;
                cursor: pointer;
                border-bottom: 1px solid #e6e6e6;
                padding: 0px;
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
                    float: left;
                    padding: 24px 0px;
                    padding-left: 10px;
                    min-width: 12px;
                    .iconfont {
                        font-size: 12px;
                        display: none;
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
                    margin: 13px 5px;
                    .header-img {
                        color: #fff;
                        padding: 10px;
                        border-radius: 50%;
                        font-size: 16px;
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
