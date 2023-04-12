<template>
  <div id="components-form-demo-advanced-search">
    <a-spin :spinning="loading" size="large">
      <ZnPopup v-if="this.$store.state.modal.zn_popup"
                :visible="this.$store.state.modal.zn_popup"
                @selectZn="selectGridZn"
      ></ZnPopup>

      <a-form class="ant-advanced-search-form" >
        <a-row :gutter="24">
          <a-col :span="8" :style="{}">
            <a-form-item label="품목코드" :labelCol="{span: 3}">
              <a-input-group >
                <a-row :gutter="8">
                  <a-col :span="10">
                    <a-input-search placeholder="" @search="onSearchIckey"
                                    v-model="queryParam.ickey"/>
                  </a-col>
                  <a-col :span="14">
                    <a-input default-value="" v-model="queryParam.icname" >
                      <a-icon slot="addonAfter" type="close-circle" @click="resetIckey"/>
                    </a-input>
                  </a-col>
                </a-row>
              </a-input-group>
              <!-- 품번 팝업 호출 -->
              <item-popup v-if="this.$store.state.modal.item_popup" :visible="this.$store.state.modal.item_popup"
                          :callType="'input'" @closepopItem="closepopItem"></item-popup>
              <!-- 품번 팝업 호출 -->
            </a-form-item>
          </a-col>
          <a-col :span="4" :style="{}">
            <a-form-item label="품목형태">
              <a-select v-model="queryParam.ictype" >
                <a-select-option :key="item.code" :value="item.code" v-for="(item, index) in ST001">
                  {{ item.code_nm }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="4" :style="{ }">
            <a-form-item label="품목구분">
              <a-select v-model="queryParam.icgrkey">
                <a-select-option :key="item.code" :value="item.code" v-for="(item, index) in ICGRKEY_LIST">
                  {{ item.code_nm }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="5" :style="{ }" style="text-align: right">
            <a-form-item label="해외품번 사용유무" >
              <a-select v-model="queryParam.globalicyn">
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

          <a-col :span="13" :style="{ }">
            <a-form-item label="로케이션">
              <a-select v-model="queryParam.to_lckey" mode="tags" @change="locationChange">
                <a-select-option :key="item.LCKEY" v-for="(item, index) in LOCATION_LIST" >
                  {{ item.LCKEY }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>




        </a-row>
      </a-form>

      <div class="search-result-list" style="{width: 100%;height: 80%;}">
        <a-row type="flex" justify="end" style="margin-top:10px; margin-bottom: 10px;">
          <a-space>
            <a-col :span="6"><a-button type="primary" @click="gridAddRow" size="small"><a-icon type="plus-square"/>추가</a-button></a-col>
            <a-col :span="6"><a-button type="primary" @click="gridRemoveRow" size="small"><a-icon type="delete"/>삭제</a-button></a-col>
            <a-col :span="6"><a-button type="primary" @click="saveGrid" size="small"><a-icon type="save"/>저장</a-button></a-col>
            <a-col :span="6"><a-button type="primary" @click="downLoadExcel('grid1')" size="small"><a-icon type="file-excel"/>다운로드</a-button></a-col>
          </a-space>
        </a-row>
        <div style="{width: 100%;}">
          <AUIGrid ref="mstIcGrid" class="grid-wrap one_search_one_grid_height"
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
import ItemPopup from "@/pages/components/modal/ItemPopup";
import {mapMutations} from "vuex";
import ZnPopup from "@/pages/components/modal/ZnPopup";

export default {

  components: {
    ZnPopup,
    AUIGrid,
    ItemPopup,
  },
  data: function () {
    return {
      loading: false,     //로딩바 유무
      ZN_POPUP_TYPE:'SEARCH',
      LOCATION_LIST:[],
      CTTYPE_LIST: [],
      ICGRKEY_LIST:[],
      YESNO_LIST: [],
      ST001: [],
      // 쿼리 매개변수
      queryParam: {
        ickey: "",
        icname:"",
        ictype: "",
        icgrkey: "",
        to_znkey: "",
        to_znname: "",
        globalicyn: "",
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
    const that = this //vue 객체
    //1.1 공통코드 배열형태로 들고오기
    const cm_code = await getCmCodeLoadArray(['CTTYPE','YESNO','ICGRKEY','ST001'],'전체')
    this.CTTYPE_LIST  = cm_code.CTTYPE
    this.YESNO_LIST   = cm_code.YESNO
    this.ICGRKEY_LIST = cm_code.ICGRKEY
    this.ST001        = cm_code.ST001

    //2. 컬럼 레이아웃 선언
    this.columnLayout = [
      { dataField: "ICKEY", headerText: "품목 코드", headerStyle: "aui-grid-required-header ", style: "left-text", width: 120 },
      { dataField: "ICNAME", headerText: "품목명", headerStyle: "aui-grid-required-header", style: "left-text", width: 180 },
      {
        headerText: "기본적치",
        children: [
          { dataField: "TO_ZNKEY", headerText: "존 코드", headerStyle: "", style: "", width: 100,
            renderer: {
              type: "IconRenderer",
              iconWidth: 20, // icon 가로 사이즈, 지정하지 않으면 24로 기본값 적용됨
              iconHeight: 20,
              iconPosition: "aisleRight",  // 아이콘 위치
              iconTableRef: {"default": this.$searchIcon},
              onClick: this.openZnPopup
            }
          },
          { dataField: "TO_ZNNAME", headerText: "존 명", headerStyle: "", style: "", width: 180,editable: false,},
          { dataField: "TO_LCKEY", headerText: "기본적치위치", headerStyle: "", style: "", width: 120 },
        ],
      },
      { dataField: "ARKEY", headerText: "구역코드", headerStyle: "", style: "", width: 100 },
      { dataField: "ICUSECASE", headerText: "기본투입라인", headerStyle: "", style: "", width: 100 },
      { dataField: "UDF1", headerText: "사용자정의필드1", headerStyle: "", style: "", width: 200 },
      { dataField: "GLOBALICYN", headerText: "해외품번 사용유무", headerStyle: "", style: "", width: 120 },
      { dataField: "ICGRKEY", headerText: "품목구분", headerStyle: "", style: "", width: 140,
        labelFunction: function (rowIndex, columnIndex, value, headerText, item) {
          var labelvalue = '';
          for(var i=0; i < that.ICGRKEY_LIST.length; i++){
            if(that.ICGRKEY_LIST[i].code == value) labelvalue = that.ICGRKEY_LIST[i].code_nm;
          }
          return labelvalue;
        },
        editRenderer: {
          type: "DropDownListRenderer",
          showEditorBtnOver: true, // 마우스 오버 시 에디터버턴 보이기
          list: this.ICGRKEY_LIST.filter(item => item.code != ""), //key-value Object 로 구성된 리스트
          keyField: "code", // key 에 해당되는 필드명
          valueField: "code_nm", // value 에 해당되는 필드명
        },
      },
      { dataField: "UOM", headerText: "재고단위", headerStyle: "", style: "", width: 80 },
      { dataField: "ICTYPE", headerText: "품목형태", headerStyle: "", style: "", width: 100,
        labelFunction: function (rowIndex, columnIndex, value, headerText, item) {
          var labelvalue = '';
          for(var i=0; i < that.ST001.length; i++){
            if(that.ST001[i].code == value) labelvalue = that.ST001[i].code_nm;
          }
          return labelvalue;
        },
        editRenderer: {
          type: "DropDownListRenderer",
          showEditorBtnOver: true, // 마우스 오버 시 에디터버턴 보이기
          list: this.ST001.filter(item => item.code != ""), //key-value Object 로 구성된 리스트
          keyField: "code", // key 에 해당되는 필드명
          valueField: "code_nm", // value 에 해당되는 필드명
        },
      },
      { dataField: "ORDSTARTDATE", headerText: "적용일자", headerStyle: "", style: "", width: 140 },
      { dataField: "ORDSTOPDATE", headerText: "만료일자", headerStyle: "", style: "", width: 140 },
      { dataField: "ORDTYPE", headerText: "품목타입", headerStyle: "", style: "", width: 80 },
      { dataField: "MAXORDQTY", headerText: "최대 허용재고", headerStyle: "", style: "", width: 120 },
      { dataField: "MINORDQTY", headerText: "최소 허용재고", headerStyle: "", style: "", width: 120 },
      { dataField: "DIRECTOBYN", headerText: "선입선출유무", headerStyle: "", style: "", width: 120 },
      { dataField: "CNTRQTY", headerText: "용기수량", headerStyle: "", style: "", width: 120 },
      { dataField: "OPERSTATYPE", headerText: "자동할당여부", headerStyle: "", style: "", width: 120 },
      { dataField: "PORT_YN", headerText: "PORT여부", headerStyle: "", style: "", width: 100 },
      { dataField: "COMMENT", headerText: "비고", headerStyle: "", style: "", width: 180 },
      { dataField: "STOREORDUOMCD", headerText: "설계품목번호", headerStyle: "", style: "", width: 180 },
      { dataField: "INSERTURKEY", headerText: "입력사용자", headerStyle: "", style: "", width: 100 },
      { dataField: "INSERTDATE", headerText: "입력일시", headerStyle: "", style: "", width: 120 },
      { dataField: "UPDATEURKEY", headerText: "수정사용자", headerStyle: "", style: "", width: 100 },
      { dataField: "UPDATEDATE", headerText: "수정일자", headerStyle: "", style: "", width: 120 },
    ]

    let mstIcGrid = this.$refs.mstIcGrid;
    mstIcGrid.create(this.columnLayout, this.auigridProps);
    // 그리드 데이터 삽입하기
    mstIcGrid.setGridData(this.gridData);

  },watch:{
    gridData: function (newVal, oldVal) {
      this.$refs.mstIcGrid.setGridData(newVal);
    },
  }, created() {

  },
  methods: {
    ...mapMutations('modal', ['setItem_popup','setZn_popup']),
    searchData() {
      this.loading = true
      this.$gridCallUrl("/backed/mstic/getMstIcList",this.queryParam).then((res) => {
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
      this.$refs.mstIcGrid.addRow(item, "last");
    },
    gridRemoveRow() {
      const list = this.$refs.mstIcGrid.getCheckedRowItemsAll()
      if (list.length == 0) {
        this.$message.info('삭제할 행을 선택하세요.');
        return
      }
      // 체크된 행 삭제 처리
      this.$refs.mstIcGrid.removeCheckedRows()
    }, cellClickHandler(event) {
      // 셀클릭 이벤트 핸들링

    },
    cellEditBeginGrid(event) {
      //해당 필드는 update 불가, add 시 입력가능
      return this.$gridEditable(this.$refs.mstIcGrid, event, ["CTKEY"])
    }, saveGrid() {
      const data = this.$gridGetCudData(this.$refs.mstIcGrid, ["CTKEY", "CTNAME", "CTTYPE"])
      if (data.length) {
        this.loading = true
        this.$gridCallUrl("/backed/mstic/saveMstIc",data).then((res) => {
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
      this.$refs.mstIcGrid.exportToXlsx({ isRowStyleFront: false,fileName : "품목관리_엑셀자료"}) //엑셀다운로드 함수
    }, pageReset() {
        this.queryParam.ickey = ''
        this.queryParam.ickey = ''
        this.queryParam.icname =''
        this.queryParam.ictype = ''
        this.queryParam.icgrkey = ''
        this.queryParam.to_znkey = ''
        this.queryParam.to_lckey = ''
        this.queryParam.globalicyn = ''
      this.gridData = [];
    }, onSearchIckey() {
      this.setItem_popup(true)
    }, closepopItem(event) { //품번팝업에서 선택한 대상
      console.log('event===@@@@',event)
      this.queryParam.ickey  = event.ICKEY
      this.queryParam.icname = event.ICNAME
      this.setItem_popup(false)
    }, resetIckey() {
      this.queryParam.ickey  = ''
      this.queryParam.icname = ''
    },resetZnkey() {
      this.queryParam.to_znkey  = ''
      this.queryParam.to_znname = ''
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
    }, locationChange(value){
      console.log('values====',value)
      console.log('queryParam.to_lckey====',this.queryParam.to_lckey)
    }
  }
}

</script>

<style lang="less" scoped>

</style>