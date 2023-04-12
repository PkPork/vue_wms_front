<template>
  <div id="components-form-demo-advanced-search">
    <a-spin :spinning="loading" size="large">
      <a-form class="ant-advanced-search-form">
        <a-row :gutter="24">
          <a-col :span="5" :style="{ }">
            <a-form-item label="센터코드">
              <a-input v-model="queryParam.ctkey" placeholde1="입력하세요." @keyup.enter="searchData" />
            </a-form-item>
          </a-col>
          <a-col :span="6" :style="{ }">
            <a-form-item label="센터명">
              <a-input v-model="queryParam.ctname" placeholde1="입력하세요." @keyup.enter="searchData" />
            </a-form-item>
          </a-col>
          <a-col :span="5" :style="{ }">
            <a-form-item label="센터유형">
              <a-select v-model="queryParam.cttype">
                <a-select-option :key="item.code" :value="item.code" v-for="(item, index) in CTTYPE_LIST">
                  {{ item.code_nm }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="5" :style="{ }">
            <a-form-item label="삭제 여부">
              <a-select v-model="queryParam.delyn">
                <a-select-option :key="item.code" :value="item.code" v-for="(item, index) in YESNO_LIST">
                  {{ item.code_nm }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="3" :style="{ textAlign: 'right' }">
            <a-button type="primary" @click="searchData">조회</a-button>
            <a-button :style="{ marginLeft: '8px' }" @click="pageReset">초기화</a-button>
          </a-col>
        </a-row>
      </a-form>

      <div class="search-result-list" style="{width: 100%;}">
        <a-row type="flex" justify="end" style="margin-top:10px; margin-bottom: 10px;">
          <a-space>
            <a-col :span="6"><a-button type="primary" @click="gridAddRow" size="small"><a-icon type="plus-square"/>추가</a-button></a-col>
            <a-col :span="6"><a-button type="primary" @click="gridRemoveRow" size="small"><a-icon type="delete"/>삭제</a-button></a-col>
            <a-col :span="6"><a-button type="primary" @click="saveGrid" size="small"><a-icon type="save"/>저장</a-button></a-col>
            <a-col :span="6"><a-button type="primary" @click="downLoadExcel('grid1')" size="small"><a-icon type="file-excel"/>다운로드</a-button></a-col>
          </a-space>
        </a-row>
        <div style="{width: 100% !important;}">
          <AUIGrid ref="codeGrpGrid" class="grid-wrap one_search_one_grid_height"
                   @cellDoubleClick="cellClickHandler"
                   @cellEditBegin="cellEditBeginGrid"

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
import {getCmCodeLoad, getCmCodeLoadArray} from "@/services/common";

export default {

  components: {
    AUIGrid,
  },
  data: function () {
    return {
      loading: false,     //로딩바 유무
      CTTYPE_LIST: [],
      YESNO_LIST: [],
      // 쿼리 매개변수
      queryParam: {
        ctkey: "",
        ctname: "",
        cttype: "",
        delyn: "",
      },
      // 그리드 칼럼 레이아웃 정의
      columnLayout: [],

      // 그리드 속성 정의 default 그리드 프로퍼티 사용
      auigridProps: this.$DEFAULT_GRID_PROP,

      // 그리드 데이터
      gridData: [],

    }

  },

  async beforeMount() {

  },
  async mounted() {
    const that = this  //vue 객체
    //1. 공통코드 load
    //this.CTTYPE_LIST = await getCmCodeLoad('CTTYPE', '전체')
    //this.YESNO_LIST = await getCmCodeLoad('YESNO', '전체')

    //1.1 공통코드 배열형태로 들고오기
    const cm_code = await getCmCodeLoadArray(['YESNO','CTTYPE'],'전체')
    this.CTTYPE_LIST = cm_code.CTTYPE
    this.YESNO_LIST  = cm_code.YESNO
    
    //2. 컬럼 레이아웃 선언
    this.columnLayout = [
      { dataField: "CTKEY", headerText: "센터 코드", headerStyle: "aui-grid-required-header", style: "", width: 80 },
      { dataField: "CTNAME", headerText: "센터명", headerStyle: "aui-grid-required-header", width: 140, style: "left-text " },
      { dataField: "CTTYPE", headerText: "센터유형", headerStyle: "aui-grid-required-header", width: 120,
        labelFunction: function (rowIndex, columnIndex, value, headerText, item) {
          var labelvalue = '';
          for(var i=0; i < that.CTTYPE_LIST.length; i++){
            if(that.CTTYPE_LIST[i].code == value) labelvalue = that.CTTYPE_LIST[i].code_nm;
          }
          return labelvalue;
        },
        editRenderer: {
          type: "DropDownListRenderer",
          showEditorBtnOver: true, // 마우스 오버 시 에디터버턴 보이기
          list: this.CTTYPE_LIST.filter(item => item.code != ""), //key-value Object 로 구성된 리스트
          keyField: "code", // key 에 해당되는 필드명
          valueField: "code_nm", // value 에 해당되는 필드명
        },
      },
      { dataField: "ZIPCODE", headerText: "우편번호", style: "left-text", width: 80,},
      { dataField: "ADDRESS1", headerText: "기본주소", style: "left-text",width: 150,},
      { dataField: "ADDRESS2", headerText: "상세주소", style: "left-text",width: 150,},
      { dataField: "TEL", headerText: "전화번호", style: "left-text",width: 100,},
      { dataField: "REGNO", headerText: "사업자등록 번호", style: "left-text",width: 120,},
      { dataField: "CLOSINGDATE",
        headerText: "종료일자",
        dataType: "date",
        dateInputFormat: "yyyy-mm-dd", // 실제 데이터의 형식 지정
        formatString: "yyyy년 mm월 dd일", // 실제 데이터 형식을 어떻게 표시할지 지정
        width: 130,
        editRenderer: {
          type: "CalendarRenderer",
          defaultFormat: "yyyy-mm-dd", // 달력 선택 시 데이터에 적용되는 날짜 형식
          showEditorBtnOver: true, // 마우스 오버 시 에디터버턴 출력 여부
          onlyCalendar: false, // 사용자 입력 불가, 즉 달력으로만 날짜입력 (기본값 : true)
          showExtraDays: true, // 지난 달, 다음 달 여분의 날짜(days) 출력
          showTodayBtn: true, // 오늘 날짜 선택 버턴 출력
          showUncheckDateBtn: true, // 날짜 선택 해제 버턴 출력
          todayText: "오늘 선택", // 오늘 날짜 버턴 텍스트
          uncheckDateText: "날짜 선택 해제", // 날짜 선택 해제 버턴 텍스트
          uncheckDateValue: "-", // 날짜 선택 해제 버턴 클릭 시 적용될 값.
        }
      },
      { dataField: "WK_START_TIME", headerText: "작업 시작 시간", style: "left-text",width: 100,},
      { dataField: "DELYN", headerText: "삭제여부", headerStyle: "aui-grid-required-header", width: 120,
        labelFunction: function (rowIndex, columnIndex, value, headerText, item) {
          var labelvalue = '';
          for(var i=0; i < that.YESNO_LIST.length; i++){
            if(that.YESNO_LIST[i].code == value) labelvalue = that.YESNO_LIST[i].code_nm;
          }
          return labelvalue;
        },
        editRenderer: {
          type: "DropDownListRenderer",
          showEditorBtnOver: true, // 마우스 오버 시 에디터버턴 보이기
          list: this.YESNO_LIST.filter(item => item.code != ""), //key-value Object 로 구성된 리스트
          keyField: "code", // key 에 해당되는 필드명
          valueField: "code_nm", // value 에 해당되는 필드명
        },
      },
      {dataField: "INSERTDATE", headerText: "등록일시", width: 135,},
      {dataField: "INSERTURKEY", headerText: "등록자", width: 75,},
      {dataField: "UPDATEDATE", headerText: "수정일시",width: 135,},
      {dataField: "UPDATEURKEY", headerText: "수정자", width: 75,},
    ]

    let codeGrpGrid = this.$refs.codeGrpGrid;
    codeGrpGrid.create(this.columnLayout, this.auigridProps);
    // 그리드 데이터 삽입하기
    codeGrpGrid.setGridData(this.gridData);

  },watch:{
    gridData: function (newVal, oldVal) {
      this.$refs.codeGrpGrid.setGridData(newVal);
    },
  }, created() {

  },
  methods: {
    searchData() {
      this.loading = true
      this.$gridCallUrl("/backed/mstct/getMstCtList",this.queryParam).then((res) => {
        console.log('res.data===',res.data)
        // 실제로 새로 고침이 빨라서 setTimeout 으로 약간의 시간을 두는중.
        setTimeout(() => this.loading = false, this.$gridDelayTime)
        this.gridData = res.data
      })
    },
    gridAddRow() {
      // 하단에 1행 추가
      console.log('행추가 !!')
      let item = {CTTYPE:"1",DELYN: "N", row_status: 'I'};
      this.$refs.codeGrpGrid.addRow(item, "last");
    },
    gridRemoveRow() {
      const list = this.$refs.codeGrpGrid.getCheckedRowItemsAll()
      if (list.length == 0) {
        this.$message.info('삭제할 행을 선택하세요.');
        return
      }
      // 체크된 행 삭제 처리
      this.$refs.codeGrpGrid.removeCheckedRows()
    }, cellClickHandler(event) {
      // 셀클릭 이벤트 핸들링

    },
    cellEditBeginGrid(event) {
      //해당 필드는 update 불가, add 시 입력가능
      return this.$gridEditable(this.$refs.codeGrpGrid, event, ["CTKEY"])
    }, saveGrid() {
      const data = this.$gridGetCudData(this.$refs.codeGrpGrid, ["CTKEY", "CTNAME", "CTTYPE"])
      if (data.length) {
        this.loading = true
        this.$gridCallUrl("/backed/mstct/saveMstCt",data).then((res) => {
          console.log('res====', res)
          this.$message.success('저장완료');
          this.searchData()
        }, error => {
          this.loading = false
          console.log('saveMaster error ==== ', error)
        })
      }
    }, downLoadExcel(id) {
      // 내보내기 실행
       this.$refs.codeGrpGrid.exportToXlsx({ isRowStyleFront: false,}) //엑셀다운로드 함수
    }, pageReset() {
      this.queryParam = {groupCd: "", groupNm: "", cttype: "",delyn:""}
      this.gridData = [];
    },
  }
}

</script>

<style lang="less" scoped>

</style>