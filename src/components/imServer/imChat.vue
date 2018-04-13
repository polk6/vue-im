<!-- 聊天记录 -->
<template>
    <div class="imChat-wrapper">
        <!-- 头部 -->
        <header class="imChat-header">
            <div class="inner-wrapper">
                <span class="name">{{storeSelectedChatEn.chatName}}</span>
            </div>
            <div class="opr-wrapper" v-show="storeSelectedChatEn.state=='on'">
                <el-button type="text" @click="close()">结束会话</el-button>
            </div>
        </header>
        <main class="imChat-main">
            <!-- 聊天框区域 -->
            <common-chat ref="common_chat" :chatEn="storeSelectedChatEn" @sendMsg="sendMsg"></common-chat>
        </main>
    </div>
</template>

<script>
import commonChat from '@/components/common/common_chat.vue';

export default {
    components: {
        commonChat: commonChat
    },
    props: {
        socket: {
            required: true,
            type: Object
        }
    },
    data() {
        return {};
    },
    computed: {
        storeSelectedChatEn() {
            return this.$store.imServerStore.getters.selectedChatEn;
        }
    },
    watch: {},
    methods: {
        /**
         * 结束
         */
        close: function() {
            // 发送关闭请求
            this.$store.imServerStore.dispatch('im_close', {
                chatId: this.storeSelectedChatEn.chatId
            });
        },

        /**
         * 发送消息
         * @param {Object} rs 回调对象
         */
        sendMsg: function(rs) {
            var msg = rs.msg;
            msg.role = 'server';
            // 1.socket发送消息
            this.socket.send(
                JSON.stringify({
                    type: 'serverSendMsg',
                    data: {
                        clientChatId: this.storeSelectedChatEn.chatId,
                        msg: msg
                    }
                })
            );

            // 2.附加到此chat对象的msg集合里
            this.$store.imServerStore.dispatch('addChatMsg', {
                chatId: this.storeSelectedChatEn.chatId,
                msg: msg,
                successCallback: function() {
                    rs.successCallbcak && rs.successCallbcak();
                }
            });
        },

        goEnd: function() {
            this.$refs.common_chat.goEnd();
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

