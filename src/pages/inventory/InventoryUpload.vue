<template>
  <div id="components-form-demo-advanced-search">
    <a-spin :spinning="loading" size="large">
      <a-form class="ant-advanced-search-form">
        <a-row :gutter="24">
          <a-col :span="6" :style="{ }">
            <a-form-item label="업로드 상태">
              <a-select v-model="queryParam.ifstatus">
                <a-select-option :key="item.code" :value="item.code" v-for="(item, index) in UPLOAD_STATUS_LIST">
                  {{ item.code_nm }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="18" :style="{ textAlign: 'right' }">
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
            <a-col :span="6"><a-button type="primary" @click="confirmInventoryUpload" size="small"><a-icon type="check" />재고확정</a-button></a-col>
            <a-col :span="6"><a-button type="primary" @click="downLoadExcel('grid1')" size="small"><a-icon type="file-excel"/>다운로드</a-button></a-col>
            <a-col :span="6"><a-button type="primary" @click="downLoadExcel('grid1')" size="small"><a-icon type="upload" />엑셀업로드</a-button></a-col>
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
      UPLOAD_STATUS_LIST: [],
      // 쿼리 매개변수
      queryParam: {
        ifstatus: "",
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

    //1.1 공통코드 배열형태로 들고오기
    const cm_code = await getCmCodeLoadArray(['UPLOAD_STATUS'],'전체')
    this.UPLOAD_STATUS_LIST = cm_code.UPLOAD_STATUS

    //2. 컬럼 레이아웃 선언
    this.columnLayout = [

      { dataField: "ICKEY", headerText: "품목 코드", headerStyle: "aui-grid-required-header",style: "left-text", width: 120,},
      { dataField: "ICNAME", headerText: "품목명", style: "left-text", width: 180, editable:false,},
      { dataField: "LCKEY", headerText: "로케이션 코드", headerStyle: "aui-grid-required-header", width: 120,},
      { dataField: "ULCKEY", headerText: "바코드", style: "left-text", width: 180,},
      { dataField: "QTY", headerText: "수량", headerStyle: "aui-grid-required-header",style: "right-text", width: 100,dataType : "numeric", formatString: "#,###",},
      { dataField: "ICUTKEY", headerText: "상품 단위 코드", headerStyle: "aui-grid-required-header",style: "left-text", width: 100,},
      { dataField: "UOM", headerText: "재고단위", headerStyle: "aui-grid-required-header",style: "left-text", width: 100,},
      { dataField: "PRODUCTDATE", headerText: "생산 일자", style: "left-text", width: 100,},
      { dataField: "EXPIREDATE", headerText: "유효 일자", style: "left-text", width: 100,},
      { dataField: "IBCONFIRMDATE", headerText: "입고 확정 일자", style: "left-text", width: 100,},
      { dataField: "ATTRIBUTE1", headerText: "속성1", style: "left-text", width: 100,},
      { dataField: "ATTRIBUTE2", headerText: "속성2", style: "left-text", width: 100,},
      { dataField: "ATTRIBUTE3", headerText: "속성3", style: "left-text", width: 100,},
      { dataField: "ATTRIBUTE4", headerText: "속성4", style: "left-text", width: 100,},
      { dataField: "ATTRIBUTE5", headerText: "속성5", style: "left-text", width: 100,},
      { dataField: "PRODUCTLOT", headerText: "생산 Lot", style: "left-text", width: 100,},
      { dataField: "LOGGRPCD", headerText: "물류 그룹 코드", style: "left-text", width: 100,},
      { dataField: "IFSTATUS", headerText: "업로드 상태", headerStyle: "aui-grid-required-header", width: 140,
        labelFunction: function (rowIndex, columnIndex, value, headerText, item) {
          var labelvalue = '';
          for(var i=0; i < that.UPLOAD_STATUS_LIST.length; i++){
            if(that.UPLOAD_STATUS_LIST[i].code == value) labelvalue = that.UPLOAD_STATUS_LIST[i].code_nm;
          }
          return labelvalue;
        },
        editRenderer: {
          type: "DropDownListRenderer",
          showEditorBtnOver: true, // 마우스 오버 시 에디터버턴 보이기
          list: this.UPLOAD_STATUS_LIST.filter(item => item.code != ""), //key-value Object 로 구성된 리스트
          keyField: "code", // key 에 해당되는 필드명
          valueField: "code_nm", // value 에 해당되는 필드명
        },
      },
      { dataField: "SEQ", headerText: "순번", style: "left-text", width: 100,},
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
      this.$gridCallUrl("/backed/inventory/upload/getInventoryUploadList",this.queryParam).then((res) => {
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
      console.log('event==',event)
        return this.$gridEditable(this.$refs.codeGrpGrid, event, ["SEQ"])

    }, async saveGrid() {
      const data = this.$gridGetCudData(this.$refs.codeGrpGrid, ["ICKEY", "LCKEY", "QTY", "ICUTKEY", "UOM"])
      if (data.length) {
        this.loading = true
        const errList = await this.$checkStandardInfo(['MST_IC','MST_LC'], data)
        console.log('errList====', errList)
        let msg = ''

        if (errList.length > 0) {
          for (let i = 0; i < errList.length; i++) {
            msg += ``+errList[i].uid + '행:' + errList[i].message + ``
          }
        }
        console.log('msg===',msg)

        if (msg != '') {
          this.loading = false
          this.$error({
            title: '에러발생',
            content: msg,
          });
        }

        if (errList == 0) {
          this.$gridCallUrl("/backed/inventory/upload/saveInventoryUpload", data).then((res) => {
            console.log('res====', res)
            this.$message.success('저장완료');
            this.searchData()
          }, error => {
            this.loading = false
          })
        }

      }
    }, async confirmInventoryUpload() { //재고업로드 확정
      // const data = this.$gridGetCudData(this.$refs.codeGrpGrid, ["ICKEY", "LCKEY", "QTY", "ICUTKEY", "UOM"])
      const data = this.$refs.codeGrpGrid.getCheckedRowItemsAll()
      for (let i = 0; i < data.length; i++) {
        data[i].sessionUserId = this.$store.state.account.user.user_id
        data[i].sessionCtkey = this.$store.state.account.ctkey
      }
      if (data.length > 0 ) {


        if(data.filter(item => item.IFSTATUS != "10").length > 0 ){
          this.$message.error('업로드 대기 상태인 것들만 확정이 가능합니다.');
          return
        }
        this.loading = true
        this.$gridCallUrl("/backed/inventory/upload/confirmInventoryUpload", data).then((res) => {
          console.log('res====', res)
          this.$message.success('재고 업로드 확정 완료');
          this.searchData()
        }, error => {
          this.loading = false
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