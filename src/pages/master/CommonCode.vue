<template>
  <div id="components-form-demo-advanced-search">
    <a-spin :spinning="loading" size="large">
      <a-form class="ant-advanced-search-form">
        <a-row :gutter="24">
          <a-col :span="7" :style="{ }">
            <a-form-item label="그룹코드" >
              <a-input v-model="queryParam.groupCd" @keyup.enter="searchMaster" placeholde1="입력하세요."/>
            </a-form-item>
          </a-col>
          <a-col :span="7" :style="{ }">
            <a-form-item label="그룹코드명">
              <a-input v-model="queryParam.groupNm" @keyup.enter="searchMaster" placeholde1="입력하세요."/>
            </a-form-item>
          </a-col>
          <a-col :span="7" :style="{ }">
            <a-form-item label="사용여부">
              <a-select v-model="queryParam.useYn">
                <a-select-option :key="item.code" :value="item.code" v-for="(item, index) in useYnList">
                  {{ item.code_nm }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="3" :style="{ textAlign: 'right' }">
            <a-button type="primary" @click="searchMaster">조회</a-button>
            <a-button :style="{ marginLeft: '8px' }" @click="pageReset">초기화</a-button>
          </a-col>
        </a-row>
      </a-form>

      <div class="search-result-list" style="{width: 100%;}">
        <a-row>
          <a-col :span="10"   >
            <a-row >
              <a-col :span="5" style="text-align: left;" class="sub_title"  >
                그룹코드
              </a-col>
              <a-col :span="19" style="text-align: right;">
                <a-space>
                  <a-button type="primary" @click="masterAddRow" size="small"><a-icon type="plus-square"/>추가</a-button>
                  <a-button type="primary" @click="masterRemoveRow" size="small"><a-icon type="delete"/>삭제</a-button>
                  <a-button type="primary" @click="saveMaster" size="small"><a-icon type="save"/>저장</a-button>
                  <a-button type="primary" @click="downLoadExcel('grid1')" size="small"><a-icon type="file-excel"/>다운로드</a-button>
                </a-space>
              </a-col>
            </a-row>
            <a-row>
              <a-col :span="24">
                <AUIGrid ref="codeGrpGrid" class="grid-wrap"
                         @cellDoubleClick="cellClickHandler"
                         @cellEditBegin="cellEditBeginMaster"
                         style="height:62vh;width: 100%; float: left;"
                >
                </AUIGrid>
              </a-col>
            </a-row>
          </a-col>

          <a-col :span="14"    >
            <a-row >
              <a-col :span="5" style="text-align: left;padding-left: 30px;" class="sub_title" >
                상세코드
              </a-col>
              <a-col :span="19" style="text-align: right;">
                <a-space>
                  <a-button type="primary" @click="detailAddRow" size="small" ><a-icon type="plus-square"/>추가</a-button>
                  <a-button type="primary" @click="detailRemoveRow" size="small"><a-icon type="delete"/>삭제</a-button>
                  <a-button type="primary" @click="saveDetail" size="small"><a-icon type="save"/>저장</a-button>
                  <a-button type="primary" @click="downLoadExcel('grid2')" size="small"><a-icon type="file-excel"/>다운로드</a-button>
                </a-space>
              </a-col>
            </a-row>
            <a-row>
              <a-col :span="24">
                <AUIGrid ref="codeGrid" class="grid-wrap"
                         style="height:62vh;width: 97%;float: right;"
                         @cellEditBegin="cellEditBeginDetail"
                >
                </AUIGrid>
              </a-col>
            </a-row>
          </a-col>
        </a-row>


      </div>
    </a-spin>
  </div>

</template>

<script>
// AUIGrid 컴포넌트
import AUIGrid from "@/components/auigrid/import/AUIGrid-Vue.js/AUIGrid";
import {getCmCodeLoad} from "@/services/common";

export default {

  components: {
    AUIGrid,
  },
  data: function () {
    return {
      loading: false,     //로딩바 유무
      masterRow: {},      //그룹코드 정보
      useYnList: [],
      // 쿼리 매개변수
      queryParam: {
        groupCd: "",
        groupNm: "",
        useYn: "",
      },
      // 그리드 칼럼 레이아웃 정의
      columnLayoutHD: [],
      columnLayoutDT: [],

      // 그리드 속성 정의
      auigridPropsHD: {
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
      // 그리드 속성 정의
      auigridPropsDT: {
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
        // fixedColumnCount: 3
      },

      // 그리드 데이터
      gridDataHD: [],
      gridDataDT: [],

    }

  },

  async beforeMount() {

  },
  async mounted() {
    const that = this //vue 객체

    this.useYnList = await getCmCodeLoad('USE_YN', '전체')
    this.columnLayoutHD = [
      { dataField: "group_cd", headerText: "그룹코드", headerStyle: "aui-grid-required-header", style: "column-link-css left-text", width: 120 },
      { dataField: "group_nm", headerText: "그룹코드명", headerStyle: "aui-grid-required-header", width: 140, style: "left-text " },
      { dataField: "use_yn", headerText: "사용여부", headerStyle: "aui-grid-required-header", width: 120,
        labelFunction: function (rowIndex, columnIndex, value, headerText, item) {
          var labelvalue = '';
          for(var i=0; i < that.useYnList.length; i++){
            if(that.useYnList[i].code == value) labelvalue = that.useYnList[i].code_nm;
          }
          return labelvalue;
        },
        editRenderer: {
          type: "DropDownListRenderer",
          showEditorBtnOver: true, // 마우스 오버 시 에디터버턴 보이기
          list: this.useYnList.filter(item => item.code != ""), //key-value Object 로 구성된 리스트
          keyField: "code", // key 에 해당되는 필드명
          valueField: "code_nm", // value 에 해당되는 필드명
        },
      },
      {dataField: "rem", headerText: "비고", style: "left-text",}
    ]

    this.columnLayoutDT = [
      { dataField: "code", headerStyle: "aui-grid-required-header", headerText: "코드ID", filter: {showIcon: true}, width: 120 },
      { dataField: "code_nm", headerStyle: "aui-grid-required-header", headerText: "코드명", filter: {showIcon: true}, width: 140 },
      { dataField: "sort", headerText: "정렬", width: 100, dataType: "numeric", editable: true,
        renderer: {
          type: "NumberStepRenderer",
          min: 1,
          max: 99,
          step: 1,
          inputHeight: 25, // input 높이 지정
          textEditable: true
        },
      },
      { dataField: "use_yn", headerText: "사용여부", width: 120,
        labelFunction: function (rowIndex, columnIndex, value, headerText, item) {
          var labelvalue = '';
          for(var i=0; i < that.useYnList.length; i++){
            if(that.useYnList[i].code == value) labelvalue = that.useYnList[i].code_nm;
          }
          return labelvalue;
        },
        editRenderer: {
          type: "DropDownListRenderer",
          showEditorBtnOver: true, // 마우스 오버 시 에디터버턴 보이기
          list: this.useYnList.filter(item => item.code != ""), //key-value Object 로 구성된 리스트
          keyField: "code", // key 에 해당되는 필드명
          valueField: "code_nm", // value 에 해당되는 필드명
        },
      },
      {dataField: "data1", headerText: "속성1", width: 120},
      {dataField: "data2", headerText: "속성2", width: 120},
      {dataField: "data3", headerText: "속성3", width: 120},
      {dataField: "data4", headerText: "속성4", width: 120},
      {dataField: "data5", headerText: "속성5", width: 120},
      {dataField: "data6", headerText: "속성6", width: 120},
      {dataField: "data7", headerText: "속성7", width: 120},
    ]

    let codeGrpGrid = this.$refs.codeGrpGrid;
    let codeGrid = this.$refs.codeGrid;

    // 그리드 생성

    codeGrpGrid.create(this.columnLayoutHD, this.auigridPropsHD);
    codeGrid.create(this.columnLayoutDT, this.auigridPropsDT);

    // 그리드 데이터 삽입하기
    codeGrpGrid.setGridData(this.gridDataHD);
    codeGrid.setGridData(this.gridDataDT);

  },watch:{
    gridDataHD: function (newVal, oldVal) {
      this.$refs.codeGrpGrid.setGridData(newVal);
    },
    gridDataDT: function (newVal, oldVal) {
      this.$refs.codeGrid.setGridData(newVal);
    },
  }, created() {

  },
  methods: {
    searchMaster() {
      this.loading = true
      this.$gridCallUrl("/backed/commoncode/getCmCodeGrpList",this.queryParam).then((res) => {
            // 실제로 새로 고침이 빨라서 setTimeout 으로 약간의 시간을 두는중.
            setTimeout(() => this.loading = false, this.$gridDelayTime)
            this.gridDataDT = []
            this.masterRow  = {}
            this.gridDataHD = res.data
      })
    }, searchDetail() {
      this.loading = true
      this.$gridCallUrl("/backed/commoncode/getCmCodeList",this.masterRow).then((res) => {
          setTimeout(() => this.loading = false, this.$gridDelayTime)
            this.gridDataDT = res.data
      })
    },
    masterAddRow() {
      // 하단에 1행 추가
      console.log('행추가 !!')
      let item = {use_yn: "Y", row_status: 'I'};
      this.$refs.codeGrpGrid.addRow(item, "last");
      this.$refs.codeGrid.clearGridData();
    },
    masterRemoveRow() {
      const list = this.$refs.codeGrpGrid.getCheckedRowItemsAll()
      if (list.length == 0) {
        this.$message.info('삭제할 행을 선택하세요.');
        return
      }
      // 체크된 행 삭제 처리
      this.$refs.codeGrpGrid.removeCheckedRows()
    },
    detailAddRow() {
      console.log('this.masterRow====',this.masterRow.group_cd)
      if (this.masterRow.group_cd) {
        let item = {use_yn: "Y", row_status: 'I', group_cd: this.masterRow.group_cd, sort: 0}
        this.$refs.codeGrid.addRow(item, "last")
      } else {
        this.$message.warn('그룹코드를 선택하세요.', 3)
      }
      console.log('test == ', this.masterRow)
    },
    detailRemoveRow() {
      const list = this.$refs.codeGrid.getCheckedRowItemsAll()
      if (list.length == 0) {
        this.$message.info('삭제할 행을 선택하세요.');
        return
      }
      // 체크된 행 삭제 처리
      this.$refs.codeGrid.removeCheckedRows()
    }, cellClickHandler(event) {
      // 셀클릭 이벤트 핸들링
      if (event.dataField == "group_cd" && event.item.row_status != "I") {
        this.masterRow = event.item
        this.searchDetail()
      } else {
        this.$refs.codeGrid.clearGridData();
      }
    },
    cellEditBeginMaster(event) {
      //해당 필드는 update 불가, add 시 입력가능
      return this.$gridEditable(this.$refs.codeGrpGrid, event, ["group_cd"])
    }, cellEditBeginDetail(event) {
      //해당 필드는 update 불가, add 시 입력가능
      return this.$gridEditable(this.$refs.codeGrid, event, ["code"])
    }, saveMaster() {
      const data = this.$gridGetCudData(this.$refs.codeGrpGrid, ["group_cd", "code", "code_nm"])
      if (data.length) {
        this.loading = true
        this.$gridCallUrl("/backed/commoncode/saveCmCodeGrp",data).then((res) => {
                 console.log('res====', res)
                this.$message.success('저장완료');
                this.searchMaster()
            }, error => {
              console.log('saveMaster error ==== ', error)
        })
      }
    }, saveDetail() {
      const rows = this.$gridGetCudData(this.$refs.codeGrid, ["code", "code_nm"])
      const data = rows.map(item =>({
        ...item,group_cd:this.masterRow.group_cd
      }))
      if (data.length > 0) {
        this.loading = true
        this.$gridCallUrl("/backed/commoncode/saveCmCode",data).then((res) => {
              console.log('res====', res)
              this.$message.success('저장완료');
              this.searchDetail()
              //return res.data;
            }, error => {
              console.log('error ==== ', error)
        })
      }
    }, downLoadExcel(id) {

      // 내보내기 실행
      if (id == "grid1") {
        this.$refs.codeGrpGrid.exportToXlsx({ isRowStyleFront: false,fileName : "그룹코드_엑셀자료",}) //엑셀다운로드 함수
      } else {
        this.$refs.codeGrid.exportToXlsx({ isRowStyleFront: false,fileName : "상세코드_엑셀자료",})  //엑셀다운로드 함수
      }
    }, pageReset() {
      this.queryParam = {groupCd: "", groupNm: "", useYn: ""}
      this.gridDataHD = [];
      this.gridDataDT = [];
    },
  }
}

</script>

<style lang="less" scoped>

</style>