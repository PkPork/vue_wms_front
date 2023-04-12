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
            <div class="btn_area" style="float: right; padding-right: 25px;">
              <a-col :span="6"><a-button type="primary" @click="masterAddRow" size="small"><a-icon type="plus-square"/>추가</a-button></a-col>
              <a-col :span="6"><a-button type="primary" @click="masterRemoveRow" size="small"><a-icon type="delete"/>삭제</a-button></a-col>
              <a-col :span="6"><a-button type="primary" @click="masterSaveGrid" size="small"><a-icon type="save"/>저장</a-button></a-col>
              <a-col :span="6"><a-button type="primary" @click="downLoadExcel('grid1')" size="small"><a-icon type="file-excel"/>다운로드</a-button></a-col>
            </div>
          </a-col>
          <a-col :span="24">
            <AUIGrid ref="hdGrid" class="grid-wrap"
                     @cellDoubleClick="cellClickHandler"
                     @cellEditBegin = "cellEditBeginHandler"
                     style="height: 20vh"
            >
            </AUIGrid>
          </a-col>
        </a-row>
        <a-row >
          <a-col :span="24" style="text-align: left;" >
            <div style="margin-top: 10px;">
              <div class="sub_title" style="display: inline-block;"><a-icon type="caret-right" style="padding-right: 10px"/>작업 DT</div>
              <div class="btn_area" style="float: right; padding-right: 25px;">
                <a-col :span="6"><a-button type="primary" @click="detailAddRow" size="small"><a-icon type="plus-square"/>추가</a-button></a-col>
                <a-col :span="6"><a-button type="primary" @click="detailRemoveRow" size="small"><a-icon type="delete"/>삭제</a-button></a-col>
                <a-col :span="6"><a-button type="primary" @click="saveDetail" size="small"><a-icon type="save"/>저장</a-button></a-col>
                <a-col :span="6"><a-button type="primary" @click="downLoadExcel('grid2')" size="small"><a-icon type="file-excel"/>다운로드</a-button></a-col>
              </div>
            </div>
          </a-col>
          <a-col :span="24">
            <AUIGrid ref="dtGrid" class="grid-wrap"
                     @cellEditBegin = "cellEditBeginHandler"
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
    <AckeyPopup v-if="this.$store.state.modal.ackey_popup" :visible="this.$store.state.modal.ackey_popup"
                :callType="'input'" @selectAckeyPopup="closepopAckey">
    ></AckeyPopup>
    <zn-popup v-if="this.$store.state.modal.zn_popup" :visible="this.$store.state.modal.zn_popup"
             :callType="'input'" @selectZn="closepopZnkey" :LINETYPE=this.ZN_POPUP_LINETYPE>
    ></zn-popup>
    <!-- 팝업 호출 -->
  </div>

</template>

<script>
// AUIGrid 컴포넌트
import AUIGrid from "@/components/auigrid/import/AUIGrid-Vue.js/AUIGrid";
import {getCmCodeLoad, getCmCodeLoadArray} from "@/services/common";
import moment from "moment";
import ItemPopup from "@/pages/components/modal/ItemPopup";
import {mapMutations} from "vuex";
import AckeyPopup from "@/pages/components/modal/AckeyPopup";
import ZnPopup from "@/pages/components/modal/ZnPopup";

export default {

  components: {
    ZnPopup,
    AUIGrid,
    ItemPopup,
    AckeyPopup,
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
      ZN_POPUP_TYPE : '',
      ZN_POPUP_DATAFILED: '',
      ZN_POPUP_LINETYPE: '',
      ACKEY_POPUP_TYPE : '',


      // 그리드 칼럼 레이아웃 정의
      columnLayoutHD: [],
      columnLayoutDT: [],
      // 그리드 속성 정의 default 그리드 프로퍼티 사용
      auigridPropsHD: this.$DEFAULT_GRID_PROP,
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
      { dataField: "WOHDTYPE", headerText: "조정구분", headerStyle: "aui-grid-required-header", width: 120,
        styleFunction : function(rowIndex, columnIndex, value, headerText, item, dataField) {
          if(item.row_status == "I"){
            return "aui-grid-cell-editable";
          }else{
            return "";
          }
        },
        labelFunction: function (rowIndex, columnIndex, value, headerText, item) {
          var labelvalue = '';
          for(var i=0; i < that.WOHDTYPELIST.length; i++){
            if(that.WOHDTYPELIST[i].code == value) labelvalue = that.WOHDTYPELIST[i].code_nm;
          }
          return labelvalue;
        },
        editRenderer: {
          type: "DropDownListRenderer",
          list: this.WOHDTYPELIST.filter(item => item.code != ""), //key-value Object 로 구성된 리스트
          keyField: "code", // key 에 해당되는 필드명
          valueField: "code_nm", // value 에 해당되는 필드명
        },
      },
      { dataField: "WOHDDATE", headerText: "지시 날짜", width: 120, editable: false },
      { dataField: "REQUESTDATE", headerText: "요청 날짜", headerStyle: "aui-grid-required-header", width: 120 ,
        dataType: "date",
        dateInputFormat: "yyyy-mm-dd", // 실제 데이터의 형식 지정
        formatString: "yyyy-mm-dd", // 실제 데이터 형식을 어떻게 표시할지 지정
        styleFunction : function(rowIndex, columnIndex, value, headerText, item, dataField) {
          if(item.WKSTATUS_CODE == "00"){
            return "aui-grid-cell-editable";
          }else{
            return "";
          }
        },
        editRenderer: {
          type: "CalendarRenderer",
          defaultFormat: "yyyy-mm-dd", // 달력 선택 시 데이터에 적용되는 날짜 형식
          showExtraDays: true, // 지난 달, 다음 달 여분의 날짜(days) 출력
          onlyCalendar: false, // 사용자 입력 불가, 즉 달력으로만 날짜입력 (기본값 : true)
          showTodayBtn: true, // 오늘 날짜 선택 버턴 출력
          showUncheckDateBtn: true, // 날짜 선택 해제 버턴 출력
          todayText: "오늘 선택", // 오늘 날짜 버턴 텍스트
          uncheckDateText: "날짜 선택 해제", // 날짜 선택 해제 버턴 텍스트
          uncheckDateValue: "", // 날짜 선택 해제 버턴 클릭 시 적용될 값.
        }

      },
      { dataField: "WKSTATUS_CODE", headerText: "상태코드", width: 100, editable: false, visible: false },
      { dataField: "WKSTATUS", headerText: "상태값", filter: {showIcon: true}, width: 120, editable: false,
        styleFunction : function(rowIndex, columnIndex, value, headerText, item, dataField) {
          if(item.WKSTATUS_CODE == "50"){ return "aui-grid-cell-green01_center";
          }else if(item.WKSTATUS_CODE == "90"){ return "aui-grid-cell-gray01_center";
          }else if(item.WKSTATUS_CODE == "91"){ return "aui-grid-cell-red01_center";
          }else{ return ""; }
        }
      },
      { dataField: "WTORD_HEAD_ORDE", headerText: "오더번호", width: 150,
        styleFunction : function(rowIndex, columnIndex, value, headerText, item, dataField) {
          if(item.WKSTATUS_CODE == "00"){
            return "aui-grid-cell-editable";
          }else{
            return "";
          }
        },
      },
      { dataField: "COMMENTS1", headerText: "비고1", style : "left-text aui-grid-cell-editable", width: 200 },
      { dataField: "COMMENTS2", headerText: "비고2", style : "left-text aui-grid-cell-editable", width: 200 },
      { dataField: "INSERTDATE", headerText: "등록일시", width: 135, editable: false},
      { dataField: "INSERTURKEY", headerText: "등록자", width: 100, editable: false},
      { dataField: "UPDATEDATE", headerText: "수정일시",width: 135, editable: false},
      { dataField: "UPDATEURKEY", headerText: "수정자", width: 100, editable: false},
    ]

    this.columnLayoutDT = [
      { dataField: "CTKEY", headerText: "센터코드", width: 120, editable: false, visible: false},
      { dataField: "WOHDKEY", headerText: "지시 공통 코드", width: 150, editable: false },
      { dataField: "WODTKEY", headerText: "지시 상세 코드", width: 100, editable: false },
      { dataField: "ICKEY", headerText: "품목코드", width: 150, headerStyle: "aui-grid-required-header", editable: false,
        styleFunction : function(rowIndex, columnIndex, value, headerText, item, dataField) {
          if(item.WKSTATUS_CODE == "00"){
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
            if(item.WKSTATUS_CODE == "00"){
              return that.$searchIcon;
            }else{
              return "";
            }
          },
          onClick: function(event) {
            that.openPopItem('GRID',event);
          }
        }
      },
      { dataField: "ICNAME", headerText: "품목명", width: 200, editable: false, style : "left-text" },
      { dataField: "INITQTY", headerText: "지시수량", width: 80, headerStyle: "aui-grid-required-header",dataType : "numeric", formatString: "#,###", style:"right-text",
        styleFunction : function(rowIndex, columnIndex, value, headerText, item, dataField) {
          if(item.WKSTATUS_CODE == "00"){
            return "aui-grid-cell-editable";
          }else{
            return "";
          }
        },
        editRenderer : {
          type : "InputEditRenderer",
          onlyNumeric : true, // 0~9 까지만 허용
        }
      },
      { dataField: "WKSTATUS_CODE", headerText: "상태코드", width: 100, editable: false, visible: false},
      { dataField: "WKSTATUS", headerText: "상태값", filter: {showIcon: true}, width: 120, editable: false,
        styleFunction : function(rowIndex, columnIndex, value, headerText, item, dataField) {
          if(item.WKSTATUS_CODE == "50"){ return "aui-grid-cell-green01_center";
          }else if(item.WKSTATUS_CODE == "90"){ return "aui-grid-cell-gray01_center";
          }else if(item.WKSTATUS_CODE == "91"){ return "aui-grid-cell-red01_center";
          }else{ return ""; }
        }
      },
      { dataField: "UOM", headerText: "단위", width: 80, style:"aui-grid-cell-editable", headerStyle: "aui-grid-required-header",
        styleFunction : function(rowIndex, columnIndex, value, headerText, item, dataField) {
          if(item.WKSTATUS_CODE == "00"){
            return "aui-grid-cell-editable";
          }else{
            return "";
          }
        },
      },
      {
        headerText : "FROM",
        children : [
          { dataField: "FR_ZNKEY", headerText: "존코드", headerStyle: "aui-grid-required-header", style: "", width: 120, editable: false,
            styleFunction : function(rowIndex, columnIndex, value, headerText, item, dataField) {
              if(item.WKSTATUS_CODE == "00"){
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
                if(item.WKSTATUS_CODE == "00"){
                  return that.$searchIcon;
                }else{
                  return "";
                }
              },
              onClick: function(event) {
                that.openPopZnkey('GRID',event);
              }
            }
          },
          { dataField: "FR_ZNNAME", headerText: "존명", width: 200, style: "left-text", editable: false,},
          { dataField: "FR_LCKEY", headerText: "로케이션 코드", width: 140, editable: false, visible: false},
        ] // end of children
      },
      {
        headerText : "TO",
        children : [
          { dataField: "TO_ZNKEY", headerText: "존코드", headerStyle: "aui-grid-required-header", style: "", width: 120, editable: false,
            styleFunction : function(rowIndex, columnIndex, value, headerText, item, dataField) {
              if(item.WKSTATUS_CODE == "00"){
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
                if(item.WKSTATUS_CODE == "00"){
                  return that.$searchIcon;
                }else{
                  return "";
                }
              },
              onClick: function(event) {
                that.openPopZnkey('GRID',event);
              }
            }
          },
          { dataField: "TO_ZNNAME", headerText: "존명", width: 200, style: "left-text", editable: false,},
          { dataField: "TO_LCKEY", headerText: "로케이션 코드", width: 140, editable: false, visible: false},
        ] // end of children
      },
      { dataField: "WMSREMARK", headerText: "비고", width: 200, style : "aui-grid-cell-editable"},
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
    ...mapMutations('modal', ['setItem_popup', 'setAckey_popup','setZn_popup']),
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
    }, masterAddRow() {
      // 하단에 1행 추가
      console.log('행추가 !!')
      let item = {
        row_status: 'I',
        WOHDDATE: moment().format("YYYY-MM-DD"),
        REQUESTDATE: moment().format("YYYY-MM-DD"),
        WKSTATUS_CODE: '00',
        WKSTATUS: '작업예정',
      };
      this.$refs.hdGrid.addRow(item, "last");
      this.$refs.dtGrid.clearGridData();
      this.masterRow = {};
    }, masterRemoveRow() {
      const list = this.$refs.hdGrid.getCheckedRowItemsAll()
      console.log("list==="+list)
      if (list.length == 0) {
        this.$message.info('삭제할 행을 선택하세요.');
        return
      }else{
        for(var i = 0; i < list.length; i++){
          if(list[i].WKSTATUS_CODE != '00'){
            this.$message.info(list[i].WOHDKEY + ' 작업 예정이 아니기에 삭제할 수 없습니다.');
            return
          }
        }
      }
      // 체크된 행 삭제 처리
      this.$refs.hdGrid.removeCheckedRows()
    }, masterSaveGrid() {
      console.log("======= masterSaveGrid =====")
      const data = this.$gridGetCudData(this.$refs.hdGrid, ["WOHDTYPE", "REQUESTDATE", "WOHDTYPE"])
      console.log("data==== ", data)
      if (data.length) {
        this.loading = true
        this.$gridCallUrl("/backed/work/saveWorkOrderHd",data).then((res) => {
          console.log('res====', res)
          this.$message.success('저장완료')
          this.searchMaster()
        }, error => {
          this.loading = false
          console.log('saveMaster error ==== ', error)
        })
      }
    }, detailAddRow() {
      console.log(this.masterRow.WOHDKEY);
      if (this.masterRow.WOHDKEY != undefined) {
        if(this.masterRow.WKSTATUS_CODE != '00'){
          this.$message.info('작업 예정이 아니므로 추가할 수 없습니다.');
          return
        }
        let item = {
          row_status: 'I',
          WOHDKEY : this.masterRow.WOHDKEY,
          WKSTATUS_CODE: '00',
          WKSTATUS: '작업예정',
        }
        this.$refs.dtGrid.addRow(item, "last")
      } else {
        this.$message.warn('지시HD를 선택하세요.', 3)
      }
      console.log('test == ', this.masterRow)
    }, detailRemoveRow() {
      const list = this.$refs.dtGrid.getCheckedRowItemsAll()
      if (list.length == 0) {
        this.$message.info('삭제할 행을 선택하세요.');
        return
      }else{
        for(var i = 0; i < list.length; i++){
          if(list[i].WKSTATUS_CODE != '00'){
            this.$message.info('지시상세코드 [' + list[i].WODTKEY + '] 작업 예정이 아니기에 삭제할 수 없습니다.');
            return
          }
        }
      }
      // 체크된 행 삭제 처리
      this.$refs.dtGrid.removeCheckedRows()
    }, cellClickHandler(event) {
      if (event.dataField == "WOHDKEY" && event.item.row_status != "I") {
        this.masterRow = event.item
        this.searchDetail()
      }else if(event.item.row_status == "I"){
        this.masterRow = [];
        this.$refs.dtGrid.clearGridData();
      }/* else {
        this.$refs.dtGrid.clearGridData();
      }*/
    }, cellEditBeginHandler(event){
      // cell 수정여부
      if(event.item.WKSTATUS_CODE != "00"
          && event.dataField != "COMMENTS1" && event.dataField != "COMMENTS2" && event.dataField != "WMSREMARK"){
        return false;
      }else if(event.dataField == "WOHDTYPE" && event.item.row_status != "I"){  //작업구분은 생성할때만 변경되게 처리
        return false;
      }
    }, saveDetail() {
      const rows = this.$gridGetCudData(this.$refs.dtGrid, ['WOHDKEY', 'ICKEY', 'INITQTY', 'UOM', 'FR_ZNKEY', 'TO_ZNKEY'])
      const data = rows.map(item =>({
        ...item,ROLE_ID:this.masterRow.ID,UNIQUE_KEY:this.masterRow.UNIQUE_KEY
      }))
      console.log('data===@@ ',data)
      if (data.length > 0) {
        this.loading = true
        this.$gridCallUrl("/backed/work/saveWorkOrderDt",data).then((res) => {
          this.$message.success('저장완료');
          this.searchDetail()
        }, error => {
          console.log('error ==== ', error)
        })
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
    }, openPopZnkey(target, event) {
      console.log(event);
      if(target == 'GRID'){
        this.$CELL_INFO.rowIndex = event.rowIndex;

        if (event.dataField == "FR_ZNKEY") this.ZN_POPUP_DATAFILED = 'FR'
        else if (event.dataField == "TO_ZNKEY") this.ZN_POPUP_DATAFILED = 'TO'
        // wohdtype
        if(this.masterRow.WOHDTYPE == '4'){       //창고->라인
          if (event.dataField == "FR_ZNKEY") this.ZN_POPUP_LINETYPE = '10'
          if (event.dataField == "TO_ZNKEY") this.ZN_POPUP_LINETYPE = '20'
        }else if(this.masterRow.WOHDTYPE == '5'){ //라인->창고
          if (event.dataField == "FR_ZNKEY") this.ZN_POPUP_LINETYPE = '20'
          if (event.dataField == "TO_ZNKEY") this.ZN_POPUP_LINETYPE = '10'
        }else if(this.masterRow.WOHDTYPE == '6'){ //창고->창고
          if (event.dataField == "FR_ZNKEY") this.ZN_POPUP_LINETYPE = '10'
          if (event.dataField == "TO_ZNKEY") this.ZN_POPUP_LINETYPE = '10'
        }
      }
      this.ZN_POPUP_TYPE = target
      console.log("rowIndex===", this.$CELL_INFO.rowIndex)
      this.setZn_popup(true)
    }, closepopZnkey(event) { //품번팝업에서 선택한 대상
      if(this.ZN_POPUP_TYPE == 'GRID'){
        console.log(event);
        if(this.ZN_POPUP_DATAFILED == 'FR'){
          this.$refs.dtGrid.setCellValue(this.$CELL_INFO.rowIndex, "FR_ZNKEY", event.ZNKEY);
          this.$refs.dtGrid.setCellValue(this.$CELL_INFO.rowIndex, "FR_ZNNAME", event.ZNNAME);
          this.$refs.dtGrid.setCellValue(this.$CELL_INFO.rowIndex, "FR_LCKEY", '');
        }else if(this.ZN_POPUP_DATAFILED == 'TO'){
          this.$refs.dtGrid.setCellValue(this.$CELL_INFO.rowIndex, "TO_ZNKEY", event.ZNKEY);
          this.$refs.dtGrid.setCellValue(this.$CELL_INFO.rowIndex, "TO_ZNNAME", event.ZNNAME);
          this.$refs.dtGrid.setCellValue(this.$CELL_INFO.rowIndex, "TO_LCKEY", '');
        }
      }
      this.ZN_POPUP_DATAFILED = '';
      this.ZN_POPUP_LINETYPE = ''
      this.setZn_popup(false)
    }, resetIckey() {
      this.queryParam.ickey  = ''
      this.queryParam.icname = ''
    }, postDtChange(event, dateString){
      this.queryParam.startDt = dateString[0].replace(/-/g,'');
      this.queryParam.endDt = dateString[1].replace(/-/g,'');
    }, openPopAckey(target, event) {
      if(target == 'GRID'){
        this.$CELL_INFO.rowIndex = event.rowIndex;
      }
      this.ACKEY_POPUP_TYPE = target;
      this.setAckey_popup(true)
    }, closepopAckey(event) { //품번팝업에서 선택한 대상
      if(this.ACKEY_POPUP_TYPE == 'GRID'){
        this.$refs.hdGrid.setCellValue(this.$CELL_INFO.rowIndex, "ACKEY", event.ACKEY);
        this.$refs.hdGrid.setCellValue(this.$CELL_INFO.rowIndex, "ACNAME", event.ACNAME);
      }
      this.setAckey_popup(false)
    }
  }
}

</script>

<style lang="less" scoped>

</style>