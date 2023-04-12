<template>
  <div id="components-form-demo-advanced-search">
    <a-spin :spinning="loading" size="large">
      <a-form class="ant-advanced-search-form" :label-col="{ span: 7 }" :wrapper-col="{ span: 16 }">
        <a-row >
          <a-col :span="7" :style="{}">
            <a-form-item label="조정 구분">
              <a-select v-model="queryParam.wohdtype"  >
                <a-select-option :key="item.code" :value="item.code" v-for="(item, index) in WOHDTYPELIST">
                  {{ item.code_nm }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="7" :style="{}">
            <a-form-item label="작업 상태">
              <a-select v-model="queryParam.wkstatus" >
                <a-select-option :key="item.code" :value="item.code" v-for="(item, index) in WKSTATUSLIST">
                  {{ item.code_nm }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="7" :style="{}">
            <a-form-item label="지시 일자" >
              <a-range-picker
                  style="width: 100%"
                  :default-value="[moment().subtract(7, 'days'), moment()]"
                  :ranges="ranges"
                  @change="postDtChange"
              />
            </a-form-item>
          </a-col>
          <a-col :span="3" :style="{ textAlign: 'right' }">
            <a-button type="primary" icon="search" @click="searchMaster">조회</a-button>
            <a-button :style="{ marginLeft: '8px' }" @click="pageReset">초기화</a-button>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="7" :style="{ }">
            <a-form-item label="지시 공통 코드">
              <a-input v-model="queryParam.wohdkey" placeholde1="입력하세요." @keyup.enter="searchMaster" />
            </a-form-item>
          </a-col>
          <a-col :span="7" :style="{}">
            <a-form-item label="품목코드">
              <a-input-group>
                <a-row :gutter="8">
                  <a-col :span="12">
                    <a-input-search placeholder="" @search="openPopItem('SEARCH','')"
                                    v-model="queryParam.ickey" />
                  </a-col>
                  <a-col :span="12">
                    <a-input default-value="" v-model="queryParam.icname" disabled>
                      <a-icon slot="addonAfter" type="close-circle" @click="resetIckey"/>
                    </a-input>
                  </a-col>
                </a-row>
              </a-input-group>
            </a-form-item>
          </a-col>
          <a-col :span="7" :style="{ }">
            <a-form-item label="오더번호">
              <a-input v-model="queryParam.wtord_head_orde" placeholde1="입력하세요." @keyup.enter="searchMaster" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>

      <div class="search-result-list" style="{width: 100%;}">
        <a-row >
          <a-col :span="24" style="text-align: left;" >
            <div class="sub_title" style="display: inline-block;"><a-icon type="caret-right" style="padding-right: 10px"/>작업 HD</div>
            <div class="btn_area" style="float: right; padding-right: 0px;">
              <a-col :span="6"><a-button type="primary" @click="downLoadExcel('grid1')" size="small"><a-icon type="file-excel"/>다운로드</a-button></a-col>
            </div>
          </a-col>
          <a-col :span="24">
            <AUIGrid ref="hdGrid" class="grid-wrap"
                     @cellDoubleClick="cellClickHandler"
                     style="height: 20vh"
            >
            </AUIGrid>
          </a-col>
        </a-row>
        <a-row >
          <a-col :span="24" style="text-align: left;" >
            <div style="margin-top: 10px;">
              <div class="sub_title" style="display: inline-block;"><a-icon type="caret-right" style="padding-right: 10px"/>작업 DT</div>
              <div class="btn_area" style="float: right; padding-right: 19px;">
                <a-col :span="8"><a-button type="primary" @click="actionWorkorder" size="small"><a-icon type="down"/>확정</a-button></a-col>
                <a-col :span="8"><a-button type="primary" @click="endWorkorder" size="small"><a-icon type="down"/>마감</a-button></a-col>
                <a-col :span="8"><a-button type="primary" @click="downLoadExcel('grid2')" size="small"><a-icon type="file-excel"/>다운로드</a-button></a-col>
              </div>
            </div>
          </a-col>
          <a-col :span="24">
            <AUIGrid ref="dtGrid" class="grid-wrap"
            >
            </AUIGrid>
          </a-col>
        </a-row>
      </div>
    </a-spin>
    <!-- 팝업 호출 -->
    <item-popup v-if="this.$store.state.modal.item_popup" :visible="this.$store.state.modal.item_popup"
                :callType="'input'" @closepopItem="closepopItem">
    </item-popup>
    <lc-popup v-if="this.$store.state.modal.lc_popup" :visible="this.$store.state.modal.lc_popup"
              :callType="'input'" @selectLC="closepopLckey" :ZNKEY=this.LC_POPUP_ZNKEY>
    </lc-popup>
    <!-- 팝업 호출 -->
  </div>

</template>

<script>
// AUIGrid 컴포넌트
import AUIGrid from "@/components/auigrid/import/AUIGrid-Vue.js/AUIGrid";
import {getCmCodeLoad, getCmCodeLoadArray} from "@/services/common";
import moment from "moment";
import ItemPopup from "@/pages/components/modal/ItemPopup";
import lcPopup from "@/pages/components/modal/LcPopup";
import {mapMutations} from "vuex";

export default {

  components: {
    AUIGrid,
    ItemPopup,
    lcPopup,
  },
  data: function () {
    return {
      loading: false,     //로딩바 유무
      masterRow: {},      //master hd 정보
      ranges: { '7일': [moment().subtract(7, 'days'), moment()]
        , '30일': [moment().subtract(30, 'days'), moment()]
        , '60일': [moment().subtract(60, 'days'), moment()]
        , '90일': [moment().subtract(90, 'days'), moment()]
        , '180일': [moment().subtract(180, 'days'), moment()]
      },

      // 공통코드 list
      WOHDTYPELIST: [],
      WKSTATUSLIST: [],

      // 쿼리 매개변수
      queryParam: {
        ickey : "",
        wohdtype : "",
        wkstatus : "",
        wohdkey : "",
        wtord_head_orde : "",
        startDt:"",
        endDt:"",
      },

      // 팝업
      ITEM_POPUP_TYPE : 'SEARCH',
      LC_POPUP_TYPE : '',
      LC_POPUP_DATAFILED: '',
      LC_POPUP_ZNKEY: '',

      // 그리드 칼럼 레이아웃 정의
      columnLayoutHD: [],
      columnLayoutDT: [],
      // 그리드 속성 정의 default 그리드 프로퍼티 사용
      auigridPropsHD: {
        // 엑스트라 체크박스 표시 설정
        showRowCheckColumn: false,
        // 편집 가능 여부 (기본값 : false)
        editable: false,
        // 셀 선택모드 (기본값: singleCell)
        selectionMode: "singleCell",
        //필터사용유무
        enableFilter: true,
      },
      auigridPropsDT: {
        // 엑스트라 체크박스 표시 설정
        showRowCheckColumn: true,
        // 편집 가능 여부 (기본값 : false)
        editable: true,
        // 셀 선택모드 (기본값: singleCell)
        selectionMode: "singleCell",
        //필터사용유무
        enableFilter: true,
      },
      // 그리드 데이터
      gridDataHD: [],
      gridDataDT: [],

    }

  },

  async beforeMount() {

  }, async mounted() {
    const that = this

    //1.1 공통코드 배열형태로 들고오기
    const cm_code = await getCmCodeLoadArray(['WOHDTYPE', 'WO_WKSTATUS'],'전체')
    this.WKSTATUSLIST = cm_code.WO_WKSTATUS

    for(var i=0; i<cm_code.WOHDTYPE.length; i++){
      if(cm_code.WOHDTYPE[i].code == '' || cm_code.WOHDTYPE[i].code == '4' || cm_code.WOHDTYPE[i].code == '5' || cm_code.WOHDTYPE[i].code == '6')
        this.WOHDTYPELIST.push(cm_code.WOHDTYPE[i]);
    }

    //1.2 변수 초기값 설정
    this.queryParam.startDt = moment().subtract(7, 'days').format("YYYYMMDD");
    this.queryParam.endDt = moment().format("YYYYMMDD");

    //1.3 그리드 셋팅
    this.columnLayoutHD = [
      { dataField: "CTKEY", headerText: "센터코드", ㄴwidth: 120, editable: false, visible: false},
      { dataField: "WOHDKEY", headerText: "지시 공통 코드", width: 150, style:"column-link-css", editable: false },
      { dataField: "WOHDTYPE_DESC", headerText: "조정구분", width: 120, editable: false},
      { dataField: "WOHDDATE", headerText: "지시 날짜", width: 120, editable: false },
      { dataField: "REQUESTDATE", headerText: "요청 날짜", width: 120, editable: false},
      { dataField: "WKSTATUS_CODE", headerText: "상태코드", width: 100, editable: false, visible: false},
      { dataField: "WKSTATUS", headerText: "상태값", filter: {showIcon: true}, width: 120, editable: false,
        styleFunction : function(rowIndex, columnIndex, value, headerText, item, dataField) {
          if(item.WKSTATUS_CODE == "50"){ return "aui-grid-cell-green01_center";
          }else if(item.WKSTATUS_CODE == "90"){ return "aui-grid-cell-gray01_center";
          }else if(item.WKSTATUS_CODE == "91"){ return "aui-grid-cell-red01_center";
          }else{ return ""; }
        }
      },
      { dataField: "WTORD_HEAD_ORDE", headerText: "오더번호", width: 150, editable: false},
      { dataField: "COMMENTS1", headerText: "비고1", width: 200, editable: false },
      { dataField: "COMMENTS2", headerText: "비고2", width: 200, editable: false },
      { dataField: "INSERTDATE", headerText: "등록일시", width: 135, editable: false},
      { dataField: "INSERTURKEY", headerText: "등록자", width: 100, editable: false},
      { dataField: "UPDATEDATE", headerText: "수정일시",width: 135, editable: false},
      { dataField: "UPDATEURKEY", headerText: "수정자", width: 100, editable: false},
    ]

    this.columnLayoutDT = [
      { dataField: "CTKEY", headerText: "센터코드", width: 120, editable: false, visible: false},
      { dataField: "WOHDKEY", headerText: "지시 공통 코드", width: 150, visible: false, editable: false },
      { dataField: "WODTKEY", headerText: "지시 상세 코드", width: 100, editable: false },
      { dataField: "ICKEY", headerText: "품목코드", width: 150, editable: false,},
      { dataField: "ICNAME", headerText: "품목명", width: 200, editable: false, style : "left-text" },
      { dataField: "INITQTY", headerText: "지시수량", width: 80, dataType : "numeric", formatString: "#,###", style:"right-text", editable: false},
      { dataField: "WKSTATUS_CODE", headerText: "상태코드", width: 100, editable: false, visible: false},
      { dataField: "WKSTATUS", headerText: "상태값", filter: {showIcon: true}, width: 120, editable: false,
        styleFunction : function(rowIndex, columnIndex, value, headerText, item, dataField) {
          if(item.WKSTATUS_CODE == "50"){ return "aui-grid-cell-green01_center";
          }else if(item.WKSTATUS_CODE == "90"){ return "aui-grid-cell-gray01_center";
          }else if(item.WKSTATUS_CODE == "91"){ return "aui-grid-cell-red01_center";
          }else{ return ""; }
        }
      },
      { dataField: "UOM", headerText: "단위", width: 80, editable: false},
      {
        headerText : "FROM",
        children : [
          { dataField: "FR_ZNKEY", headerText: "존코드", width: 100, editable: false,},
          { dataField: "FR_LCKEY", headerText: "로케이션 코드", width: 140, editable: false,
            styleFunction : function(rowIndex, columnIndex, value, headerText, item, dataField) {
              if(item.WKSTATUS_CODE == "00" && that.masterRow.WOHDTYPE == '5'){
                return "aui-grid-cell-editable";
              }else{
                return "";
              }
            },
            renderer: {
              type: "IconRenderer",
              iconWidth: 20, // icon 가로 사이즈, 지정하지 않으면 24로 기본값 적용됨
              iconHeight: 20,
              iconPosition: "aisleRight",  // 아이콘 위치
              iconFunction : function(rowIndex, columnIndex, value, item) {
                if(item.WKSTATUS_CODE == "00" && that.masterRow.WOHDTYPE == '5'){
                  return that.$searchIcon;
                }else{
                  return "";
                }
              },
              onClick: function(event) {
                that.openPopLckey('GRID',event);
              }
            }
          }
        ] // end of children
      },
      {
        headerText : "TO",
        children : [
          { dataField: "TO_ZNKEY", headerText: "존코드", width: 100, headerStyle: "", editable: false,},
          { dataField: "TO_LCKEY", headerText: "로케이션 코드", headerStyle: "aui-grid-required-header", style: "", width: 140, editable: false,
            styleFunction : function(rowIndex, columnIndex, value, headerText, item, dataField) {
              if(item.WKSTATUS_CODE == "00" && that.masterRow.WOHDTYPE == '5'){
                return "aui-grid-cell-editable";
              }else{
                return "";
              }
            },
            renderer: {
              type: "IconRenderer",
              iconWidth: 20, // icon 가로 사이즈, 지정하지 않으면 24로 기본값 적용됨
              iconHeight: 20,
              iconPosition: "aisleRight",  // 아이콘 위치
              iconFunction : function(rowIndex, columnIndex, value, item) {
                if(item.WKSTATUS_CODE == "00" && that.masterRow.WOHDTYPE == '5'){
                  return that.$searchIcon;
                }else{
                  return "";
                }
              },
              onClick: function(event) {
                that.openPopLckey('GRID',event);
              }
            }
          },
        ] // end of children
      },
      { dataField: "WMSREMARK", headerText: "비고", width: 200, editable: false,},
      { dataField: "INSERTDATE", headerText: "등록일시", width: 135, editable: false},
      { dataField: "INSERTURKEY", headerText: "등록자", width: 100, editable: false},
      { dataField: "UPDATEDATE", headerText: "수정일시",width: 135, editable: false},
      { dataField: "UPDATEURKEY", headerText: "수정자", width: 100, editable: false},
    ]

    let hdGrid = this.$refs.hdGrid;
    let dtGrid = this.$refs.dtGrid;

    // 그리드 생성
    hdGrid.create(this.columnLayoutHD, this.auigridPropsHD);
    dtGrid.create(this.columnLayoutDT, this.auigridPropsDT);

    // 그리드 데이터 삽입하기
    hdGrid.setGridData(this.gridDataHD);
    dtGrid.setGridData(this.gridDataDT);

  },watch:{
    gridDataHD: function (newVal, oldVal) {
      this.$refs.hdGrid.setGridData(newVal);
    },
    gridDataDT: function (newVal, oldVal) {
      this.$refs.dtGrid.setGridData(newVal);
    },
  }, created() {
    // this.$refs.sysRoleGrid.resize(null,1200)
    // this.$refs.ctRole.resize(null,1200)
  },
  methods: {
    ...mapMutations('modal', ['setItem_popup', 'setLc_popup']),
    moment,
    searchMaster() {
      console.log(this.queryParam);
      this.loading = true
      this.$gridCallUrl("/backed/work/getWorkOrderHd",this.queryParam).then((res) => {
        // 실제로 새로 고침이 빨라서 setTimeout 으로 약간의 시간을 두는중.
        setTimeout(() => this.loading = false, this.$gridDelayTime)
        this.gridDataDT = []
        this.masterRow  = {}
        console.log(res.data)
        this.gridDataHD = res.data

        // dt 자동 조회 추가
        if(res.data.length != 0){
          this.masterRow = res.data[0];
          this.searchDetail();
        }
      })
    }, searchDetail() {
      this.loading = true
      this.$gridCallUrl("/backed/work/getWorkOrderDt",this.masterRow).then((res) => {
        setTimeout(() => this.loading = false, this.$gridDelayTime)
        this.gridDataDT = res.data
      })
    }, cellClickHandler(event) {
      if (event.dataField == "WOHDKEY") {
        this.masterRow = event.item
        this.searchDetail()
      }
    }, downLoadExcel(id) {
      // 내보내기 실행
      if (id == "grid1") {
        this.$refs.hdGrid.exportToXlsx({ isRowStyleFront: false,}) //엑셀다운로드 함수
      } else {
        this.$refs.dtGrid.exportToXlsx({ isRowStyleFront: false,})  //엑셀다운로드 함수
      }
    }, pageReset() {
      this.queryParam = {
        ickey : "",
        wohdtype : "",
        wkstatus : "",
        wohdkey : "",
        wtord_head_orde : "",
        startDt:"",
        endDt:"",
      },
      this.gridDataHD = [];
      this.gridDataDT = [];
    }, openPopItem(target,event) {
      if(target == 'GRID'){
        this.$CELL_INFO.rowIndex = event.rowIndex;
      }
      this.ITEM_POPUP_TYPE = target;
      this.setItem_popup(true)
    }, closepopItem(event) { //품번팝업에서 선택한 대상
      if(this.ITEM_POPUP_TYPE == 'SEARCH'){
        this.queryParam.ickey  = event.ICKEY
        this.queryParam.icname = event.ICNAME
      }else{
        console.log(event);
        this.$refs.dtGrid.setCellValue(this.$CELL_INFO.rowIndex, "ICKEY", event.ICKEY);
        this.$refs.dtGrid.setCellValue(this.$CELL_INFO.rowIndex, "ICNAME", event.ICNAME);
      }
      this.setItem_popup(false)
    }, resetIckey() {
      this.queryParam.ickey  = ''
      this.queryParam.icname = ''
    }, postDtChange(event, dateString){
      this.queryParam.startDt = dateString[0].replace(/-/g,'');
      this.queryParam.endDt = dateString[1].replace(/-/g,'');
    }, openPopLckey(target, event) {
      console.log(event);
      if(target == 'GRID'){
        this.$CELL_INFO.rowIndex = event.rowIndex;

        if (event.dataField == "FR_LCKEY"){
          this.LC_POPUP_DATAFILED = 'FR';
          this.LC_POPUP_ZNKEY = event.item.FR_ZNKEY;
        }else if (event.dataField == "TO_LCKEY"){
          this.LC_POPUP_DATAFILED = 'TO'
          this.LC_POPUP_ZNKEY = event.item.TO_ZNKEY;
        }

      }
      this.LC_POPUP_TYPE = target
      console.log("rowIndex===", this.$CELL_INFO.rowIndex)
      this.setLc_popup(true)
    }, closepopLckey(event) { //품번팝업에서 선택한 대상
      if(this.ZN_POPUP_TYPE == 'GRID'){
        console.log(event);
        if(this.LC_POPUP_DATAFILED == 'FR'){
          this.$refs.dtGrid.setCellValue(this.$CELL_INFO.rowIndex, "FR_LCKEY", event.LCKEY);
        }else if(this.LC_POPUP_DATAFILED == 'TO'){
          this.$refs.dtGrid.setCellValue(this.$CELL_INFO.rowIndex, "TO_LCKEY", event.LCKEY);
        }
      }
      this.LC_POPUP_DATAFILED = '';
      this.LC_POPUP_ZNKEY = ''
      this.setZn_popup(false)
    }, actionWorkorder(){
      console.log(this.masterRow);
      console.log(this.$refs.dtGrid.getCheckedRowItems());
    }, endWorkorder(){
      var checkList = this.$refs.dtGrid.getCheckedRowItems();
      if(checkList.length == 0){
        this.$message.info('선택해주세요.');
      }else{
        var checkYn = false
        // 대상 체크
        for(var i=0; i < checkList.length; i++){
          checkList[i].item.sessionUserId = this.$store.state.account.user.user_id;
          checkList[i].item.sessionCtkey = this.$store.state.account.ctkey

          if(checkList[i].item.WKSTATUS_CODE >= 90){
            this.$message.info('작업마감 대상이 아닙니다.');
            return;
          }
        }

        // 마감 로직 호출
        this.loading = true
        console.log(checkList);
        this.$gridCallUrl("/backed/work/endWorkOrder",checkList).then((res) => {
          console.log('res====', res)
          this.$message.success('작업마감완료')
          this.searchDetail()
        }, error => {
          this.loading = false
          console.log('endWorkOrder error ==== ', error)
        })
      }
    }
  }
}

</script>

<style lang="less" scoped>
</style>