<template>
  <div id="components-form-demo-advanced-search">
    <a-spin :spinning="loading" size="large">
      <a-form class="ant-advanced-search-form">
        <a-row :gutter="24">
          <a-col :span="5" :style="{ }">
            <a-form-item label="자산번호">
              <a-input v-model="queryParam.asset_no" placeholde1="입력하세요." @keyup.enter="searchData" />
            </a-form-item>
          </a-col>
          <a-col :span="6" :style="{ }">
            <a-form-item label="시리얼번호">
              <a-input v-model="queryParam.serial_no" placeholde1="입력하세요." @keyup.enter="searchData" />
            </a-form-item>
          </a-col>
          <a-col :span="5" :style="{ }">
            <a-form-item label="모델정보">
              <a-select v-model="queryParam.model_code">
                <a-select-option :key="item.code" :value="item.code" v-for="(item, index) in PDA_MODEL_LIST">
                  {{ item.code_nm }}
                </a-select-option>
              </a-select>
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
            <a-col :span="6"><a-button type="primary" @click="gridAddRow" size="small"><a-icon type="plus-square"/>추가</a-button></a-col>
            <a-col :span="6"><a-button type="primary" @click="gridRemoveRow" size="small"><a-icon type="delete"/>삭제</a-button></a-col>
            <a-col :span="6"><a-button type="primary" @click="saveGrid" size="small"><a-icon type="save"/>저장</a-button></a-col>
            <a-col :span="6"><a-button type="primary" @click="downLoadExcel('grid1')" size="small"><a-icon type="file-excel"/>다운로드</a-button></a-col>
          </a-space>
        </a-row>
        <div style="{width: 100%;}">
          <AUIGrid ref="mstPdaGrid" class="grid-wrap"
                   @cellDoubleClick="cellClickHandler"
                   @cellEditBegin="cellEditBeginGrid"
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
import {getCmCodeLoad, getCmCodeLoadArray} from "@/services/common";

export default {

  components: {
    AUIGrid,
  },
  data: function () {
    return {
      loading: false,     //로딩바 유무
      PDA_MODEL_LIST: [],
      YESNO_LIST: [],
      // 쿼리 매개변수
      queryParam: {
        asset_no: "",
        model_code: "",
        serial_no: "",
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
        editable: true,
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
    const that = this //vue 객체
    //1. 공통코드 load
    //this.PDA_MODEL_LIST = await getCmCodeLoad('CTTYPE', '전체')
    //this.YESNO_LIST = await getCmCodeLoad('YESNO', '전체')

    //1.1 공통코드 배열형태로 들고오기
    const cm_code = await getCmCodeLoadArray(['PDA_MODEL'],'전체')
    this.PDA_MODEL_LIST = cm_code.PDA_MODEL



    console.log('PDA_MODEL_LIST====1111',this.PDA_MODEL_LIST)
    console.log('PDA_MODEL_LIST====1112',this.PDA_MODEL_LIST.filter(item => item.code != ""))

    //2. 컬럼 레이아웃 선언
    this.columnLayout = [
      { dataField: "ASSET_NO", headerText: "자산번호", headerStyle: "aui-grid-required-header", style: "", width: 180 },
      { dataField: "SERIAL_NO", headerText: "SERIAL번호", width: 140, style: "left-text " },
      { dataField: "MODEL_CODE", headerText: "모델정보", width: 120,
        labelFunction: function (rowIndex, columnIndex, value, headerText, item) {
          var labelvalue = '';
          for(var i=0; i < that.PDA_MODEL_LIST.length; i++){
            if(that.PDA_MODEL_LIST[i].code == value) labelvalue = that.PDA_MODEL_LIST[i].code_nm;
          }
          return labelvalue;
        },
        editRenderer: {
          type: "DropDownListRenderer",
          showEditorBtnOver: true, // 마우스 오버 시 에디터버턴 보이기
          list: this.PDA_MODEL_LIST.filter(item => item.code != ""), //key-value Object 로 구성된 리스트
          keyField: "code", // key 에 해당되는 필드명
          valueField: "code_nm", // value 에 해당되는 필드명
        },
      },
      { dataField: "USER_ID", headerText: "사용자", style: "left-text", width: 80,},
      { dataField: "REMARK", headerText: "비고", style: "left-text",},
      {dataField: "INSERTDATE", headerText: "등록일시", width: 135,editable:false,},
      {dataField: "INSERTURKEY", headerText: "등록자", width: 75,editable:false,},
      {dataField: "UPDATEDATE", headerText: "수정일시",width: 135,editable:false,},
      {dataField: "UPDATEURKEY", headerText: "수정자", width: 75,editable:false,},
    ]

    let mstPdaGrid = this.$refs.mstPdaGrid;
    mstPdaGrid.create(this.columnLayout, this.auigridProps);
    // 그리드 데이터 삽입하기
    mstPdaGrid.setGridData(this.gridData);

  },watch:{
    gridData: function (newVal, oldVal) {
      this.$refs.mstPdaGrid.setGridData(newVal);
    },
  }, created() {

  },
  methods: {
    searchData() {
      this.loading = true
      this.$gridCallUrl("/backed/mstpda/getMstPdaList",this.queryParam).then((res) => {
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
      this.$refs.mstPdaGrid.addRow(item, "last");
    },
    gridRemoveRow() {
      const list = this.$refs.mstPdaGrid.getCheckedRowItemsAll()
      if (list.length == 0) {
        this.$message.info('삭제할 행을 선택하세요.');
        return
      }
      // 체크된 행 삭제 처리
      this.$refs.mstPdaGrid.removeCheckedRows()
    }, cellClickHandler(event) {
      // 셀클릭 이벤트 핸들링

    },
    cellEditBeginGrid(event) {
      //해당 필드는 update 불가, add 시 입력가능
      return this.$gridEditable(this.$refs.mstPdaGrid, event, ["CTKEY"])
    }, saveGrid() {
      const data = this.$gridGetCudData(this.$refs.mstPdaGrid, ["CTKEY", "CTNAME", "CTTYPE"])
      if (data.length) {
        this.loading = true
        this.$gridCallUrl("/backed/mstpda/saveMstPda",data).then((res) => {
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
       this.$refs.mstPdaGrid.exportToXlsx({ isRowStyleFront: false,}) //엑셀다운로드 함수
    }, pageReset() {
      this.queryParam = {groupCd: "", groupNm: "", cttype: "",delyn:""}
      this.gridData = [];
    },
  }
}

</script>

<style lang="less" scoped>

</style>