<template>
  <div :style="{ minHeight: '800px' }">
    <a-spin :spinning="loading" size="large">
      <a-form layout="horizontal">
        <a-row type="flex">
          <a-col :span="24" :xl="6" flex="auto">
              <a-form-item
                  label="메뉴코드"
                  :labelCol="{span: 5}"
                  :wrapperCol="{span: 18, offset: 1}"
              >
                <a-input v-model="queryParam.id" @keyup.enter="searchData" placeholder="입력하세요."/>
              </a-form-item>
          </a-col>
          <a-col :span="24" :xl="6" flex="auto">
            <a-form-item
                label="메뉴명"
                :labelCol="{span: 5}"
                :wrapperCol="{span: 18, offset: 1}"
            >
              <a-input v-model="queryParam.name" @keyup.enter="searchData" placeholder="입력하세요." />
            </a-form-item>
          </a-col>
          <a-col :span="24" :xl="6" flex="auto">
            <a-form-item
                label="사용여부"
                :labelCol="{span: 5}"
                :wrapperCol="{span: 18, offset: 1}"
            >
              <a-select v-model="queryParam.use_yn" placeholder="선택하세요.">
                <a-select-option :key="item.code" :value="item.code" v-for="(item, index) in useYnList">
                  {{ item.code_nm }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="24" :xl="6" flex="180px">
            <span style="float: right; margin-top: 3px;">
              <a-button type="primary" icon="search" @click="searchData" :loading="loading">조회</a-button>
              <a-button style="margin-left: 8px" @click="pageReset">초기화</a-button>
            </span>
        </a-col>
      </a-row>
      </a-form>

      <a-row type="flex" justify="end" style="margin-top:10px; margin-bottom: 10px;">
        <a-space>
            <a-button type="primary" @click="addRowLow" size="small">
              <a-icon type="plus-square"/>
              추가
            </a-button>
            <a-button type="primary" @click="removeRow" size="small">
              <a-icon type="delete"/>
              삭제
            </a-button>
            <a-button type="primary" @click="saveRow" size="small">
              <a-icon type="save"/>
              저장
            </a-button>
        </a-space>
      </a-row>

      <a-row >
        <a-col :span="24">
          <AUIGrid ref="mstMenuGrid" class="grid-wrap"
                   @cellEditBegin="CellEditBegin"
                   style="height:65vh"
                   v-model="gridData"
          >
          </AUIGrid>
        </a-col>
      </a-row>
    </a-spin>
    </div>
</template>

<script>
// AUIGrid 컴포넌트
import AUIGrid from "@/components/auigrid/import/AUIGrid-Vue.js/AUIGrid";
import {getCmCodeLoad} from "@/services/common";
import {getMenuList, getMenus, saveMenuList} from "@/services/system";

export default {
  components: {
    AUIGrid
  },
  data: function () {
    return {
      loading: false,     //로딩바 유무
      useYnList: [],
      // 쿼리 매개변수
      queryParam: {useYn: ""},
      columnLayout: [],
      // 그리드 속성 정의
      auigridProps: {
        // 편집 가능 여부 (기본값 : false)
        editable: true,

        // 트리관련 설정
        displayTreeOpen : true,

        // 엑스트라 체크박스 표시 설정
        showRowCheckColumn: true,

        // 전체 체크박스 표시 설정
        showRowAllCheckBox: true,

        // 셀 선택모드 (기본값: singleCell)
        selectionMode: "singleCell",
        showStateColumn: true,

        flat2tree : true,
        // 트리의 고유 필드명
        treeIdField : "id",
        // 계층 구조에서 내 부모 행의 treeIdField 참고 필드명
        treeIdRefField : "parent_id"
      },

      // 그리드 데이터
      gridData: []
    }

  },
  beforeMount() {

  },
  async mounted() {

    this.useYnList = await getCmCodeLoad('USEYN', '선택')

    // 그리드 칼럼 레이아웃 정의
    this.columnLayout = [
      {dataField: "id", headerText: "ID", width: 120, headerStyle: "aui-grid-required-header"},
      {dataField: "name", headerText: "메뉴명", width: 120, headerStyle: "aui-grid-required-header"},
      {dataField: "path", headerText: "경로", width: 120, headerStyle: "aui-grid-required-header"},
      {dataField: "component", headerText: "컴포넌트명", width: 80},
      {
        dataField: "invisible", headerText: "숨김여부", width: 120,
        renderer: {
          type: "DropDownListRenderer",
          list: this.useYnList, //key-value Object 로 구성된 리스트
          keyField: "data1", // key 에 해당되는 필드명
          valueField: "code_nm" // value 에 해당되는 필드명
        },
      },
      {dataField: "cache_able", headerText: "페이지캐시", width: 80,
        renderer: {
          type: "DropDownListRenderer",
          list: this.useYnList, //key-value Object 로 구성된 리스트
          keyField: "data1", // key 에 해당되는 필드명
          valueField: "code_nm" // value 에 해당되는 필드명
        },
      },
      {dataField: "sort", headerText: "정렬순서", width: 80, headerStyle: "aui-grid-required-header"}
    ]

    let grid = this.$refs.mstMenuGrid;

    // 그리드 생성
    grid.create(this.columnLayout, this.auigridProps);

    // 그리드 데이터 삽입하기
    grid.setGridData(this.gridData);
  },
  watch:{
    gridData: function (newVal, oldVal) {
      this.$refs.mstMenuGrid.setGridData(newVal);
    },
  },
  methods: {
    pageReset(){
      //페이지 초기화
      console.log('페이지 초기화')
      this.queryParam = {useYn: ""}
      this.gridData = [];
    },
    searchData() {
      console.log('조회를 시작합니다.', this.queryParam);
      this.loading = true
      return getMenuList(Object.assign(this.queryParam)).then(
          (res) => {
            this.$refs.mstMenuGrid.setGridData(res.data);
            setTimeout(() => this.loading = false, this.$gridDelayTime)
          }
      )
    },
    CellEditBegin(event) {
      //해당 필드는 update 불가, add 시 입력가능
      return this.$gridEditable(this.$refs.mstMenuGrid,event,["id"])
    },
    addRowLow() {
      if(this.$refs.mstMenuGrid.getSelectedItems().length == 0) {
        this.$message.warning("하위에 추가 행을 먼저 선택하여 주세요.");
        return false;
      }

      let item;

      if(this.$refs.mstMenuGrid.getSelectedItems()[0]["rowIndex"] == 0) {
        item = {row_status:'I', use_yn:'Y', parent_id:this.$refs.mstMenuGrid.getSelectedItems()[0]["item"]["parent_id"]}
        this.$refs.mstMenuGrid.addRow(item, "last")
      } else {
        item = {row_status:'I', use_yn:'Y', parent_id:this.$refs.mstMenuGrid.getSelectedItems()[0]["item"]["id"]}
        this.$refs.mstMenuGrid.addTreeRow(item, this.$refs.mstMenuGrid.getSelectedItems()[0]["rowIdValue"],"selectionDown")
      }
    },
    removeRow() {
      const list = this.$refs.mstMenuGrid.getCheckedRowItemsAll()
      if(list.length == 0){
        this.$message.info('삭제할 행을 선택하세요.');
        return
      }
      this.$refs.mstMenuGrid.removeCheckedRows()
    },
    saveRow() {
      const data = this.$gridGetCudData(this.$refs.mstMenuGrid,["name", "path", "component"])

      if(data.length){
        saveMenuList(data).then(
            (res) => {
              console.log('res====', res)
              if (res.code == 200) {
                this.searchData()
              } else {
                this.$message.error(res.message);
              }
              //return res.data;
            },
            error => {
              console.log('error ==== ', error)
            }
        )
      }
    },
  }
}

</script>

<style lang="less" scoped>

</style>