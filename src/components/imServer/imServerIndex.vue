<!-- im入口 -->
<template>
    <div class="imServerIndex-wrapper">
        <div class="imServerIndex-main">
            <im-record class="item im-record"></im-record>
            <im-chat class="item im-chat"></im-chat>
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
    computed: {},
    watch: {
        /**
         * 重新选中了im
         */
        storeChangeSelectIMDelegate: function(value) {
            this.selectedChatEn();
        }
    },
    methods: {
        /**
         * 选中了会话
         */
        selectedChatEn: function() {}
    },
    mounted() {}
};
</script>

<style lang="less">
.imServerIndex-wrapper {
    position: initial;
    float: left;
    height: calc(~'100% - 50px');
    width: 100%;
    min-width: 1100px;
    overflow-x: hidden;
    overflow-y: auto;
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
            width: calc(~'99% - 280px - 330px'); // min-width: 600px;
        }
    }
}
</style>
