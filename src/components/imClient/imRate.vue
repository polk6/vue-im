<!-- 评价 -->
<template>
    <div class="imRate-wrapper">
        <div v-show="!resultVisible" class="main">
            <p class="title">
                感谢你的咨询，请对我们的服务进行评价
            </p>
            <el-row>
                <el-rate v-model="dataForm.selectedItem" show-text :texts="['非常不满意', '不满意', '一般', '满意', '非常满意']">
                </el-rate>
            </el-row>
            <el-row>
                <el-input type="textarea" :maxlength="50" :rows="4" resize="none" placeholder="备注(选填，50字符以内)" v-model="dataForm.remark"></el-input>
            </el-row>
            <el-button type="primary" class="submit-btn position-h-mid" @click="submit" :disabled="dataForm.selectedItem==''">确定</el-button>
        </div>
        <!-- 评价后的界面 -->
        <div v-show="resultVisible" class="submit-main">
            <i class="iconfont icon-tijiaochenggong"></i>
            <p class="title">评价提交成功</p>
            <p class="sub-title">
                <el-button type="text" @click="createNewChat">发起新的会话</el-button>
            </p>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        chatInfoEn: {
            required: true,
            type: Object
        }
    },
    data() {
        return {
            resultVisible: false, // 满意度已提交
            dataForm: {
                selectedItem: '', // 选中的item
                remark: ''
            }
        };
    },
    computed: {},
    watch: {},
    methods: {
        /**
         * init
         */
        init: function() {
            this.$data.resultVisible = false;
            this.$data.dataForm.selectedItem = '';
            this.$data.dataForm.remark = '';
        },

        /**
         * 提交
         */
        submit: function() {
            this.$data.resultVisible = true;
            // TODO 提交
        },

        /**
         * 发起新的会话
         */
        createNewChat: function() {
            this.regclientChatEn();
        }
    }
};
</script>

<style lang="less">
.imRate-wrapper {
    & > .main {
        overflow: hidden;
        .title {
            text-align: center;
            font-size: 14px;
            color: #000000;
            margin-top: 15px;
        }
        textarea {
            width: 95%;
            margin: 20px auto 0px;
        }
        .submit-btn {
            width: 100px;
            margin-top: 18px;
        }
    }
    & > .submit-main {
        .iconfont {
            display: table;
            margin: 85px auto 0px;
            color: #6bcc00;
            font-size: 50px;
        }
        .title {
            margin-top: 30px;
            font-size: 20px;
            text-align: center;
            color: #000000;
        }
        .sub-title {
            margin-top: 15px;
            font-size: 14px;
            color: #454545;
            text-align: center;
        }
    }
}
</style>
