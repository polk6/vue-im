<!-- qq表情 -->
<template>
    <div class="common_chat_emoji-wrapper common_chat_emoji-wrapper-global">
        <a href="javascript:void(0)" @click="toggleFaceHidden">
            <i class="iconfont icon-IMbiaoqing float-left"></i>
        </a>
        <div class="list-wrapper" v-show="!faceHidden">
            <div class="list-inner" @click="selectFace">
                <a v-for="(item, index)  in qqfaceList" :key="index" class="item qqface" :title="item" :text="[item]" :class="'qqface'+index"></a>
            </div>
        </div>
        <input type="text" id="imLog_qqface_txt" @blur="hideFaceWrapper" style="width:0px;height:0px;border: 0px;" />
    </div>
</template>

<script>
export default {
    data() {
        return {
            qqfaceList: ['微笑', '撇嘴', '色', '发呆', '得意', '流泪', '害羞', '闭嘴', '睡', '大哭', '尴尬', '发怒', '调皮', '呲牙', '惊讶', '难过', '酷', '冷汗', '抓狂', '吐', '偷笑', '愉快', '白眼', '傲慢', '饥饿', '困', '惊恐', '流汗', '憨笑', '悠闲', '奋斗', '咒骂', '疑问', '嘘', '晕', '疯了', '衰', '骷髅', '敲打', '再见', '擦汗', '抠鼻', '鼓掌', '糗大了', '坏笑', '左哼哼', '右哼哼', '哈欠', '鄙视', '委屈', '快哭了', '阴险', '亲亲', '吓', '可怜', '菜刀', '西瓜', '啤酒', '篮球', '乒乓', '咖啡', '饭', '猪头', '玫瑰', '凋谢', '嘴唇', '爱心', '心碎', '蛋糕', '闪电', '炸弹', '刀', '足球', '瓢虫', '便便', '月亮', '太阳', '礼物', '拥抱', '强', '弱', '握手', '胜利', '抱拳', '勾引', '拳头', '差劲', '爱你', 'NO', 'OK', '爱情', '飞吻', '跳跳', '发抖', '怄火', '转圈', '磕头', '回头', '跳绳', '投降', '激动', '乱舞', '献吻', '左太极', '右太极'],
            faceHidden: true
        };
    },
    methods: {
        /**
         * 切换表情界面的显示
         */
        toggleFaceHidden: function() {
            this.$data.faceHidden = !this.$data.faceHidden;
            if (!this.$data.faceHidden) {
                document.getElementById('imLog_qqface_txt').focus();
            }
        },

        /**
         * 关闭表情窗口
         */
        hideFaceWrapper: function() {
            var self = this;
            // 选中face也会隐藏表情窗口，这时判断是否已经隐藏了
            setTimeout(function() {
                if (!self.$data.faceHidden) {
                    self.$data.faceHidden = true;
                }
            }, 200);
        },

        /**
         * 选中face
         */
        selectFace: function(e) {
            var faceName = e.target.getAttribute('text');
            if (!faceName) {
                return;
            }
            var imgStr = this.getImgByFaceName(faceName);
            this.$emit('select', {
                faceName: faceName,
                imgStr: imgStr
            }); // 事件上传

            // 关闭窗口
            this.$data.faceHidden = true;
        },
        /**
         * 根据face名称返回一个img图片
         * @param {String} faceName face名称
         */
        getImgByFaceName: function(faceName) {
            var imgStr = '<img class="qqface small qqface@faceIndex" text="@faceName" src="/static/image/im_emoji_spacer.gif"/>';
            var faceIndex = 0;
            for (var i = 0; i < this.$data.qqfaceList.length; i++) {
                if (this.$data.qqfaceList[i] == faceName) {
                    faceIndex = i;
                    break;
                }
            }
            imgStr = imgStr.replace(/@faceIndex/g, faceIndex).replace(/@faceName/g, faceName);
            return imgStr;
        }
    },
    mounted() {}
};
</script>

<style lang="less">
.common_chat_emoji-wrapper {
    .iconfont {
        color: #aaa;
        font-size: 20px;
    }
    .list-wrapper {
        height: 210px;
        width: 440px;
        background-color: #fff;
        border: 1px solid #e6e6e6;
        padding: 10px;
        position: absolute;
        top: -240px;
        left: 1px;
        .list-inner {
            width: 100%;
            height: 100%;
            overflow: hidden;
            .item {
                float: left;
                border-bottom: 1px solid #e6e6e6;
                border-right: 1px solid #e6e6e6;
                cursor: pointer;
            }
        }
    }
}

.common_chat_emoji-wrapper-global {
    .qqface {
        width: 28px;
        height: 28px;
        font-size: 0;
        text-indent: -999em;
        background: url('../../assets/qqEmoji.png') 0 0 no-repeat;
    }

    .qqface.small {
        vertical-align: middle;
        height: 24px !important;
        width: 24px;
        transform: scale(0.82);
        margin-top: -5px;
        margin-left: -3px;
    }

    .qqface.qqface0 {
        background-position: 0 0;
    }

    .qqface.qqface1 {
        background-position: -29px 0;
    }

    .qqface.qqface2 {
        background-position: -58px 0;
    }

    .qqface.qqface3 {
        background-position: -87px 0;
    }

    .qqface.qqface4 {
        background-position: -116px 0;
    }

    .qqface.qqface5 {
        background-position: -145px 0;
    }

    .qqface.qqface6 {
        background-position: -174px 0;
    }

    .qqface.qqface7 {
        background-position: -203px 0;
    }

    .qqface.qqface8 {
        background-position: -232px 0;
    }

    .qqface.qqface9 {
        background-position: -261px 0;
    }

    .qqface.qqface10 {
        background-position: -290px 0;
    }

    .qqface.qqface11 {
        background-position: -319px 0;
    }

    .qqface.qqface12 {
        background-position: -348px 0;
    }

    .qqface.qqface13 {
        background-position: -377px 0;
    }

    .qqface.qqface14 {
        background-position: -406px 0;
    }

    .qqface.qqface15 {
        background-position: 0 -29px;
    }

    .qqface.qqface16 {
        background-position: -29px -29px;
    }

    .qqface.qqface17 {
        background-position: -58px -29px;
    }

    .qqface.qqface18 {
        background-position: -87px -29px;
    }

    .qqface.qqface19 {
        background-position: -116px -29px;
    }

    .qqface.qqface20 {
        background-position: -145px -29px;
    }

    .qqface.qqface21 {
        background-position: -174px -29px;
    }

    .qqface.qqface22 {
        background-position: -203px -29px;
    }

    .qqface.qqface23 {
        background-position: -232px -29px;
    }

    .qqface.qqface24 {
        background-position: -261px -29px;
    }

    .qqface.qqface25 {
        background-position: -290px -29px;
    }

    .qqface.qqface26 {
        background-position: -319px -29px;
    }

    .qqface.qqface27 {
        background-position: -348px -29px;
    }

    .qqface.qqface28 {
        background-position: -377px -29px;
    }

    .qqface.qqface29 {
        background-position: -406px -29px;
    }

    .qqface.qqface30 {
        background-position: 0 -58px;
    }

    .qqface.qqface31 {
        background-position: -29px -58px;
    }

    .qqface.qqface32 {
        background-position: -58px -58px;
    }

    .qqface.qqface33 {
        background-position: -87px -58px;
    }

    .qqface.qqface34 {
        background-position: -116px -58px;
    }

    .qqface.qqface35 {
        background-position: -145px -58px;
    }

    .qqface.qqface36 {
        background-position: -174px -58px;
    }

    .qqface.qqface37 {
        background-position: -203px -58px;
    }

    .qqface.qqface38 {
        background-position: -232px -58px;
    }

    .qqface.qqface39 {
        background-position: -261px -58px;
    }

    .qqface.qqface40 {
        background-position: -290px -58px;
    }

    .qqface.qqface41 {
        background-position: -319px -58px;
    }

    .qqface.qqface42 {
        background-position: -348px -58px;
    }

    .qqface.qqface43 {
        background-position: -377px -58px;
    }

    .qqface.qqface44 {
        background-position: -406px -58px;
    }

    .qqface.qqface45 {
        background-position: 0 -87px;
    }

    .qqface.qqface46 {
        background-position: -29px -87px;
    }

    .qqface.qqface47 {
        background-position: -58px -87px;
    }

    .qqface.qqface48 {
        background-position: -87px -87px;
    }

    .qqface.qqface49 {
        background-position: -116px -87px;
    }

    .qqface.qqface50 {
        background-position: -145px -87px;
    }

    .qqface.qqface51 {
        background-position: -174px -87px;
    }

    .qqface.qqface52 {
        background-position: -203px -87px;
    }

    .qqface.qqface53 {
        background-position: -232px -87px;
    }

    .qqface.qqface54 {
        background-position: -261px -87px;
    }

    .qqface.qqface55 {
        background-position: -290px -87px;
    }

    .qqface.qqface56 {
        background-position: -319px -87px;
    }

    .qqface.qqface57 {
        background-position: -348px -87px;
    }

    .qqface.qqface58 {
        background-position: -377px -87px;
    }

    .qqface.qqface59 {
        background-position: -406px -87px;
    }

    .qqface.qqface60 {
        background-position: 0 -116px;
    }

    .qqface.qqface61 {
        background-position: -29px -116px;
    }

    .qqface.qqface62 {
        background-position: -58px -116px;
    }

    .qqface.qqface63 {
        background-position: -87px -116px;
    }

    .qqface.qqface64 {
        background-position: -116px -116px;
    }

    .qqface.qqface65 {
        background-position: -145px -116px;
    }

    .qqface.qqface66 {
        background-position: -174px -116px;
    }

    .qqface.qqface67 {
        background-position: -203px -116px;
    }

    .qqface.qqface68 {
        background-position: -232px -116px;
    }

    .qqface.qqface69 {
        background-position: -261px -116px;
    }

    .qqface.qqface70 {
        background-position: -290px -116px;
    }

    .qqface.qqface71 {
        background-position: -319px -116px;
    }

    .qqface.qqface72 {
        background-position: -348px -116px;
    }

    .qqface.qqface73 {
        background-position: -377px -116px;
    }

    .qqface.qqface74 {
        background-position: -406px -116px;
    }

    .qqface.qqface75 {
        background-position: 0 -145px;
    }

    .qqface.qqface76 {
        background-position: -29px -145px;
    }

    .qqface.qqface77 {
        background-position: -58px -145px;
    }

    .qqface.qqface78 {
        background-position: -87px -145px;
    }

    .qqface.qqface79 {
        background-position: -116px -145px;
    }

    .qqface.qqface80 {
        background-position: -145px -145px;
    }

    .qqface.qqface81 {
        background-position: -174px -145px;
    }

    .qqface.qqface82 {
        background-position: -203px -145px;
    }

    .qqface.qqface83 {
        background-position: -232px -145px;
    }

    .qqface.qqface84 {
        background-position: -261px -145px;
    }

    .qqface.qqface85 {
        background-position: -290px -145px;
    }

    .qqface.qqface86 {
        background-position: -319px -145px;
    }

    .qqface.qqface87 {
        background-position: -348px -145px;
    }

    .qqface.qqface88 {
        background-position: -377px -145px;
    }

    .qqface.qqface89 {
        background-position: -406px -145px;
    }

    .qqface.qqface90 {
        background-position: 0 -174px;
    }

    .qqface.qqface91 {
        background-position: -29px -174px;
    }

    .qqface.qqface92 {
        background-position: -58px -174px;
    }

    .qqface.qqface93 {
        background-position: -87px -174px;
    }

    .qqface.qqface94 {
        background-position: -116px -174px;
    }

    .qqface.qqface95 {
        background-position: -145px -174px;
    }

    .qqface.qqface96 {
        background-position: -174px -174px;
    }

    .qqface.qqface97 {
        background-position: -203px -174px;
    }

    .qqface.qqface98 {
        background-position: -232px -174px;
    }

    .qqface.qqface99 {
        background-position: -261px -174px;
    }

    .qqface.qqface100 {
        background-position: -290px -174px;
    }

    .qqface.qqface101 {
        background-position: -319px -174px;
    }

    .qqface.qqface102 {
        background-position: -348px -174px;
    }

    .qqface.qqface103 {
        background-position: -377px -174px;
    }

    .qqface.qqface104 {
        background-position: -406px -174px;
    }
}
</style>
