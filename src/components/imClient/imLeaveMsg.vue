<!-- 留言 -->
<template>
    <div class="imLeaveMsg-wrapper">
        <main class="main">
            <p class="title">当前人工客服不在线，如需帮助请留言</p>
            <el-form class="leaveMsg-main-form" ref="im_leaveMsgDialog_form" :model="im_leaveMsgDialog_form" :rules="im_leaveMsgDialog_rules" label-position="top">
                <el-form-item prop="phone">
                    <el-input v-model="im_leaveMsgDialog_form.phone" placeholder="手机(必填)"></el-input>
                </el-form-item>
                <el-form-item prop="email">
                    <el-input v-model="im_leaveMsgDialog_form.email" placeholder="邮箱(必填)"></el-input>
                </el-form-item>
                <el-form-item prop="content">
                    <el-input type="textarea" v-model="im_leaveMsgDialog_form.content" :rows="5" placeholder="请输入2-100字符"></el-input>
                </el-form-item>
                <el-form-item class="text-center">
                    <el-button type="primary" class="submit-btn" @click="leaveMsgDialog_submit" :disabled="im_leaveMsgDialog_form.phone.length==0 || im_leaveMsgDialog_form.email.length==0">提 交</el-button>
                </el-form-item>
            </el-form>
        </main>
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
        return {};
    },
    computed: {},
    watch: {},
    methods: {}
};
</script>

<style lang="less">
.imLeaveMsg-wrapper {
    .leaveMsg-main {
        overflow: hidden;
        .title {
            margin-top: 15px;
            margin-bottom: 10px;
            text-align: center;
            font-size: 14px;
            color: #000000;
        }
        .leaveMsg-main-form {
            margin-bottom: 10px;
            .submit-btn {
                width: 100px;
                margin-bottom: 15px;
            }
        }
    }
}
</style>
