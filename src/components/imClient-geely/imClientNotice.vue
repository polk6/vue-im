<!-- 公告区域 -->
<template>
    <div class="imClientNotice-wrapper">
        123
    </div>
</template>

<script>
export default {
    components: {},
    data() {
        return {};
    },
    computed: {},
    watch: {},
    methods: {},
    mounted() {}
};
</script>
<style lang="less">
.imClientNotice-wrapper {
    .imClientNotice-header {
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
    .imClientNotice-main {
        height: calc(~'100% - 50px');
    }
}
</style>

