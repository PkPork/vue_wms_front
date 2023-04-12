<template>
  <a-card :bordered="false" :style="{ minHeight: '560px' }">
    <a-drawer
      title="역할 권한 구성"
      :width="720"
      :visible="powerVisible"
      :body-style="{ paddingBottom: '80px' }"
      @close="onClose"
    >
      <a-tabs :default-active-key="currentTab" @change="changeTab">
        <a-tab-pane key="1">
          <span slot="tab"> <a-icon type="menu" />메뉴구성 </span>

          <div class="table-operator">
            <a-button type="primary" @click="saveRoleMenus">저장</a-button>
          </div>

          <a-tree
            v-model="checkedKeys"
            checkable
            :expanded-keys="expandedKeys"
            :auto-expand-parent="autoExpandParent"
            :tree-data="menuList"
            @expand="onExpand"
            :replaceFields="{ title: 'name', key: 'id', children: 'children' }"
          />
        </a-tab-pane>
        <a-tab-pane key="2">
          <span slot="tab"> <a-icon type="control" />페이지 버튼 권한 구성 </span>
          <div class="table-operator">
            <a-button type="primary" @click="saveRoleMenuPermissons"
              >저장</a-button
            >
          </div>
          <a-row
            :gutter="16"
            v-for="(permission, index) in permissions"
            :key="index"
          >
            <a-col :xl="4" :lg="24">{{ permission.name }}：</a-col>
            <a-col :xl="20" :lg="24">
              <a-checkbox
                v-if="permission.actionsOptions.length > 0"
                :indeterminate="permission.indeterminate"
                :checked="permission.checkedAll"
                @change="onChangeCheckAll($event, permission)"
                >모두 선택</a-checkbox
              >
              <a-checkbox-group
                :options="permission.actionsOptions"
                v-model="permission.selected"
                @change="onChangeCheck(permission)"
              />
            </a-col>
          </a-row>
        </a-tab-pane>
      </a-tabs>
    </a-drawer>

    <div class="table-operator">
      <a-button type="primary" icon="plus" @click="handleCreate()"
        >역할 추가</a-button
      >
    </div>

    <s-table
      ref="list"
      rowKey="id"
      size="default"
      :columns="columns"
      :data="loadData"
      :pagination="false"
    >
      <span slot="action" slot-scope="text, record">
        <template>
          <a @click="showDrawer(record)"> <a-icon type="tool" />권한 구성 </a>
          <a-divider type="vertical" />
          <a @click="handleEdit(record)"> <a-icon type="edit" />수정 </a>
          <a-divider type="vertical" />
          <a @click="handleDelete(record)"> <a-icon type="delete" />삭제 </a>
        </template>
      </span>

      <span slot="uniqueKey" slot-scope="uniqueKey">
        <a-tag>{{ uniqueKey }}</a-tag>
      </span>
    </s-table>

    <a-modal
      :title="formFlag == 1 ? '역할 생성' : '역할 수정'"
      style="top: 20px"
      :width="800"
      @cancel="cancel"
      v-model="visible"
      @ok="handleOk"
    >
      <a-form :form="form" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-form-item label="권한 고유 키">
          <a-input
            placeholder="권한 고유 키를 입력하세요.!"
            v-decorator="[
              'uniqueKey',
              { rules: [{ required: true, message: '권한 고유 키를 입력하세요.!' }] },
            ]"
          />
        </a-form-item>

        <a-form-item label="role명">
          <a-input
            placeholder="role명을 입력하세요.!"
            v-decorator="[
              'name',
              { rules: [{ required: true, message: 'role명을 입력하세요!' }] },
            ]"
          />
        </a-form-item>

        <a-form-item label="role 비고">
          <a-textarea
            :rows="3"
            placeholder="역할 메모를 입력하세요.!"
            v-decorator="['remark']"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </a-card>
</template>

<script>
import STable from "@/components/table";
import {
  getMenus,
  getRoles,
  getMenuPermissions,
  editRole,
  deleteRole,
  saveRoleMenus,
  saveRoleMenuPermissons,
  getMenuAndMenuPermissions,
} from "@/services/system";
import { actionToObject } from "@/utils/util";
import pick from "lodash.pick";
export default {
  name: "RoleList",
  components: {
    STable,
  },
  data() {
    return {
      expandedKeys: [],
      autoExpandParent: true,
      checkedKeys: [],
      permissions: [],
      initPermissions: [],
      layout: {
        labelCol: { span: 4 },
        wrapperCol: { span: 14 },
      },
      powerVisible: false,
      currentTab: 1,
      currentRoleId: 0,
      menuList: [],
      visible: false,
      rolesMap: [],
      form: this.$form.createForm(this),
      formFlag: 1,
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
          title: "고유 키",
          dataIndex: "uniqueKey",
          key: "uniqueKey",
          scopedSlots: { customRender: "uniqueKey" },
        },
        {
          title: "role명",
          dataIndex: "name",
          key: "name",
        },
        {
          title: "비고",
          dataIndex: "remark",
          key: "remark",
        },
        {
          title: "생성 시간",
          dataIndex: "createdTime",
          key: "createdTime",
        },
        {
          title: "액션",
          dataIndex: "action",
          scopedSlots: { customRender: "action" },
          key: "action",
        },
      ],
      loadData: (parameter) => {
        return getRoles(parameter).then((res) => {
          return res.data;
        });
      },
    };
  },
  created() {
    this.getMenus();
    this.loadPermissions();
  },
  methods: {
    changeTab(tab) {
      this.currentTab = tab;
    },
    saveRoleMenuPermissons() {
      let permissions = this.permissions.map((item) => {
        let actions = item.actionsOptions;
        let operation = [];
        for (let i = 0; i < actions.length; i++) {
          for (let j = 0; j < item.selected.length; j++) {
            if (item.selected[j] == actions[i].value) {
              let index = actions[i].value.lastIndexOf("-");
              operation.push({
                action: actions[i].value.substr(index + 1),
                describe: actions[i].label,
              });
              break;
            }
          }
        }
        return {
          menuId: item.id,
          operation: JSON.stringify(operation),
        };
      });

      saveRoleMenuPermissons({
        roleId: this.currentRoleId,
        permissions: permissions,
      }).then((res) => {
        if (res.code == 200) {
          this.$message.success("구성 페이지 버튼 권한 구성");
        } else {
          this.$message.error(res.message);
        }
      });
    },
    saveRoleMenus() {
      saveRoleMenus({
        roleId: this.currentRoleId,
        menuIds: this.checkedKeys.join(","),
      }).then((res) => {
        if (res.code == 200) {
          this.$message.success("구성 메뉴 성공");
        } else {
          this.$message.error(res.message);
        }
      });
    },
    getMenus() {
      getMenus().then((res) => {
        this.menuList = this.processMenuList(res.data);
        this.expandedKeys = this.menuList.map((item) => {
          return item.id;
        });
      });
    },
    loadPermissions() {
      getMenuPermissions().then((res) => {
        const result = res.data;
        this.permissions = result.map((item) => {
          const options = actionToObject(item.permissions);
          item.checkedAll = false;
          item.selected = [];
          item.indeterminate = false;
          item.actionsOptions = options.map((option) => {
            return {
              label: option.describe,
              value: `${item.id}-${option.action}`,
            };
          });
          return item;
        });
        this.initPermissions = JSON.parse(JSON.stringify(this.permissions));
      });
    },
    onChangeCheck(permission) {
      permission.indeterminate =
        !!permission.selected.length &&
        permission.selected.length < permission.actionsOptions.length;
      permission.checkedAll =
        permission.selected.length === permission.actionsOptions.length;
    },
    onChangeCheckAll(e, permission) {
      Object.assign(permission, {
        selected: e.target.checked
          ? permission.actionsOptions.map((obj) => obj.value)
          : [],
        indeterminate: false,
        checkedAll: e.target.checked,
      });
    },
    processMenuList(menuList) {
      return menuList.map((item) => {
        if (item.children && item.children.length > 0) {
          item.children = this.processMenuList(item.children);
        } else {
          delete item.children;
        }
        return item;
      });
    },
    onExpand(expandedKeys) {
      this.expandedKeys = expandedKeys;
      this.autoExpandParent = false;
    },
    showDrawer(record) {
      this.permissions = JSON.parse(JSON.stringify(this.initPermissions));
      this.currentRoleId = record.id;
      this.powerVisible = true;
      getMenuAndMenuPermissions({ roleId: record.id }).then((res) => {
        let { menuIds, permissions: rolePermissions } = res.data;
        this.checkedKeys = menuIds.split(",").map((item) => Number(item));
        // 권한 테이블, 처리 확인
        if (this.permissions && rolePermissions && rolePermissions.length > 0) {
          // 먼저 확인할 권한 구조를 처리합니다.
          const permissionsAction = {};
          rolePermissions.forEach((item) => {
            let operation = JSON.parse(item.operation);
            permissionsAction[item.menuId] = operation.map(
              (entity) => `${item.menuId}-${entity.action}`
            );
          });
          this.permissions.forEach((permission) => {
            const selected = permissionsAction[permission.id];
            permission.selected = selected || [];
            this.onChangeCheck(permission);
          });
        }
      });
    },
    onClose() {
      this.powerVisible = false;
      this.currentTab = 1;
    },
    handleEdit(record) {
      this.visible = true;
      this.formFlag = 2;
      this.$nextTick(() => {
        this.form.setFieldsValue(pick(record, "name", "remark", "uniqueKey"));
      });
    },
    handleCreate() {
      this.visible = true;
      this.form.resetFields();
      this.formFlag = 1;
    },
    cancel() {
      this.form.resetFields();
    },
    handleDelete(record) {
      let model = this.$confirm({
        title: "알림",
        content: "이 역할을 삭제하시겠습니까?",
        onOk: () => {
          return deleteRole({ roleId: record.id }).then((res) => {
            if (res.code == 200) {
              this.$message.success("역할 삭제 성공");
              this.$refs.list.refresh();
            } else {
              this.$message.error(res.message);
            }
            model.destroy();
          });
        },
        onCancel() {},
      });
    },
    handleOk(e) {
      e.preventDefault();
      this.form.validateFields((err, values) => {
        if (!err) {
          editRole(values).then((res) => {
            if (res.code == 200) {
              this.$message.success(
                this.formFlag == 1 ? "생성" : "수정" + "역할 성공"
              );
              this.visible = false;
              this.$refs.list.refresh();
            } else {
              this.$message.error(res.message);
            }
          });
        }
      });
    },
  },
};
</script>
<style scoped lang="less">
/deep/ .ant-row {
  margin-bottom: 12px;
}
</style>