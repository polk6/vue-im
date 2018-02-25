<!-- im入口 -->
<template>
    <div class="imServerIndex-wrapper">
        <div class="imServerIndex-main">
            <im-record class="item im-record" @selectedChat="selectedChat()"></im-record>
            <im-chat v-if="storeSelectedChatEn!=null" class="item im-chat"></im-chat>
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
        return {};
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

        regSocket: function() {
            var serverChatInfo = this.$store.imServerStore.getters.serverChatInfo;
            var socket = require('engine.io-client')('http://localhost:3001');
            socket.on('open', function() {
                console.log('connected');
                socket.send('nihao');
                // 注册
                socket.emit('serverOn', {
                    serverChatId: serverChatInfo.serverChatId,
                    serverChatName: serverChatInfo.serverChatName
                });

                // 接收client消息
                socket.on('receiveClientMsg', function(data) {
                    console.log(data);
                });
            });
        }
    },
    mounted() {
        console.log(1);
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
