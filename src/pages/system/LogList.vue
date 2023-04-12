<template>
  <div id="components-form-demo-advanced-search">
    <a-spin :spinning="loading" size="large">
      <a-form class="ant-advanced-search-form">
        <a-row :gutter="24">
          <a-col :span="8" :style="{ }">
            <a-form-item label="사용자">
              <a-input-group>
                <a-row :gutter="8">
                  <a-col :span="10">
                    <a-input-search placeholder="" enter-button @search="onSearchUserPopup"
                                    v-model="queryParam.user_id"/>
                  </a-col>
                  <a-col :span="14">
                    <a-input default-value="" v-model="queryParam.username" >
                      <a-icon slot="addonAfter" type="close-circle" @click="resetUserInfo"/>
                    </a-input>
                  </a-col>
                </a-row>
              </a-input-group>
              <!-- 품번 팝업 호출 -->
              <UserSearchPopup v-if="this.$store.state.modal.user_popup" :visible="this.$store.state.modal.user_popup"
                          :callType="'input'" @closepopItem="closePopupUser"></UserSearchPopup>
              <!-- 품번 팝업 호출 -->
            </a-form-item>
          </a-col>
          <a-col :span="8" :style="{ }">
            <a-form-item label="로그일자">
              <a-form-item :style="{ display: 'inline-block' }">
                <a-date-picker
                    :format="dateFormat"
                    v-model="queryParam.startTime"
                    style="width: 100%"
                />
              </a-form-item>
              <span
                  :style="{
                  display: 'inline-block',
                  width: '24px',
                  textAlign: 'center',
                }"
              >-</span
              >
              <a-form-item
                  :style="{ display: 'inline-block', width: 'calc(50% - 12px)' }"
              >
                <a-date-picker
                    :format="dateFormat"
                    v-model="queryParam.endTime"
                    style="width: 100%"
                />
              </a-form-item>
            </a-form-item>
          </a-col>
          <a-col :span="8" :style="{ textAlign: 'right' }">
            <a-button type="primary" @click="searchData">조회</a-button>
            <a-button :style="{ marginLeft: '8px' }" @click="pageReset">초기화</a-button>
          </a-col>
        </a-row>
      </a-form>

      <div class="search-result-list" style="{width: 100%;}">
        <a-row type="flex" justify="end" style="margin-top:10px; margin-bottom: 10px;">
          <a-space>
            <a-col :span="6"><a-button type="primary" @click="downLoadExcel('grid1')" size="small"><a-icon type="file-excel"/>다운로드</a-button></a-col>
          </a-space>
        </a-row>
        <div style="{width: 100%;}">
          <AUIGrid ref="logGrid" class="grid-wrap"
                   style="height:60vh;width: 100%;"
          >
          </AUIGrid>
        </div>
      </div>
    </a-spin>
  </div>

</template>

<script>
// AUIGrid 컴포넌트
import AUIGrid from "@/components/auigrid/import/AUIGrid-Vue.js/AUIGrid";
import {mapMutations} from "vuex";
import UserSearchPopup from "@/pages/components/modal/UserSearchPopup";
import moment from 'moment';

export default {

  components: {
    UserSearchPopup,
    AUIGrid,
  },
  data: function () {
    return {
      dateFormat: "YYYY-MM-DD",
      loading: false,     //로딩바 유무
      // 쿼리 매개변수
      queryParam: {
        user_id:"",
        username:"",
        startTime:this.$AFTER_DAY(-7),
        endTime:this.$TODAY(),
      },
      // 그리드 칼럼 레이아웃 정의
      columnLayout: [],

      // 그리드 속성 정의
      auigridProps: {
        noDataMessage:"조회된 데이터가 없습니다.",
        // 엑스트라 체크박스 표시 설정
        showRowCheckColumn: true,
        // 엑스트라 체크박스에 shiftKey + 클릭으로 다중 선택 할지 여부 (기본값 : false)
        enableRowCheckShiftKey: true,
        // 전체 체크박스 표시 설정
        showRowAllCheckBox: true,
        // 편집 가능 여부 (기본값 : false)
        editable: false,
        // 셀 선택모드 (기본값: singleCell)
        selectionMode: "multipleCells",
        //필터사용유무
        enableFilter: true,
      },

      // 그리드 데이터
      gridData: [],

    }

  },

  async beforeMount() {

  },
  async mounted() {
    console.log('this.$TODAY == ',this.$TODAY())
    console.log('startTime == ',this.queryParam.startTime)

    //1. 공통코드 load

    //2. 컬럼 레이아웃 선언
    this.columnLayout = [
      { dataField: "ID", headerText: "ID", style: "", width: 80 },
      { dataField: "OPERATION_USERNAME", headerText: "실행자", style: "", width: 80 },
      { dataField: "URL", headerText: "URL", style: "left-text", width: 300 },
      { dataField: "METHOD", headerText: "함수", style: "", width: 80 },
      { dataField: "PARAMS", headerText: "파라미터", style: "left-text",width: 600 },
      { dataField: "BROWSER", headerText: "브라우저", style: "", width: 100 },
      { dataField: "IP", headerText: "IP", style: "", width: 80 },
      { dataField: "TAKE_TIME", headerText: "실행시간", style: "", width: 80 },
      { dataField: "CREATED_TIME", headerText: "실행일시", style: "" },
    ]

    let logGrid = this.$refs.logGrid;
    logGrid.create(this.columnLayout, this.auigridProps);
    // 그리드 데이터 삽입하기
    logGrid.setGridData(this.gridData);

  },watch:{
    gridData: function (newVal, oldVal) {
      this.$refs.logGrid.setGridData(newVal);
    },
  }, created() {

  },
  methods: {
    ...mapMutations('modal', ['setUser_popup']),
    searchData() {
      this.loading = true
      this.$gridCallUrl("/backed/syslog/getSysOperationLogList",this.queryParam).then((res) => {
        console.log('res.data===',res.data)
        // 실제로 새로 고침이 빨라서 setTimeout 으로 약간의 시간을 두는중.
        setTimeout(() => this.loading = false, this.$gridDelayTime)
        this.gridData = res.data
      })
    }, downLoadExcel(id) {
      // 내보내기 실행
      this.$refs.logGrid.exportToXlsx({ isRowStyleFront: false,}) //엑셀다운로드 함수
    }, pageReset() {
      this.queryParam.user_id = ''
      this.queryParam.username = ''
      this.queryParam.startTime = ''
      this.queryParam.endTime  =  ''
      this.gridData = [];
    },onSearchUserPopup() {
      this.setUser_popup(true)
    },resetUserInfo() {
      this.queryParam.user_id  = ''
      this.queryParam.username = ''
    },closePopupUser(event){
      this.queryParam.user_id  = event.USER_ID
      this.queryParam.username = event.NAME
      this.setUser_popup(false)
      console.log('@@@@@@@####################')
    }
  }
}

</script>

<style lang="less" scoped>

</style>