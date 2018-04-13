<!-- im服务端入口 -->
<template>
    <div class="imServerIndex-wrapper">
        <div class="imServerIndex-main">
            <im-record class="item im-record" @selectedChat="selectedChat()"></im-record>
            <im-chat v-if="storeSelectedChatEn!=null" ref="im_chat" class="item im-chat" :socket="socket"></im-chat>
        </div>
    </div>
</template>

<script >
import imRecord from './imRecord.vue';
import imChat from './imChat.vue';

export default {
    components: {
        imRecord: imRecord,
        imChat: imChat
    },
    data() {
        return {
            socket: null
        };
    },
    computed: {
        storeSelectedChatEn() {
            return this.$store.imServerStore.getters.selectedChatEn;
        },
        stroeServerChatInfo() {
            return this.$store.imServerStore.getters.serverChatInfo;
        }
    },
    watch: {},
    methods: {
        /**
         * 选中了会话
         */
        selectedChat: function() {},

        /**
         * 注册socket
         */
        regSocket: function() {
            var self = this;
            self.$data.socket = require('engine.io-client')('http://localhost:3001');
            self.$data.socket.on('open', function() {
                var serverChatInfo = self.$store.imServerStore.getters.serverChatInfo;
                // 注册
                self.$data.socket.send(
                    JSON.stringify({
                        type: 'serverOn',
                        data: {
                            serverChatId: serverChatInfo.serverChatId,
                            serverChatName: serverChatInfo.serverChatName
                        }
                    })
                );

                // 【接收消息】
                self.$data.socket.on('message', function(message) {
                    message = JSON.parse(message);
                    if (message.type == 'clientOn') {
                        // 1.客户端新上线
                        // 1)增加客户列表
                        self.$store.imServerStore.commit('addChat', {
                            chatEn: {
                                chatId: message.data.clientChatId,
                                chatName: message.data.clientChatName
                            }
                        });
                        self.$store.imServerStore.dispatch('addChatMsg', {
                            chatId: message.data.clientChatId,
                            msg: {
                                role: 'sys',
                                contentType: 'text',
                                content: '新客户接入'
                            }
                        });
                    } else if (message.type == 'clientSendMsg') {
                        // 2.客户端发送了信息
                        console.log(message.data);
                        self.$store.imServerStore.dispatch('addChatMsg', {
                            chatId: message.data.clientChatId,
                            msg: message.data.msg,
                            successCallback: function() {
                                self.$refs.im_chat.goEnd();
                            }
                        });
                    }
                });
            });
        }
    },
    mounted() {
        this.regSocket();
    }
};
</script>

<style lang="less">
@import '../../common/css/base.less';

.imServerIndex-wrapper {
    #common-wrapper();
}

.imServerIndex-wrapper {
    width: 100%;
    height: 100%;
    position: absolute;
    overflow: hidden;
    .imServerIndex-main {
        height: 100%;
        max-width: 100%;
        position: relative;
        & > .item {
            float: left;
            border-right: 1px solid #e6e6e6;
            height: 100%;
        }
        & > .im-record {
            width: 280px;
        }
        & > .im-chat {
            width: calc(~'99% - 280px');
        }
    }
}
</style>
