<template>
  <div id="components-form-demo-advanced-search">
    <a-spin :spinning="loading" size="large">
      <ZnPopup v-if="this.$store.state.modal.zn_popup"
               :visible="this.$store.state.modal.zn_popup"
               @selectZn="selectGridZn"
      ></ZnPopup>

      <a-form class="ant-advanced-search-form">
        <a-row :gutter="24">
          <a-col :span="8" :style="{}">
            <a-form-item label="존" :labelCol="{span: 3}" >
              <a-input-group>
                <a-row :gutter="8">
                  <a-col :span="10">
                    <a-input-search placeholder="" @search="openZnPopupSearch"  v-model="queryParam.to_znkey"/>
                  </a-col>
                  <a-col :span="14">
                    <a-input default-value="" v-model="queryParam.to_znname" >
                      <a-icon slot="addonAfter" type="close-circle" @click="resetZnkey"/>
                    </a-input>
                  </a-col>
                </a-row>
              </a-input-group>
            </a-form-item>
          </a-col>
          <a-col :span="5" :style="{ }">
            <a-form-item label="사용 여부">
              <a-select v-model="queryParam.useYn">
                <a-select-option :key="item.code" :value="item.code" v-for="(item, index) in useYnList">
                  {{ item.code_nm }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="5" :style="{ }">
            <a-form-item label="라인유형">
              <a-select v-model="queryParam.linetype">
                <a-select-option :key="item.code" :value="item.code" v-for="(item, index) in LINETYPELIST">
                  {{ item.code_nm }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="6" :style="{ textAlign: 'right' }">
            <a-button type="primary" @click="searchMaster">조회</a-button>
            <a-button :style="{ marginLeft: '8px' }" @click="pageReset">초기화</a-button>
          </a-col>
        </a-row>
      </a-form>

      <div class="search-result-list" style="{width: 100%;}">
        <a-row >
          <a-col :span="24" style="text-align: left;" >
            <div style="margin-top: 10px;">
              <div class="sub_title" style="">존 정보</div>
              <div class="btn_area" style="float: right; padding-right: 25px;">
                <a-col :span="6"><a-button type="primary" @click="masterAddRow" size="small"><a-icon type="plus-square"/>추가</a-button></a-col>
                <a-col :span="6"><a-button type="primary" @click="masterRemoveRow" size="small"><a-icon type="delete"/>삭제</a-button></a-col>
                <a-col :span="6"><a-button type="primary" @click="masterSaveGrid" size="small"><a-icon type="save"/>저장</a-button></a-col>
                <a-col :span="6"><a-button type="primary" @click="downLoadExcel('grid1')" size="small"><a-icon type="file-excel"/>다운로드</a-button></a-col>
              </div>
            </div>
          </a-col>
          <a-col :span="24">
            <AUIGrid ref="znGrid" class="grid-wrap"
                     @cellDoubleClick="cellClickHandler"
                     @cellEditBegin="hdEditBeginGrid"
                     style="height:25vh;"
            >
            </AUIGrid>
          </a-col>
        </a-row>
        <a-row >
          <a-col :span="24" style="text-align: left;" >
            <div style="margin-top: 10px;">
              <div class="sub_title" style="display: inline-block;">로케이션 정보</div>
              <div class="btn_area" style="float: right; padding-right: 25px;">
                <a-col :span="6"><a-button type="primary" @click="detailAddRow" size="small"><a-icon type="plus-square"/>추가</a-button></a-col>
                <a-col :span="6"><a-button type="primary" @click="detailRemoveRow" size="small"><a-icon type="delete"/>삭제</a-button></a-col>
                <a-col :span="6"><a-button type="primary" @click="saveDetail" size="small"><a-icon type="save"/>저장</a-button></a-col>
                <a-col :span="6"><a-button type="primary" @click="downLoadExcel('grid2')" size="small"><a-icon type="file-excel"/>다운로드</a-button></a-col>
              </div>
            </div>
          </a-col>
          <a-col :span="24">
            <AUIGrid ref="clGrid" class="grid-wrap"
                     style=""
            >
            </AUIGrid>
          </a-col>
        </a-row>
      </div>
    </a-spin>
  </div>

</template>

<script>
// AUIGrid 컴포넌트
import AUIGrid from "@/components/auigrid/import/AUIGrid-Vue.js/AUIGrid";
import {getCmCodeLoad, getCmCodeLoadArray} from "@/services/common";
import {mapMutations} from "vuex";
import ZnPopup from "@/pages/components/modal/ZnPopup";

export default {

  components: {
    ZnPopup,
    AUIGrid,
  },
  data: function () {
    return {
      loading: false,     //로딩바 유무
      masterRow: {},      //그룹코드 정보
      useYnList: [],
      LINETYPELIST: [],
      // 쿼리 매개변수
      queryParam: {
        znkey: "",
        useYn: "",
        linetype: ""
      },
      // 그리드 칼럼 레이아웃 정의
      columnLayoutHD: [],
      columnLayoutDT: [],

      // // 그리드 속성 정의 default 그리드 프로퍼티 사용
      auigridPropsHD: this.$DEFAULT_GRID_PROP,
      // 그리드 속성 정의 default 그리드 프로퍼티 사용
      auigridPropsDT: this.$DEFAULT_GRID_PROP,

      // 그리드 데이터
      gridDataHD: [],
      gridDataDT: [],

    }

  },

  async beforeMount() {

  }, async mounted() {
    const that = this //vue 객체

    //1.1 공통코드 배열형태로 들고오기
    const cm_code = await getCmCodeLoadArray(['USE_YN', 'LINETYPE', 'LCTYPE'],'전체')
    this.useYnList = cm_code.USE_YN
    this.LINETYPELIST = cm_code.LINETYPE


    this.columnLayoutHD = [
      { dataField: "ZNKEY", headerText: "존 코드", headerStyle: "aui-grid-required-header " ,style: "column-link-css", filter: {showIcon: true}, width: 120 },
      { dataField: "ZNNAME", headerText: "존 명", headerStyle: "aui-grid-required-header", filter: {showIcon: true} },
      { dataField: "ARKEY", headerText: "구역구분", filter: {showIcon: true}, width: 120 },
      { dataField: "STKEY", headerText: "저장 위치 번호", filter: {showIcon: true}, width: 120 },
      { dataField: "USE_YN",
        headerText: "사용여부",
        width: 80,
        renderer: {
          type: "CheckBoxEditRenderer",
          editable: true, // 체크박스 편집 활성화 여부(기본값 : false)
          checkValue: "Y",
          unCheckValue: "N",
        }
      },
      { dataField: "LINE_YN",
        headerText: "라인여부",
        width: 80,
        renderer: {
          type: "CheckBoxEditRenderer",
          editable: true, // 체크박스 편집 활성화 여부(기본값 : false)
          checkValue: "Y",
          unCheckValue: "N",
        }
      },
      { dataField: "LINETYPE", headerText: "구역", width: 120,
        labelFunction: function (rowIndex, columnIndex, value, headerText, item) {
          var labelvalue = '';
          for(var i=0; i < that.LINETYPELIST.length; i++){
            if(that.LINETYPELIST[i].code == value) labelvalue = that.LINETYPELIST[i].code_nm;
          }
          return labelvalue;
        },
        editRenderer: {
          type: "DropDownListRenderer",
          showEditorBtnOver: true, // 마우스 오버 시 에디터버턴 보이기
          list: this.LINETYPELIST.filter(item => item.code != ""), //key-value Object 로 구성된 리스트
          keyField: "code", // key 에 해당되는 필드명
          valueField: "code_nm", // value 에 해당되는 필드명
        },
      },
      { dataField: "SECTOR", headerText: "SECTOR", filter: {showIcon: true}, width: 100 },
      { dataField: "REVERSE_YN",
        headerText: "리버스가능여부",
        width: 100,
        renderer: {
          type: "CheckBoxEditRenderer",
          editable: true, // 체크박스 편집 활성화 여부(기본값 : false)
          checkValue: "Y",
          unCheckValue: "N",
        }
      },
      { dataField: "CREATE_DATE", headerText: "등록일시", width: 135, editable: false },
      { dataField: "CREATE_BY", headerText: "등록자", width: 75, editable: false},
      { dataField: "UPDATE_DATE", headerText: "수정일시",width: 135, editable: false},
      { dataField: "UPDATE_BY", headerText: "수정자", width: 75, editable: false},
    ]

    this.columnLayoutDT = [
      { dataField: "ZNKEY", headerText: "존 코드", filter: {showIcon: true}, width: 120, editable: false },
      { dataField: "LCKEY", headerText: "로케이션 코드", filter: {showIcon: true}, width: 160  },
      { dataField: "LCTYPE", headerText: "로케이션 유형", width: 120,
        labelFunction: function (rowIndex, columnIndex, value, headerText, item) {
          var labelvalue = '';
          for(var i=0; i < that.LINETYPELIST.length; i++){
            if(that.LINETYPELIST[i].code == value) labelvalue = that.LINETYPELIST[i].code_nm;
          }
          return labelvalue;
        },
        editRenderer: {
          type: "DropDownListRenderer",
          showEditorBtnOver: true, // 마우스 오버 시 에디터버턴 보이기
          list: this.LINETYPELIST.filter(item => item.code != ""), //key-value Object 로 구성된 리스트
          keyField: "code", // key 에 해당되는 필드명
          valueField: "code_nm", // value 에 해당되는 필드명
        },
      },

      { dataField: "USEYN",
        headerText: "사용여부",
        width: 80,
        renderer: {
          type: "CheckBoxEditRenderer",
          editable: true, // 체크박스 편집 활성화 여부(기본값 : false)
          checkValue: "Y",
          unCheckValue: "N",
        }
      },
      { dataField: "PREVENT_YN",
        headerText: "중복체크여부",
        width: 90,
        renderer: {
          type: "CheckBoxEditRenderer",
          editable: true, // 체크박스 편집 활성화 여부(기본값 : false)
          checkValue: "Y",
          unCheckValue: "N",
        }
      },
      { dataField: "ALLOW_QTY", headerText: "허용수량", filter: {showIcon: true}, dataType: "numeric", width: 80  },
      { dataField: "COMMENT", headerText: "비고", filter: {showIcon: true}  },
      { dataField: "INSERTDATE", headerText: "등록일시", width: 135, editable: false },
      { dataField: "INSERTURKEY", headerText: "등록자", width: 75, editable: false},
      { dataField: "UPDATEDATE", headerText: "수정일시",width: 135, editable: false},
      { dataField: "UPDATEURKEY", headerText: "수정자", width: 75, editable: false},


    ]

    let znGrid = this.$refs.znGrid;
    let clGrid = this.$refs.clGrid;

    // 그리드 생성

    znGrid.create(this.columnLayoutHD, this.auigridPropsHD);
    clGrid.create(this.columnLayoutDT, this.auigridPropsDT);

    // 그리드 데이터 삽입하기
    znGrid.setGridData(this.gridDataHD);
    clGrid.setGridData(this.gridDataDT);

  },watch:{
    gridDataHD: function (newVal, oldVal) {
      this.$refs.znGrid.setGridData(newVal);
    },
    gridDataDT: function (newVal, oldVal) {
      this.$refs.clGrid.setGridData(newVal);
    },
  }, created() {
    // this.$refs.sysRoleGrid.resize(null,1200)
    // this.$refs.ctRole.resize(null,1200)
  },
  methods: {
    ...mapMutations('modal', ['setZn_popup']),
    searchMaster() {
      this.loading = true
      this.$gridCallUrl("/backed/mstzn/getMstZnList",this.queryParam).then((res) => {
        // 실제로 새로 고침이 빨라서 setTimeout 으로 약간의 시간을 두는중.
        setTimeout(() => this.loading = false, this.$gridDelayTime)
        this.gridDataDT = []
        this.masterRow  = {}
        console.log("DATA=="+res.data)
        this.gridDataHD = res.data
      })
    }, searchDetail() {
      this.loading = true
      this.$gridCallUrl("/backed/mstlc/getMstLcList",this.masterRow).then((res) => {
        setTimeout(() => this.loading = false, this.$gridDelayTime)
        this.gridDataDT = res.data
      })
    },
    masterAddRow() {
      // 하단에 1행 추가
      console.log('행추가 !!')
      let item = {use_yn: "Y", row_status: 'I'};
      this.$refs.znGrid.addRow(item, "last");
      this.$refs.clGrid.clearGridData();
    },
    masterRemoveRow() {
      const list = this.$refs.znGrid.getCheckedRowItemsAll()
      console.log("list==="+list)
      if (list.length == 0) {
        this.$message.info('삭제할 행을 선택하세요.');
        return
      }
      // 체크된 행 삭제 처리
      this.$refs.znGrid.removeCheckedRows()
    },
    masterSaveGrid() {
      console.log("======= masterSaveGrid =====")
      const data = this.$gridGetCudData(this.$refs.znGrid, ["ZNKEY", "ZNNAME"])
      console.log("data==== ", data)
      if (data.length) {
        this.loading = true
        this.$gridCallUrl("/backed/mstzn/saveMstZn",data).then((res) => {
          console.log('res====', res)
          this.$message.success('저장완료')
          this.searchMaster()
        }, error => {
          this.loading = false
          console.log('saveMaster error ==== ', error)
        })
      }
    },
    detailAddRow() {
      if (this.masterRow) {
        let item = {use_yn: "Y", row_status: 'I', ZNKEY: this.masterRow.ZNKEY, sort: 0}
        this.$refs.clGrid.addRow(item, "last")
      } else {
        this.$message.warn('그룹코드를 선택하세요.', 3)
      }
      console.log('test == ', this.masterRow)
    },
    detailRemoveRow() {
      const list = this.$refs.clGrid.getCheckedRowItemsAll()
      if (list.length == 0) {
        this.$message.info('삭제할 행을 선택하세요.');
        return
      }
      // 체크된 행 삭제 처리
      this.$refs.clGrid.removeCheckedRows()
    }, cellClickHandler(event) {
      // 셀클릭 이벤트 핸들링
      console.log('event==@ ', event)
      if (event.dataField == "ZNKEY" && event.item.row_status != "I") {
        this.masterRow = event.item
        this.searchDetail()
      } else {
        this.$refs.clGrid.clearGridData();
      }
    }, saveDetail() {
      const rows = this.$gridGetCudData(this.$refs.clGrid, [])
      const data = rows.map(item =>({
        ...item,ROLE_ID:this.masterRow.ID,UNIQUE_KEY:this.masterRow.UNIQUE_KEY
      }))
      console.log('data===@@ ',data)
      if (data.length > 0) {
        this.loading = true
        this.$gridCallUrl("/backed/mstlc/saveMstLc",data).then((res) => {
          this.$message.success('저장완료');
          this.searchDetail()
        }, error => {
          console.log('error ==== ', error)
        })
      }
    }, downLoadExcel(id) {
      // 내보내기 실행
      if (id == "grid1") {
        this.$refs.znGrid.exportToXlsx({ isRowStyleFront: false,}) //엑셀다운로드 함수
      } else {
        this.$refs.clGrid.exportToXlsx({ isRowStyleFront: false,})  //엑셀다운로드 함수
      }
    },
    resetZnkey() {
      this.queryParam.to_znkey  = ''
      this.queryParam.to_znname = ''
    },
    selectGridZn(event) {
      if(this.ZN_POPUP_TYPE == "SEARCH"){
        this.queryParam.to_znkey  = event.ZNKEY
        this.queryParam.to_znname = event.ZNNAME

        //로케이션 불러오기
        this.loading = true
        this.$gridCallUrl("/backed/popup/getLocationList",this.queryParam).then((res) => {
          console.log('res.data===',res.data)
          // 실제로 새로 고침이 빨라서 setTimeout 으로 약간의 시간을 두는중.
          setTimeout(() => this.loading = false, this.$gridDelayTime)
          this.LOCATION_LIST = res.data
        })
      }else{
        this.$refs.mstIcGrid.setCellValue(this.$CELL_INFO.rowIndex, "TO_ZNKEY", event.ZNKEY)
        this.$refs.mstIcGrid.setCellValue(this.$CELL_INFO.rowIndex, "TO_ZNNAME", event.ZNNAME)
      }
      this.setZn_popup(false)
    },
    openZnPopup(event) {
      //console.log('event==', event)
      //this.rowIndex = event.rowIndex;
      this.ZN_POPUP_TYPE = 'GRID' //데이터를 조회 팝업에서 호출한것인지 그리드에서 호출한것인지 확인하는 플래그
      this.$CELL_INFO.rowIndex = event.rowIndex
      console.log("rowIndex===", this.$CELL_INFO.rowIndex)
      this.setZn_popup(true)
    }, openZnPopupSearch(event) {
      //console.log('event==', event)
      //this.rowIndex = event.rowIndex;
      this.ZN_POPUP_TYPE = 'SEARCH' //데이터를 조회 팝업에서 호출한것인지 그리드에서 호출한것인지 확인하는 플래그
      this.setZn_popup(true)
    },
    pageReset() {
      this.queryParam = { znkey: "", useYn: "", linetype: "" }
      this.gridDataHD = [];
      this.gridDataDT = [];
    },
    hdEditBeginGrid(event) {
      //해당 필드는 update 불가, add 시 입력가능
      return this.$gridEditable(this.$refs.znGrid, event, ["ZNKEY"])
    }
  }
}

</script>

<style lang="less" scoped>

</style>