<!-- 会话记录 -->
<template>
    <div class="imRecord-wrapper">
        <main class="main">
            <div v-if="storeCurrentChatEnlist.length>0" class="item-list">
                <div class="item" v-for="(tmpEn, index) in storeCurrentChatEnlist" :key="index" @click="selectChat(tmpEn)" v-bind:class="{ active: tmpEn.imInfo_jobId==storeChatEn.imInfo_jobId}">
                    <div class="followicon-wrapper">
                        <i class="iconfont icon-zhidingwujiaoxing" :class="{ active: tmpEn.isFollow}" @click.stop="toggleFollowIcon(tmpEn)"></i>
                    </div>
                    <div class="platicon-wrapper">
                        <i class="iconfont" :class="getIconFromWay(tmpEn.sourceInfo_way)"></i>
                    </div>
                    <div class="info-wrapper">
                        <p class="first-p">
                            <span class="name">{{tmpEn.userName}}</span>
                            <span class="lastMsgTime">{{tmpEn.lastMsgTime}}</span>
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
        storeChatEn() {
            return this.$store.imStore.getters.selectedChatEn;
        },
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
            this.$store.imStore.dispatch('selectChat', { imInfo_jobId: en.imInfo_jobId });
        },

        /**
         * 设置关注
         */
        toggleFollowIcon: function(en) {
            en.isFollow = !en.isFollow;
            // 排序
            this.$store.imStore.commit('sortCurrentChatEnlist', {});
        }
    }
};
</script>

<style lang="less">
.imRecord-wrapper {
    width: 100%;
    height: 550px;
    overflow: auto;
    border: 0px;
    .main {
        height: 100%;
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
                    background-color: #f5f8f8;
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
                        color: #7e8c8d;
                        &.active {
                            color: #f9ce1d;
                            display: initial;
                        }
                    }
                }
                .platicon-wrapper {
                    float: left;
                    padding: 24px 8px 0px 10px;
                    position: relative;
                    .iconfont {
                        border-width: 0px;
                        border-radius: 50%;
                        padding: 7px;
                        color: white;
                        font-size: 16px;
                    }
                }
                .info-wrapper {
                    float: left;
                    width: 190px;
                    position: relative;
                    padding-left: 5px;
                    .first-p {
                        clear: both;
                        padding-top: 11px;
                        .name {
                            color: #3e3e3e;
                            width: 50%;
                            display: inline-block;
                            white-space: nowrap;
                            text-overflow: ellipsis;
                            overflow: hidden;
                            font-size: 13px;
                        }
                        .lastMsgTime {
                            float: right;
                            color: #8d8d8d;
                            font-size: 12px;
                            margin-right: 15px;
                        }
                    }
                    .second-p {
                        clear: both;
                        padding-top: 5px;
                        .lastMsgContent {
                            color: #8d8d8d;
                            width: 150px;
                            display: inline-block;
                            white-space: nowrap;
                            text-overflow: ellipsis;
                            overflow: hidden;
                            font-size: 12px;
                            height: 15px;
                        }
                        .newMsgCount {
                            float: right;
                            margin-right: 5px;
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
</style>
