<template>
  <div id="components-form-demo-advanced-search">
    <a-spin :spinning="loading" size="large">
      <a-form class="ant-advanced-search-form" :label-col="{ span: 7 }" :wrapper-col="{ span: 16 }">
        <a-row >
          <a-col :span="7" :style="{}">
            <a-form-item label="입고 구분" :labelCol="{span: 5}">
              <a-select v-model="queryParam.ibhdtype">
                <a-select-option :key="item.code" :value="item.code" v-for="(item, index) in IBHDTYPELIST">
                  {{ item.code_nm }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="7" :style="{}">
            <a-form-item label="작업 상태">
              <a-select v-model="queryParam.wkstatus">
                <a-select-option :key="item.code" :value="item.code" v-for="(item, index) in WKSTATUSLIST">
                  {{ item.code_nm }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="7" :style="{ }">
            <a-form-item label="입고 공통 코드">
              <a-input v-model="queryParam.ibhdkey" placeholde1="입력하세요." @keyup.enter="searchMaster" />
            </a-form-item>
          </a-col>
          <a-col :span="3" :style="{ textAlign: 'right' }">
            <a-button type="primary" icon="search" @click="searchMaster">조회</a-button>
            <a-button :style="{ marginLeft: '8px' }" @click="pageReset">초기화</a-button>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="7" :style="{}">
            <a-form-item label="입고 확정 일자"  :labelCol="{span: 5}">
              <a-range-picker
                  style="width: 100%"
                  :ranges="ranges"
                  @change="confDtChange"
              />
            </a-form-item>
          </a-col>
          <a-col :span="7" :style="{}">
            <a-form-item label="납품 일자" >
              <a-range-picker
                  style="width: 100%"
                  :ranges="ranges"
                  @change="puDtChange"
              />
            </a-form-item>
          </a-col>
          <a-col :span="7" :style="{}">
            <a-form-item label="수입검사유/무">
              <a-select v-model="queryParam.qcyn">
                <a-select-option :key="item.code" :value="item.code" v-for="(item, index) in QCYNLIST">
                  {{ item.code_nm }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="7" :style="{}">
            <a-form-item label="거래처" :labelCol="{span: 5}">
              <a-input-group>
                <a-row :gutter="8">
                  <a-col :span="10">
                    <a-input-search placeholder="" enter-button @search="onSearchAckey"
                                    v-model="queryParam.ackey"/>
                  </a-col>
                  <a-col :span="14">
                    <a-input default-value="" v-model="queryParam.acname" >
                      <a-icon slot="addonAfter" type="close-circle" @click="resetAckey"/>
                    </a-input>
                  </a-col>
                </a-row>
              </a-input-group>
            </a-form-item>
            <AckeyPopup v-if="this.$store.state.modal.ackey_popup"
                        :visible="this.$store.state.modal.ackey_popup"
                        @selectAckeyPopup="selectAckeyPopup"
            ></AckeyPopup>
          </a-col>
          <a-col :span="7" :style="{}">
            <a-form-item label="팔레트(패킹)유/무">
              <a-select v-model="queryParam.palletpackyn">
                <a-select-option :key="item.code" :value="item.code" v-for="(item, index) in USEYNLIST">
                  {{ item.code_nm }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>

      <div class="search-result-list" style="{width: 100%;}">
        <a-row>
          <a-col :span="24" style="text-align: left;" >
            <div class="sub_title" style="display: inline-block;"><a-icon type="caret-right" style="padding-right: 10px"/>입고 지시 공통 정보</div>
            <div class="btn_area" style="float: right;">
            <a-col style="float: left; padding-right: 10px" ><a-button type="primary" @click="tentativeConfirmRow" size="small"><a-icon type="check"/>가입고확정</a-button></a-col>
            <a-col style="float: left; padding-right: 10px" ><a-button type="primary" @click="confirmRow" size="small"><a-icon type="check"/>입고확정/전송</a-button></a-col>
            <a-col style="float: left; padding-right: 10px"><a-button type="primary" @click="saveRemark" size="small"><a-icon type="save"/>비고저장</a-button></a-col>
            <a-col style="float: left; padding-right: 10px"><a-button type="primary" @click="downLoadExcel('grid1')" size="small"><a-icon type="file-excel"/>다운로드</a-button></a-col>
<!--            <a-col style="float: left; padding-right: 10px"><a-button type="primary" @click="resetGrid" size="small"><a-icon type="reset"/>그리드초기화</a-button></a-col>-->
<!--            <a-col style="float: left; padding-right: 10px"><a-button type="primary" @click="saveGrid" size="small"><a-icon type="save"/>그리드저장</a-button></a-col>-->
            <a-col style="float: left; padding-right: 10px"><a-button type="primary" @click="gridCloseRow" size="small"><a-icon type="delete"/>마감(0처리)</a-button></a-col>
            </div>
          </a-col>
        </a-row>
        <div style="{width: 100%;}">
          <AUIGrid ref="InfoIbDtGrid" class="grid-wrap"
                   @cellDoubleClick="cellClickHandler"
                   @cellEditBegin = "cellEditBeginHandler"
                   style="height:56vh;width: 100%;"
          >
          </AUIGrid>
        </div>
      </div>
    </a-spin>
    <!-- 팝업 호출 -->
    <item-popup v-if="this.$store.state.modal.item_popup" :visible="this.$store.state.modal.item_popup"
                :callType="'input'" @closepopItem="closepopItem">
    </item-popup>
    <AckeyPopup v-if="this.$store.state.modal.ackey_popup" :visible="this.$store.state.modal.ackey_popup"
                :callType="'input'" @selectAckeyPopup="closepopAckey">
    ></AckeyPopup>
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

export default {

  components: {
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
      IBHDTYPELIST: [],
      WKSTATUSLIST: [],
      QCJDGMNTYNLIST: [],
      QCYNLIST: [],
      USEYNLIST: [],

      // 쿼리 매개변수
      queryParam: {
        ickey : "",
        ackey : "",
        acname : "",
        ibhdtype : "",
        wkstatus : "",
        qcyn : "",
        palletpackyn : "",
        ibhdkey : "",
        transNo : "",
        deliverDocNo : "",
        confStDt:"",
        confEndDt:"",
        startDt:"",
        endDt:"",
      },

      // 팝업
      ITEM_POPUP_TYPE : 'SEARCH',
      ACKEY_POPUP_TYPE : '',

      // 그리드 칼럼 레이아웃 정의
      columnLayout: [],
      // 그리드 속성 정의
      auigridPropsHD: {
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
      gridData: [],

    }

  },

  async beforeMount() {

  }, async mounted() {
    var that = this;

    //1.1 공통코드 배열형태로 들고오기
    const cm_code = await getCmCodeLoadArray(['IB_WKSTATUS', 'IBHDTYPE', 'QCYN', 'USE_YN','QC_JDGMNT_YN'],'전체')
    this.IBHDTYPELIST = cm_code.IBHDTYPE
    this.WKSTATUSLIST = cm_code.IB_WKSTATUS
    this.QCYNLIST = cm_code.QCYN
    this.QCJDGMNTYNLIST = cm_code.QC_JDGMNT_YN
    this.USEYNLIST = cm_code.USE_YN

    //1.2 변수 초기값 설정
    //this.queryParam.confStDt = moment().subtract(7, 'days').format("YYYYMMDD");
    //this.queryParam.confEndDt = moment().format("YYYYMMDD");

    //1.3 그리드 셋팅
    this.columnLayout = [
      { dataField: "PUWAITH_DATE", headerText: "납품일자", width: 120, editable:false },
      { dataField: "DELIVERDOCNO", headerText: "납품문서번호", width: 120, editable:false },
      { dataField: "DELIVERDOCSEQ", headerText: "납품번호", width: 120, editable:false },
      { dataField: "ACKEY", headerText: "거래처 코드", width: 120, editable:false},
      { dataField: "ACNAME", headerText: "거래처명", width: 200, editable:false, style : "left-text" },
      { dataField: "WKSTATUS", headerText: "작업상태",  width: 120, editable:false,
        labelFunction: function (rowIndex, columnIndex, value, headerText, item) {
          var labelvalue = '';
          for(var i=0; i < that.WKSTATUSLIST.length; i++){
            if(that.WKSTATUSLIST[i].code == value) labelvalue = that.WKSTATUSLIST[i].code_nm;
          }
          return labelvalue;
        },
      },
      { dataField: "ICKEY", headerText: "품목코드", width: 150, editable:false},
      { dataField: "ICNAME", headerText: "품목명", width: 200, editable: false, style : "left-text" },
      { dataField: "ICUTKEY", headerText: "품목단위코드", width: 150, editable:false, style:"left-text" },
      { dataField: "INITQTY", headerText: "입고수량", width: 80, editable:false, style:"right-text",  dataType : "numeric", formatString: "#,###",
        editRenderer : {
          type : "InputEditRenderer",
          onlyNumeric : true, // 0~9 까지만 허용
        }
      },
      { dataField: "EXQTY", headerText: "예정수량", width: 80, dataType : "numeric", formatString: "#,###",
        styleFunction : function(rowIndex, columnIndex, value, headerText, item, dataField) {
          if(item.WKSTATUS == "00"){
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
      { dataField: "CFQTY", headerText: "확정수량", width: 80, editable:false, dataType : "numeric", formatString: "#,###",
        editRenderer : {
          type : "InputEditRenderer",
          onlyNumeric : true, // 0~9 까지만 허용
        }
      },
      { dataField: "PLTQTY", headerText: "팔렛트수량", width: 80, editable:false,dataType : "numeric", formatString: "#,###",
        editRenderer : {
          type : "InputEditRenderer",
          onlyNumeric : true, // 0~9 까지만 허용
        }
      },
      { dataField: "EAQTY", headerText: "낱개수량", width: 80, editable:false, dataType : "numeric", formatString: "#,###",
        editRenderer : {
          type : "InputEditRenderer",
          onlyNumeric : true, // 0~9 까지만 허용
        }
      },
      { dataField: "IBCONFIRMDATE", headerText: "입고확정일시",  width: 120 , editable:false,
        dataType: "date",
        dateInputFormat: "yyyy-mm-dd", // 실제 데이터의 형식 지정
        formatString: "yyyy-mm-dd", // 실제 데이터 형식을 어떻게 표시할지 지정
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
      { dataField: "IBHDKEY", headerText: "입고 공통 코드", width: 150, editable:false},
      { dataField: "IBDTKEY", headerText: "입고상세코드", width: 100, editable:false},
      { dataField: "IBHDTYPE", headerText: "입고유형", width: 120, editable:false,
        labelFunction: function (rowIndex, columnIndex, value, headerText, item) {
          var labelvalue = '';
          for(var i=0; i < that.IBHDTYPELIST.length; i++){
            if(that.IBHDTYPELIST[i].code == value) labelvalue = that.IBHDTYPELIST[i].code_nm;
          }
          return labelvalue;
        },
        editRenderer: {
          type: "DropDownListRenderer",
          list: this.IBHDTYPELIST, //key-value Object 로 구성된 리스트
          keyField: "code", // key 에 해당되는 필드명
          valueField: "code_nm", // value 에 해당되는 필드명
        },
      },
      { dataField: "IBEXPECTDATE", headerText: "입고 예정 날짜", width: 120 , editable:false,
        dataType: "date",
        dateInputFormat: "yyyy-mm-dd", // 실제 데이터의 형식 지정
        formatString: "yyyy-mm-dd", // 실제 데이터 형식을 어떻게 표시할지 지정
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
      { dataField: "QCYN", headerText: "수입검사유무", width: 120,  editable:false,
        labelFunction: function (rowIndex, columnIndex, value, headerText, item) {
          var labelvalue = '';
          for(var i=0; i < that.QCYNLIST.length; i++){
            if(that.QCYNLIST[i].code == value) labelvalue = that.QCYNLIST[i].code_nm;
          }
          return labelvalue;
        },
      },
      { dataField: "QC_JDGMNT_RESULT", headerText: "QC 판정 결과", width: 100,  editable:false,
        labelFunction: function (rowIndex, columnIndex, value, headerText, item) {
          var labelvalue = '';
          for(var i=0; i < that.QCJDGMNTYNLIST.length; i++){
            if(that.QCJDGMNTYNLIST[i].code == value) labelvalue = that.QCJDGMNTYNLIST[i].code_nm;
          }
          return labelvalue;
        },
      },
      { dataField: "QC_JDGMNT_QTY", headerText: "QC합격수량", width: 80, style : "right-text aui-grid-cell-editable",editable:false },
      { dataField: "WKSTATUS", headerText: "상태값", filter: {showIcon: true}, width: 120, editable:false },
      { dataField: "UOM", headerText: "단위", filter: {showIcon: true}, width: 120, editable:false },
      { dataField: "LINE_STATUS", headerText: "라인여부", filter: {showIcon: true}, width: 120, editable:false },
      { dataField: "MV_LCKEY", headerText: "확정 LOCATION", filter: {showIcon: true}, width: 120, editable:false },
      { dataField: "TO_LCKEY", headerText: "TO로케이션코드", filter: {showIcon: true}, width: 120, editable:false },
      { dataField: "TO_ULCKEY", headerText: "TO ULC 코드", filter: {showIcon: true}, width: 120, editable:false },
      { dataField: "TO_ULCTYPE", headerText: "TO ULCTYPE", filter: {showIcon: true}, width: 120, editable:false },
      { dataField: "TRANS_NO", headerText: "거래명세서 번호", width: 150, editable:false},
      { dataField: "PALLETPACKYN", headerText: "팔렛트(패킹)유무",  width: 120, editable:false,
        labelFunction: function (rowIndex, columnIndex, value, headerText, item) {
          var labelvalue = '';
          for(var i=0; i < that.USEYNLIST.length; i++){
            if(that.USEYNLIST[i].code == value) labelvalue = that.USEYNLIST[i].code_nm;
          }
          return labelvalue;
        },
      },
      { dataField: "CTRREMARK", headerText: "CTR비고", width: 150, editable:true},
      { dataField: "WMSREMARK", headerText: "WMS비고", width: 150, style : "right-text aui-grid-cell-editable", editable:true},
      { dataField: "INSERTDATE", headerText: "등록일시", width: 135, editable:false},
      { dataField: "INSERTURKEY", headerText: "등록자", width: 100, editable:false},
      { dataField: "UPDATEDATE", headerText: "수정일시",width: 135, editable:false},
      { dataField: "UPDATEURKEY", headerText: "수정자", width: 100, editable:false},
    ]

    let InfoIbDtGrid = this.$refs.InfoIbDtGrid;

    // 그리드 생성
    InfoIbDtGrid.create(this.columnLayout, this.auigridPropsHD);

    // 그리드 데이터 삽입하기
    InfoIbDtGrid.setGridData(this.gridData);

  },watch:{
    gridData: function (newVal, oldVal) {
      this.$refs.InfoIbDtGrid.setGridData(newVal);
    },
  }, created() {
    // this.$refs.sysRoleGrid.resize(null,1200)
    // this.$refs.ctRole.resize(null,1200)
  },
  methods: {
    ...mapMutations('modal', ['setItem_popup', 'setAckey_popup']),
    moment,
    onSearchAckey() {
      console.log('@@@@@@@@ 거래처팝업 호출')
      this.setAckey_popup(true)
    },
    searchMaster() {
      console.log(this.queryParam);
      this.loading = true
      this.$gridCallUrl("/backed/inbound/getInbSchConfList",this.queryParam).then((res) => {
        // 실제로 새로 고침이 빨라서 setTimeout 으로 약간의 시간을 두는중.
        setTimeout(() => this.loading = false, this.$gridDelayTime)
        this.masterRow  = {}
        console.log(res.data)
        this.gridData = res.data

        // dt 자동 조회 추가
        if(res.data.length != 0){
          this.masterRow = res.data[0];
        }
      })
    }, tentativeConfirmRow() {
      // 가입고 확정
      const list = this.$refs.InfoIbDtGrid.getCheckedRowItemsAll()
      if (list.length == 0) {
        this.$message.info('가입고 확정할 행을 선택하세요.');
        return
      }
      this.loading = true

      for (var i = 0, len = list.length; i < len; i++) {
        Object.assign(list[i], {['sessionUserId']: this.$store.state.account.user.user_id}) //로그인 사용자 정보
        Object.assign(list[i], {['sessionCtkey']: this.$store.state.account.ctkey}) //로그인 사용자의 센터코드
        //console.log("editedItem==", editedItem)

        this.$gridCallUrl("/backed/inbound/saveTentativeConfirm",list).then((res) => {
          console.log('res====!@!@!@', res)
          this.$message.success('저장완료')
          this.searchMaster()
        }, error => {
          this.loading = false
          console.log('saveMaster error ==== ', error)
        })
      }
    }, confirmRow() {
      //입고확정
      const list = this.$refs.InfoIbDtGrid.getCheckedRowItemsAll()
      if (list.length == 0) {
        this.$message.info('입고확정할 행을 선택하세요.');
        return
      }
      this.loading = true;
      var rowItem;

      for (var i = 0, len = list.length; i < len; i++) {
        Object.assign(list[i], {['sessionUserId']: this.$store.state.account.user.user_id}) //로그인 사용자 정보
        Object.assign(list[i], {['sessionCtkey']: this.$store.state.account.ctkey}) //로그인 사용자의 센터코드
        rowItem = list[i];
        console.log("editedItem==", rowItem)
        if(rowItem.WKSTATUS != "81"){
          this.$message.info('가입고 상태가 아닙니다.');
          this.loading = false
          return
        }
        if(rowItem.QC_JDGMNT_RESULT == "0"){
          this.$message.info('QC확정 후 다시 시도 바랍니다..');
          this.loading = false
          return
        }
        this.$gridCallUrl("/backed/inbound/saveConfirm",list).then((res) => {

          console.log('res====!@!@!@', res)
          this.$message.success('저장완료')
          this.searchMaster()
        }, error => {
          this.loading = false
          console.log('saveConfirm error ==== ', error)
        })
      }
    }, gridCloseRow() {
      //마감처리
      const list = this.$refs.InfoIbDtGrid.getCheckedRowItemsAll()
      if (list.length == 0) {
        this.$message.info('마감처리할 행을 선택하세요.');
        return
      }
      this.loading = true;
      var rowItem;

      for (var i = 0, len = list.length; i < len; i++) {
        Object.assign(list[i], {['sessionUserId']: this.$store.state.account.user.user_id}) //로그인 사용자 정보
        Object.assign(list[i], {['sessionCtkey']: this.$store.state.account.ctkey}) //로그인 사용자의 센터코드
        rowItem = list[i];
        if(rowItem.WKSTATUS != "81" && rowItem.WKSTATUS != "00"){
          this.$message.info('입고예정 또는 가입고 상태가 아닙니다.');
          this.loading = false
          return
        }
        this.$gridCallUrl("/backed/inbound/saveClose",list).then((res) => {

          console.log('res====!@!@!@', res)
          this.$message.success('저장완료')
          this.searchMaster()
        }, error => {
          this.loading = false
          console.log('saveConfirm error ==== ', error)
        })
      }
    }, resetGrid() {
      // 그리드 초기화
      this.queryParam = {
        ickey : "",
        ibhdtype : "",
        wkstatus : "",
        qcyn : "",
        palletpackyn : "",
        ibhdkey : "",
        ibdtkey : "",
        transNo : "",
        deliverDocNo : "",
        confStDt:"",
        confEndDt:"",
        startDt:"",
        endDt:"",
      }
      this.gridData = [];
    }, saveRemark() {
      // 비고저장
      console.log("======= saveRemark =====")
      const data = this.$gridGetCudData(this.$refs.InfoIbDtGrid, ["IBHDKEY", "IBDTKEY"])
      console.log("data==== ", data)
      if (data.length) {
        this.loading = true
        this.$gridCallUrl("/backed/inbound/saveRemark",data).then((res) => {
          console.log('res====', res)
          this.$message.success('저장완료')
          this.searchMaster()
        }, error => {
          this.loading = false
          console.log('saveMaster error ==== ', error)
        })
      }
    }, cellClickHandler(event) {
      // 셀클릭 이벤트 핸들링
      console.log('event==@ ', event)
      if (event.dataField == "IBHDKEY" && event.item.row_status != "I") {
        this.masterRow = event.item
      }else if(event.item.row_status == "I"){
        this.masterRow = [];
      }
    }, cellEditBeginHandler(event){
      // cell 수정여부
      if(event.item.WKSTATUS_CODE != "00"
          && event.dataField != "WMSREMARK"){
        return false;
      }
    }, saveGrid() {
      // 그리드 저장
      console.log("======= gridCloseRow =====")
      const data = this.$gridGetCudData(this.$refs.InfoIbDtGrid, ["IBHDKEY", "IBDTKEY", "QC_JDGMNT_QTY", "QCYN", "WKSTATUS"])
      console.log('data===@@ ',data)
      if (data.length > 0) {
        this.loading = true
        //수입검사 Y인 경우&&작업상태가 가입고인 경우
        if(data.qcyn == '1' && data.wkstatus == '81'){
          this.$gridCallUrl("/backed/inbound/saveInbSchConf",data).then((res) => {
            this.$message.success('저장완료');
          }, error => {
            console.log('error ==== ', error)
          })
        }
      }
    }, downLoadExcel(id) {
      // 내보내기 실행
      this.$refs.InfoIbDtGrid.exportToXlsx({ isRowStyleFront: false,}) //엑셀다운로드 함수
    }, pageReset() {
      this.queryParam = {
        ickey : "",
        ibhdtype : "",
        wkstatus : "",
        qcyn : "",
        ibhdkey : "",
        transNo : "",
        deliverDocNo : "",
      }
      this.gridData = [];
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
      }
      this.setItem_popup(false)
    }, resetIckey() {
      this.queryParam.ickey  = ''
      this.queryParam.icname = ''
    }, confDtChange(event, dateString){
      this.queryParam.confStDt = dateString[0].replace(/-/g,'');
      this.queryParam.confEndDt = dateString[1].replace(/-/g,'');
    }, puDtChange(event, dateString){
      this.queryParam.startDt = dateString[0].replace(/-/g,'');
      this.queryParam.endDt = dateString[1].replace(/-/g,'');
    }, openPopAckey(target, event) {
      if(target == 'GRID'){
        this.$CELL_INFO.rowIndex = event.rowIndex;
      }
      this.ACKEY_POPUP_TYPE = target;
      this.setAckey_popup(true)
    }, closepopAckey(event) { //품번팝업에서 선택한 대상
      if (this.ACKEY_POPUP_TYPE == 'GRID') {
        this.$refs.InfoIbDtGrid.setCellValue(this.$CELL_INFO.rowIndex, "ACKEY", event.ACKEY);
        this.$refs.InfoIbDtGrid.setCellValue(this.$CELL_INFO.rowIndex, "ACNAME", event.ACNAME);
      }
      this.setAckey_popup(false)
    },selectAckeyPopup(event) {
      this.queryParam.ackey  = event.ACKEY
      this.queryParam.acname = event.ACNAME

      this.setAckey_popup(false)
    },resetAckey(){
      console.log('!@@@@@@@@@@@@')
      this.queryParam.ackey  = ''
      this.queryParam.acname  = ''
    },
  }
}

</script>

<style lang="less" scoped>

</style>