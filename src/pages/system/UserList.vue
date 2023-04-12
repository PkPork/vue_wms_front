<template>
  <a-card :bordered="false" :style="{ minHeight: '560px' }">
    <div class="table-operator">
      <a-button type="primary" icon="plus" @click="handleCreate"
        >사용자 추가</a-button
      >
    </div>

    <s-table
      ref="list"
      rowKey="id"
      size="default"
      :columns="columns"
      :data="loadData"
    >
      <span slot="action" slot-scope="text, record">
        <template>
          <a @click="handleEdit(record)"> <a-icon type="edit" />수정 </a>
        </template>
      </span>

      <span slot="username" slot-scope="imageUrl, record">
        <img
          style="width: 42px; height: 42px; border-radius: 50%"
          :src="record.avatar"
        />
        {{ record.username }}
      </span>

      <span slot="roleId" slot-scope="roleId">
        <a-tag>{{ roleId | roleFilter }}</a-tag>
      </span>

      <span slot="status" slot-scope="status">
        <a-badge
          :color="status | statusTypeFilter"
          :text="status | statusFilter"
        />
      </span>
    </s-table>

    <a-modal
      :title="formFlag == 1 ? '사용자 생성' : '사용자 수정'"
      style="top: 20px"
      :width="800"
      @cancel="cancel"
      v-model="visible"
      @ok="handleOk"
    >
      <a-form
        ref="ruleForm"
        :form="form"
        :labelCol="labelCol"
        :wrapperCol="wrapperCol"
      >
        <a-form-item label="사용자 이름">
          <a-input
            placeholder="사용자 이름을 입력하십시오!"
            v-decorator="[
              'username',
              { rules: [{ required: true, message: '사용자 이름을 입력하십시오!' }] },
            ]"
          />
        </a-form-item>

        <a-form-item label="비밀번호">
          <a-input
            placeholder="비밀번호를 입력해주세요. (수정 사용자가 입력되지 않으면 비밀번호는 업데이트 되지 않습니다.)!"
            v-decorator="[
              'password',
              { rules: [{ validator: checkPassword }] },
            ]"
          />
        </a-form-item>

        <a-form-item label="이름">
          <a-input
            placeholder="이름을 입력하십시오!"
            v-decorator="[
              'name',
              { rules: [{ required: true, message: '이름을 입력하십시오!' }] },
            ]"
          />
        </a-form-item>

        <a-form-item label="사용자 역할">
          <a-select
            v-decorator="[
              'roleId',
              { rules: [{ required: true, message: '사용자 역할을 선택하십시오!' }] },
            ]"
          >
            <a-select-option
              :key="item.id"
              v-for="item in rolesMap"
              :value="item.id"
              >{{ item.name }}</a-select-option
            >
          </a-select>
        </a-form-item>

        <a-form-item label="사용자 상태">
          <a-select
            v-decorator="[
              'status',
              { rules: [{ required: true, message: '사용자 상태를 선택하십시오!' }] },
            ]"
          >
            <a-select-option
              :key="item.id"
              v-for="item in statusMap"
              :value="item.id"
              >{{ item.name }}</a-select-option
            >
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </a-card>
</template>

<script>
import STable from "@/components/table";
import {
  getRoles,
  getSysUserList,
  updateSysUser,
  createSysUser,
} from "@/services/system";
import { statusMap } from "@/enums/user";
import pick from "lodash.pick";
let that;
export default {
  name: "SysUserList",
  components: {
    STable,
  },
  data() {
    let pwdRegex = new RegExp(
      "(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9]).{8,30}"
    );
    let checkPassword = (rule, value, callback) => {
      if (value) {
        if (!pwdRegex.test(value)) {
          callback(
            new Error(
              "암호 복잡성을 너무 낮게 설정하십시오. 대문자와 소문자, 숫자, 특수 문자를 포함해야 하며 8자 이상이어야 합니다."
            )
          );
        }
      }
      callback();
    };
    return {
      layout: {
        labelCol: { span: 4 },
        wrapperCol: { span: 14 },
      },
      visible: false,
      rolesMap: [],
      form: this.$form.createForm(this),
      formFlag: 1,
      editId: 0,
      checkPassword: checkPassword,
      statusMap: statusMap,
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
      mdl: {},
      // 헤더
      columns: [
        {
          title: "Id",
          dataIndex: "id",
          key: "id",
        },
        {
          title: "사용자 이름",
          dataIndex: "username",
          key: "username",
          scopedSlots: { customRender: "username" },
        },
        {
          title: "이름",
          dataIndex: "name",
          key: "name",
        },
        {
          title: "역할",
          dataIndex: "roleId",
          scopedSlots: { customRender: "roleId" },
          key: "roleId",
        },
        {
          title: "상태",
          dataIndex: "status",
          scopedSlots: { customRender: "status" },
          key: "status",
        },
        {
          title: "생성 시간",
          dataIndex: "createdTime",
          key: "createdTime",
        },
        {
          title: "액션",
          width: "150px",
          dataIndex: "action",
          scopedSlots: { customRender: "action" },
          key: "action",
        },
      ],
      loadData: (parameter) => {
        return getSysUserList(parameter).then((res) => {
          return res.data;
        });
      },
    };
  },
  created() {
    that = this;
    getRoles().then((res) => {
      this.rolesMap = res.data.map((item) => {
        return { id: item.id, name: item.name };
      });
    });
  },
  filters: {
    roleFilter(roleId) {
      let res = that.rolesMap.find((item) => {
        return item.id == roleId;
      });
      if (res) {
        return res.name;
      }
    },
    statusFilter(status) {
      let res = that.statusMap.find((item) => {
        return item.id == status;
      });
      if (res) {
        return res.name;
      }
    },
    statusTypeFilter(type) {
      let res = that.statusMap.find((item) => {
        return item.id == type;
      });
      if (res) {
        return res.color;
      }
    },
  },
  methods: {
    handleEdit(record) {
      this.visible = true;
      this.formFlag = 2;
      this.editId = record.id;
      this.$nextTick(() => {
        this.$refs["ruleForm"].form.setFieldsValue(
          pick(record, "name", "roleId", "status", "username")
        );
      });
    },
    handleCreate() {
      this.visible = true;
      this.$refs["ruleForm"].form.resetFields();
      this.formFlag = 1;
    },
    cancel() {
      this.$refs["ruleForm"].form.resetFields();
    },
    handleOk(e) {
      e.preventDefault();
      this.$refs["ruleForm"].form.validateFields((err, values) => {
        if (!err) {
          if (this.formFlag == 1) {
            console.log('values ====',values)
            createSysUser(values).then((res) => {
              if (res.code == 200) {
                this.$message.success("사용자 생성 성공");
                this.visible = false;
                this.$refs.list.refresh();
              } else {
                this.$message.error(res.message);
              }
            });
          } else {
            values.id = this.editId;
            updateSysUser(values).then((res) => {
              if (res.code == 200) {
                this.$message.success("사용자 정보 수정 성공");
                this.visible = false;
                this.$refs.list.refresh();
              } else {
                this.$message.error(res.message);
              }
            });
          }
        }
      });
    },
  },
};
</script>
