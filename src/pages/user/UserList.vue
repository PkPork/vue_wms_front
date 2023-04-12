<template>
  <a-card :bordered="false" :style="{ minHeight: '560px' }">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="7" :sm="16">
            <a-form-item label="닉네임">
              <a-input-search
                v-model="queryParam.nickname"
                placeholder="닉네임을 입력해주세요"
                enter-button="검색"
                @search="search"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <div class="table-operator">
      <a-button type="primary" icon="plus" @click="exportExcel"
        >사용자 내려받기</a-button
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
          <a @click="handleInfo(record)"> <a-icon type="info-circle" />상세 </a>
        </template>
      </span>

      <span slot="nickname" slot-scope="text, record">
        <img
          style="width: 42px; height: 42px; border-radius: 50%"
          :src="record.avatarUrl"
        />
        <a-icon style="margin-left: 6px" v-if="record.gender == 1" type="man" />
        <a-icon
          style="margin-left: 6px"
          v-if="record.gender == 2"
          type="woman"
        />
        {{ record.nickname }}
      </span>

      <span slot="status" slot-scope="status">
        <a-badge
          :color="status | statusTypeFilter"
          :text="status | statusFilter"
        />
      </span>
    </s-table>
  </a-card>
</template>

<script>
import STable from "@/components/table";
import { getUserList, exportExcel } from "@/services/user";
import { statusMap } from "@/enums/user";
export default {
  name: "UserList",
  components: {
    STable,
  },
  data() {
    return {
      // 쿼리 매개변수
      queryParam: {},
      layout: {
        labelCol: { span: 4 },
        wrapperCol: { span: 14 },
      },
      visible: false,
      rolesMap: [],
      form: this.$form.createForm(this),
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
          title: "닉네임",
          dataIndex: "nickname",
          key: "nickname",
          scopedSlots: { customRender: "nickname" },
        },
        {
          title: "openid",
          dataIndex: "openid",
          key: "openid",
        },
        {
          title: "전화번호",
          dataIndex: "mobile",
          key: "mobile",
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
        this.queryParam = Object.assign({}, this.queryParam, parameter);
        return getUserList(this.queryParam).then((res) => {
          return res.data;
        });
      },
    };
  },
  created() {},
  filters: {
    statusFilter(status) {
      let res = statusMap.find((item) => {
        return item.id == status;
      });
      if (res) {
        return res.name;
      }
    },
    statusTypeFilter(type) {
      let res = statusMap.find((item) => {
        return item.id == type;
      });
      if (res) {
        return res.color;
      }
    },
  },
  methods: {
    search() {
      this.$refs.list.refresh(1);
    },
    exportExcel() {
      exportExcel(this.queryParam).then((res) => {
        let blob = new Blob([res]);
        let downloadElement = document.createElement("a");
        let href = window.URL.createObjectURL(blob); //다운로드 링크 만들기
        downloadElement.href = href;
        downloadElement.download = "사용자목록.xlsx"; //다운로드 후 파일 이름
        document.body.appendChild(downloadElement);
        downloadElement.click(); //다운로드하려면 클릭
        document.body.removeChild(downloadElement); //완전한 제거 요소 다운로드
        window.URL.revokeObjectURL(href); //blob파싱
      });
    },
    handleInfo(record) {
      this.$message.success("info");
    },
  },
};
</script>
