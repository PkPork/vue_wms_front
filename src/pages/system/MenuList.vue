<template>
  <a-card :bordered="false" :style="{ minHeight: '560px' }">
    <div class="table-operator">
      <a-button type="primary" icon="plus" @click="handleCreate"
        >새 루트 메뉴</a-button
      >
    </div>
    <s-table
      ref="list"
      rowKey="id"
      size="default"
      :columns="columns"
      :data="loadData"
      :pagination="false"
      childrenColumnName="children"
    >
      <span slot="name" slot-scope="text, record">
        <a-icon
          v-if="record.icon"
          style="margin-left: 6px"
          :type="record.icon"
        />
        {{ record.name }}
      </span>

      <span slot="path" slot-scope="text, record">
        <a-tag>{{ record.path }}</a-tag>
      </span>

      <span slot="component" slot-scope="text, record">
        <a-tag>{{ record.component }}</a-tag>
      </span>

      <span slot="invisible" slot-scope="text, record">
        <a-badge
          :color="record.invisible | invisibleColor"
          :text="record.invisible | invisibleText"
        />
      </span>

      <span slot="cacheAble" slot-scope="text, record">
        <a-badge
          :color="record.cacheAble | cacheAbleColor"
          :text="record.cacheAble | cacheAbleText"
        />
      </span>

      <span slot="action" slot-scope="text, record">
        <a @click="handleAddSub(record)"> <a-icon type="plus" />하위 메뉴 추가 </a>
        <a-divider type="vertical" />
        <a @click="handleEdit(record)"> <a-icon type="edit" />수정 </a>
        <a-divider type="vertical" />
        <a @click="handleDelete(record)"> <a-icon type="delete" />삭제 </a>
      </span>
    </s-table>

    <a-modal
      class="edit-modal"
      :title="
        formFlag == 1
          ? '시스템 루트 메뉴 만들기'
          : formFlag == 2
          ? '시스템 메뉴 편집'
          : '시스템 메뉴 만들기'
      "
      :width="800"
      v-model="visible"
      @cancel="cancel"
      @ok="handleOk"
    >
      <a-form
        labelWidth="260"
        :form="form"
        :labelCol="labelCol"
        :wrapperCol="wrapperCol"
      >
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item :required="true" label="라우팅">
              <a-input
                placeholder="경로를 입력하세요!"
                v-decorator="[
                  'path',
                  { rules: [{ required: true, message: '경로를 입력하세요!' }] },
                ]"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="메뉴명">
              <a-input
                placeholder="메뉴명을 입력해주세요!"
                v-decorator="[
                  'name',
                  { rules: [{ required: true, message: '메뉴명을 입력해주세요!' }] },
                ]"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item label="메뉴숨김">
              <a-select
                placeholder="선택하세요."
                v-decorator="[
                  'invisible',
                  {
                    rules: [{ required: true, message: '메뉴를 숨길지 선택하세요!' }],
                  },
                ]"
              >
                <a-select-option
                  :key="item.key"
                  v-for="item in invisibleMap"
                  :value="item.key"
                  >{{ item.text }}</a-select-option
                >
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="페이지 캐시">
              <a-select
                placeholder="선택하세요."
                v-decorator="[
                  'cacheAble',
                  {
                    rules: [{ required: true, message: '페이지를 캐시할지 여부를 선택하십시오.!' }],
                  },
                ]"
              >
                <a-select-option
                  :key="item.key"
                  v-for="item in cacheAbleMap"
                  :value="item.key"
                  >{{ item.text }}</a-select-option
                >
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item label="컴포넌트명">
              <a-select
                placeholder="컴포넌트명을 선택하십시오!"
                v-decorator="[
                  'component',
                  { rules: [{ required: true, message: '컴포넌트명을 선택하십시오!' }] },
                ]"
              >
                <a-select-option
                  :key="index"
                  v-for="(item, index) in constantRouterComponents"
                  :value="index"
                  >{{ index }}</a-select-option
                >
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="정렬순서">
              <a-input
                placeholder="정렬순서 입력해주세요!"
                v-decorator="[
                  'sort',
                  { rules: [{ required: true, message: '정렬순서를 입력해주세요!' }] },
                ]"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item label="부모 노드">
              <a-tree-select
                v-if="formFlag == 1"
                disabled="disabled"
                v-decorator="['parentId']"
                placeholder="루트 노드"
                defaultValue="0"
                style="width: 100%"
              ></a-tree-select>
              <a-tree-select
                v-else
                placeholder="상위 노드를 선택하십시오!"
                v-decorator="[
                  'parentId',
                  { rules: [{ required: true, message: '상위 노드를 선택하십시오!' }] },
                ]"
                style="width: 100%"
                :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                :tree-data="menuList"
                tree-default-expand-all
                :replaceFields="{
                  title: 'name',
                  key: 'id',
                  value: 'id',
                  children: 'children',
                }"
              ></a-tree-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="아이콘">
              <a-select
                v-if="formFlag == 3"
                placeholder
                disabled="disabled"
                v-decorator="['icon', { initialValue: '' }]"
              >
                <a-select-option
                  :key="index"
                  v-for="(item, index) in iconList"
                  :value="item"
                >
                  <a-icon :type="item" style="margin-right: 6px" />
                  {{ item }}
                </a-select-option>
              </a-select>
              <a-select
                v-else
                placeholder="아이콘을 선택해 주세요!"
                v-decorator="[
                  'icon',
                  { rules: [{ required: true, message: '아이콘을 선택해 주세요!' }] },
                ]"
              >
                <a-select-option
                  :key="index"
                  v-for="(item, index) in iconList"
                  :value="item"
                >
                  <a-icon :type="item" style="margin-right: 6px" />
                  {{ item }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="24">
            <a-button
              size="small"
              class="editable-add-btn"
              @click="handlePermissionAdd"
              >페이지 메뉴 권한 추가</a-button
            >
            <a-table
              :locale="{ emptyText: '데이터 없음' }"
              rowKey="index"
              :columns="permissionColumn"
              :data-source="permissionData"
              bordered
              :pagination="false"
            >
              <template
                v-for="col in ['action', 'describe']"
                :slot="col"
                slot-scope="text, record"
              >
                <div :key="col">
                  <a-input
                    v-if="record.editable"
                    style="margin: -5px 0"
                    :value="text"
                    @change="
                      (e) =>
                        handlePermissionChange(
                          e.target.value,
                          record.action,
                          col
                        )
                    "
                  />
                  <template v-else>{{ text }}</template>
                </div>
              </template>
              <template slot="operation" slot-scope="text, record">
                <div class="editable-row-operations">
                  <a
                    style="margin-left: 6px"
                    @click="() => removePermission(record.action)"
                    >삭제</a
                  >
                </div>
              </template>
            </a-table>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </a-card>
</template>

<script>
const permissionColumn = [
  {
    title: "권한 작업",
    dataIndex: "action",
    scopedSlots: { customRender: "action" },
  },
  {
    title: "권한설명",
    dataIndex: "describe",
    scopedSlots: { customRender: "describe" },
  },
  {
    title: "액션",
    dataIndex: "operation",
    scopedSlots: { customRender: "operation" },
  },
];

import STable from "@/components/table";
import {
  getMenus,
  getMenuPermissions,
  addMenu,
  editMenu,
  deleteMenu,
} from "@/services/system";
import { invisibleMap, cacheAbleMap, customIcon } from "@/enums/system";
import { constantRouterComponents } from "@/router/config";
import pick from "lodash.pick";
export default {
  name: "MenuList",
  components: {
    STable,
  },
  data() {
    return {
      permissionData: [],
      permissionColumn: permissionColumn,
      editingKey: "",
      visible: false,
      formFlag: 1,
      editId: 0,
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
      form: this.$form.createForm(this),
      invisibleMap: invisibleMap,
      cacheAbleMap: cacheAbleMap,
      constantRouterComponents: constantRouterComponents,
      iconList: customIcon,
      menuList: [],
      allMenuMap: [],
      columns: [
        {
          title: "Id",
          dataIndex: "id",
        },
        {
          title: "메뉴명",
          dataIndex: "name",
          scopedSlots: { customRender: "name" },
        },
        {
          title: "path",
          dataIndex: "path",
          scopedSlots: { customRender: "path" },
        },
        {
          title: "컴포넌트명",
          dataIndex: "component",
          scopedSlots: { customRender: "component" },
        },
        {
          title: "숨김여부",
          dataIndex: "invisible",
          scopedSlots: { customRender: "invisible" },
        },
        {
          title: "페이지캐시",
          dataIndex: "cacheAble",
          scopedSlots: { customRender: "cacheAble" },
        },
        {
          title: "정렬순서",
          dataIndex: "sort",
        },
        {
          title: "액션",
          width: "260px",
          dataIndex: "action",
          scopedSlots: { customRender: "action" },
        },
      ],
      loadData: (parameter) => {
        return getMenus(parameter).then((res) => {
          this.menuList = this.processMenuList(res.data);
          return this.menuList;
        });
      },
    };
  },
  filters: {
    invisibleColor(val) {
      return invisibleMap.find((item) => item.key == val)["color"];
    },
    cacheAbleColor(val) {
      return cacheAbleMap.find((item) => item.key == val)["color"];
    },
    invisibleText(val) {
      return invisibleMap.find((item) => item.key == val)["text"];
    },
    cacheAbleText(val) {
      return cacheAbleMap.find((item) => item.key == val)["text"];
    },
  },
  methods: {
    processMenuList(menuList) {
      return menuList.map((item) => {
        if (item.children.length > 0) {
          item.children = this.processMenuList(item.children);
        } else {
          delete item.children;
        }
        return item;
      });
    },
    handlePermissionAdd() {
      this.permissionData.push({
        index: new Date().getTime(),
        action: "",
        describe: "",
        editable: true,
      });
    },
    handlePermissionChange(value, action, column) {
      const newData = [...this.permissionData];
      const target = newData.filter((item) => action === item.action)[0];
      if (target) {
        target[column] = value;
        this.permissionData = newData;
      }
    },
    removePermission(action) {
      this.permissionData = this.permissionData.filter(
        (item) => action != item.action
      );
    },
    handleEdit(record) {
      this.visible = true;
      this.editId = record.id;
      this.formFlag = 2;
      if (record.permissions) {
        this.permissionData = JSON.parse(record.permissions).map((item) => {
          return {
            index: item.action,
            action: item.action,
            describe: item.describe,
            editable: true,
          };
        });
      } else {
        this.permissionData = [];
      }
      console.log(record);
      this.$nextTick(() => {
        this.form.setFieldsValue(
          pick(
            record,
            "path",
            "invisible",
            "name",
            "icon",
            "cacheAble",
            "sort",
            "component",
            "parentId"
          )
        );
      });
    },
    handleAddSub(record) {
      this.visible = true;
      this.formFlag = 3;
      this.permissionData = [];
      this.$nextTick(() => {
        this.form.setFieldsValue({ parentId: record.id });
      });
    },
    handleCreate() {
      this.visible = true;
      this.form.resetFields();
      this.permissionData = [];
      this.formFlag = 1;
    },
    handleDelete(record) {
      let model = this.$confirm({
        title: "알림",
        content: "정말 이 메뉴를 삭제하시겠습니까?",
        onOk: () => {
          return deleteMenu({ menuId: record.id }).then((res) => {
            if (res.code == 200) {
              this.$message.success("메뉴 삭제 성공");
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
    cancel() {
      this.form.resetFields();
    },
    handleOk(e) {
      e.preventDefault();
      this.form.validateFields((err, values) => {
        if (!err) {
          let permissions = this.permissionData.map((item) => {
            return {
              action: item.action,
              describe: item.describe,
            };
          });
          values.permissions = JSON.stringify(permissions);
          if (this.formFlag == 1 || this.formFlag == 3) {
            addMenu(values).then((res) => {
              if (res.code == 200) {
                this.$message.success("메뉴를 성공적으로 만들었습니다.");
                this.visible = false;
                this.$refs.list.refresh();
              } else {
                this.$message.error(res.message);
              }
            });
          } else {
            values.id = this.editId;
            editMenu(values).then((res) => {
              if (res.code == 200) {
                this.$message.success("메뉴 수정 성공");
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
<style scoped lang="less">
.editable-add-btn {
  margin-bottom: 12px;
}
.edit-modal /deep/ .ant-table-thead > tr > th {
  padding: 6px 12px;
}
.edit-modal /deep/ .ant-table-tbody > tr > td {
  padding: 6px 12px;
}
</style>
