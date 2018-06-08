<!-- 转接 -->
<template>
    <div class="imTransfer-wrapper">
        <main class="main">
            <el-radio-group v-model="selectedItem" class="item-group">
                <div class="item" v-for="(item, index) in kfList" :key="index">
                    <el-radio-button :label="item.queueId">{{item.queueName}}</el-radio-button>
                </div>
            </el-radio-group>
        </main>
        <footer class="footer">
            <el-button type="primary" :disabled="selectedItem.length==0" @click="submit">开始咨询</el-button>
        </footer>
    </div>
</template>

<script>
export default {
    data() {
        return {
            kfList: [], // 转人工队列集合
            selectedItem: '' // 选中的item对象
        };
    },
    computed: {},
    watch: {},
    methods: {
        /**
         * init
         */
        init: function() {
            this.$nextTick(() => {
                this.$data.kfList = [{ queueId: '1', queueName: '咨询' }, { queueId: '2', queueName: '反馈' }];
                this.$data.selectedItem = [];
            });
        },

        /**
         * 队列dialog_提交
         */
        submit: function() {
            this.$emit('submit', {
                msg: this.$data.selectedItem
            });
        }
    },
    mounted() {}
};
</script>

<style lang="less">
.imTransfer-wrapper {
}
</style>
