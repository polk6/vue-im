<!-- 聊天记录 -->
<template>
    <div class="imChat-wrapper">
        <!-- 头部 -->
        <header class="imChat-header">
            <div class="inner-wrapper">
                <span class="name">{{storeSelectedChatEn.userName}}</span>
            </div>
            <div class="opr-wrapper" v-show="storeSelectedChatEn.state=='on'">
                <el-button type="text" @click="close()">结束会话</el-button>
            </div>
        </header>
        <main class="imChat-main">
            <common-chat class="" :chatEn="chatEn"></common-chat>
        </main>
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
            chatEn: ''
        };
    },
    computed: {
        storeSelectedChatEn() {
            return this.$store.imStore.getters.selectedChatEn;
        }
    },
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
        },

        /**
         * 结束
         */
        close: function() {
            // 发送关闭请求
            this.$store.imStore.dispatch('im_close', {
                chatId: this.$data.chatEn.chatId
            });
        }
    },
    mounted() {}
};
</script>
<style lang="less">
.imChat-wrapper {
    .imChat-header {
        width: 100%;
        height: 50px;
        border-bottom: 1px solid #e6e6e6;
        font-size: 12px !important;
        color: #3e3e3e;
        .inner-wrapper {
            width: 35%;
            padding-left: 13px;
            float: left;
            text-align: left;
        }
        .opr-wrapper {
            width: 35%;
            float: right;
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
    .imChat-main {
        height: calc(~'100% - 50px');
    }
}
</style>

