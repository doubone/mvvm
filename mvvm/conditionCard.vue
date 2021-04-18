<template>
    <el-card shadow="never" :body-style="bodyStyle">
        <el-form
            :label-position="labelPosition"
            :label-width="labelWidth"
            label-suffix="："
        >
            <el-row
                :gutter="20"
                type="flex"
                align="center"
                justify="space-between"
                style="margin:16px 0"
            >
                <el-col>
                    <span class="condition-title">{{
                        $t("message.filterCondition")
                    }}</span>
                    <span
                        v-if="!isExpand && expandable"
                        @click="handleCommand"
                        class="condition-expand"
                    >
                        <i class="el-icon-arrow-down el-icon--left"></i>
                        {{ $t("message.unfold") }}
                    </span>
                    <span
                        v-if="isExpand && expandable"
                        @click="handleCommand"
                        class="condition-expand"
                    >
                        <i class="el-icon-arrow-up el-icon--left"></i>
                        {{ $t("message.fold") }}
                    </span>
                </el-col>
                <el-col :class="col1"></el-col>
                <el-col :class="col2"></el-col>
                <div
                    :style="
                        isExpand
                            ? { margin: '0' }
                            : { margin: `0 0 0 ${labelWidth}` }
                    "
                    class="block-btn"
                >
                    <el-button v-if="showResetBtn" @click="reset">{{
                        $t("message.reset")
                    }}</el-button>
                    <el-button
                        v-if="showSearchBtn"
                        @click="search"
                        type="primary"
                    >
                        {{ $t("message.filter") }}
                    </el-button>
                    <el-button
                        type="primary"
                        v-if="isExpand && advance"
                        @click="showAdvanceSearch"
                        icon="el-icon-zoom-in"
                        >高级查询</el-button
                    >
                    <slot name="other-btn" v-if="isExpand"></slot>
                </div>
            </el-row>
            <div v-show="isExpand" class="condition-slot">
                <el-col :span="managDepartmentSpan" class="department">
                    <el-form-item :label="$t('culture.cultureScheme.proDept')">
                        <el-select
                            v-model="managDepartmentId"
                            placeholder="请选择"
                            @change="managDepartmentChange"
                        >
                            <el-option
                                v-for="item in managDepartmentList"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            ></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <slot></slot>
            </div>
        </el-form>
        <advance-search
            ref="advanceSearch"
            v-if="advance && load"
            :business-type="businessType"
            :fields-api="fieldsApi"
            :search-api="searchApi"
            :fields-api-method="fieldsApiMethod"
            :fields-api-params="fieldsApiParams"
            :search-api-method="searchApiMethod"
            :search-api-params="searchApiParams"
            @advanceQuery="handleQuery"
        />
    </el-card>
</template>

<script>
import { queryDic } from "@/api/dictionary";
export default {
    name: "ConditionCard",
    props: {
        manageDepartment: {
            type: Function,
            default: null
        },
        managDepartmentSpan: {
            type: Number,
            default: 8
        },
        labelWidth: {
            default: "100px"
        },
        labelPosition: {
            default: "right"
        },
        expand: {
            default: true
        },
        expandable: {
            default: true
        },
        showResetBtn: {
            default: true
        },
        showSearchBtn: {
            default: true
        },
        advance: {
            //是否显示高级查询
            type: Boolean,
            default: false
        },
        //高级查询--业务类型
        businessType: {
            type: String
        },
        //高级查询--字段列表接口，各业务类型自己提供
        fieldsApi: {
            type: String
        },
        //高级查询--查询接口，各业务类型自己提供，返回数据列表
        searchApi: {
            type: String
        },
        //高级查询--字段列表接口请求方式
        fieldsApiMethod: {
            type: String,
            default: "get"
        },
        //高级查询--字段列表接口请求参数
        fieldsApiParams: {
            type: Object,
            default: null
        },
        //高级查询--查询接口请求方式
        searchApiMethod: {
            type: String,
            default: "get"
        },
        //高级查询--查询接口请求参数
        searchApiParams: {
            type: Object,
            default: null
        },
        bodyStyle: {
            default: "padding: 24px;"
        }
    },
    data() {
        return {
            col1: "col-" + Math.floor(Math.random() * 10000),
            col2: "col-" + Math.floor(Math.random() * 10000),
            isExpand: true,
            load: false,
            managDepartmentList: [],
            managDepartmentId: ""
        };
    },
    mounted() {
        if (this.doNeedManageDepartment()) {
            this.getmanageDepartmentList();
            this.compile();
        } else {
            this.manageDepartment &&
                this.manageDepartment(this.$store.getters.getProjectId());
        }
        this.isExpand = this.expand;
        if (!this.isExpand) this.hidden();
        document.get;
    },

    methods: {
        doNeedManageDepartment() {
            let status = false;
            if (
                typeof this.manageDepartment == "function" &&
                this.manageDepartment.name == "manageDepartment" &&
                this.global.isAnyTeacher
            ) {
                status = true;
            }
            return status;
        },
        compile() {
            let slotEles = [...document.querySelectorAll(".condition-slot")];
            for (var i = 0; i++; i < slotEles.length) {
                if (i > 0) {
                    slotEles[i].parendNode.removeChild(slotEles[i]);
                }
            }
            let nodeRow = document
                .querySelector(".condition-slot .el-row")
                .cloneNode();
            let fragment = document.createDocumentFragment();
            let node = document.querySelectorAll(".condition-slot .el-col");
            [...node].forEach(e => nodeRow.appendChild(e));
            fragment.appendChild(nodeRow);
            let el = document.querySelector(".condition-slot");
            el.innerHTML = "";
            el.appendChild(nodeRow);
        },
        async getmanageDepartmentList() {
            let keys = "X_GLBM";
            const params = {
                lang: this.$store.getters.language || "cn",
                type: "allChild",
                keys: keys
            };
            let {
                code,
                data: { X_GLBM: mdObj }
            } = await queryDic(params);
            if (code !== 200) return;
            this.managDepartmentList = this.$store.getters
                .getManageDptIds()
                .map(e => {
                    let obj = {};
                    if (mdObj[e]) {
                        (obj["label"] = mdObj[e]),
                            (obj["value"] = e),
                            (obj["key"] = e);
                    }
                    return obj;
                });
        },
        managDepartmentChange(value) {
            this.managDepartmentId = value;
            this.manageDepartment(value);
        },
        hidden() {
            let showCols = this.getShowElements();
            if (showCols.length >= 2) {
                this.$el
                    .querySelector("." + this.col1)
                    .appendChild(showCols[0].firstChild);
                this.$el
                    .querySelector("." + this.col2)
                    .appendChild(showCols[1].firstChild);
            } else if (showCols.length == 1) {
                this.$el
                    .querySelector("." + this.col1)
                    .appendChild(showCols[0].firstChild);
            }
        },
        show() {
            let showCols = this.getShowElements();
            if (showCols.length >= 2) {
                showCols[0].appendChild(
                    this.$el.querySelector("." + this.col1).firstChild
                );
                showCols[1].appendChild(
                    this.$el.querySelector("." + this.col2).firstChild
                );
            } else if (showCols.length == 1) {
                showCols[0].appendChild(
                    this.$el.querySelector("." + this.col1).firstChild
                );
            }
        },
        /**
         * 折叠时，默认显示前2个el-col元素，若需指定折叠某个el-col元素,对el-col添加default属性
         * 折叠最多显示2列
         */
        getShowElements() {
            let cols = document.querySelectorAll(
                ".condition-slot .el-row .el-col"
            );
            let showCols = [];
            [...cols].forEach(col => {
                if (col.hasAttribute("default") && showCols.length != 2) {
                    showCols.push(col);
                }
            });
            if (showCols.length == 0) {
                [...cols].forEach(col => {
                    if (showCols.length < 2) {
                        showCols.push(col);
                    }
                });
            }
            return showCols;
        },
        handleCommand() {
            if (!this.isExpand) {
                this.isExpand = true;
                this.getIsExpand();
                this.show();
            } else if (this.isExpand) {
                this.isExpand = false;
                this.getIsExpand();
                this.hidden();
            }
        },
        // 获取是否展开或收缩的值（isExpand）
        getIsExpand() {
            this.$emit("getIsExpand", this.isExpand);
        },
        search() {
            this.$emit("search");
        },
        reset() {
            this.$emit("reset");
        },
        //显示高级查询
        showAdvanceSearch() {
            //第一次点击高级查询，才加载该组件
            if (!this.load) {
                this.load = true;
            } else {
                this.$refs.advanceSearch.open();
            }
        },
        //处理查询结果
        handleQuery(data) {
            this.$emit("advanceQuery", data);
        }
    }
};
</script>

<style lang="scss" scoped>
.condition-title {
    color: #2b3b4e;
    font-size: 18px;
    line-height: 24px;
    font-weight: bold;
}
.condition-expand {
    color: #3a7fe8;
    font-size: 14px;
    cursor: pointer;
    margin-left: 10px;
}
.block-btn {
    text-align: right;
    padding-right: 0 !important;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
}
.department {
    padding-left: 12px;
    padding-right: 12px;
}
</style>
