<template>
  <div id="components-form-demo-advanced-search">
    <a-spin :spinning="loading" size="large">
      <a-form class="ant-advanced-search-form">
        <a-row :gutter="24">
          <a-col :span="8" :style="{}">
            <a-form-item label="거래처" :labelCol="{span: 5}">
              <a-input-group>
                <a-row :gutter="8">
                  <a-col :span="10">
                    <a-input-search placeholder="" @search="onSearchAckey"
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
          <a-col :span="6" :style="{ }">
            <a-form-item label="거래상태">
              <a-select v-model="queryParam.storetype">
                <a-select-option :key="item.code" :value="item.code" v-for="(item, index) in STORETYPE_LIST">
                  {{ item.code_nm }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="7" :style="{ }">
            <a-form-item label="거래형태">
              <a-select v-model="queryParam.st011">
                <a-select-option :key="item.code" :value="item.code" v-for="(item, index) in ST011_LIST">
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
        <a-row :gutter="24">
          <a-col :span="8" :style="{}">
            <a-form-item label="거래처 유형" :labelCol="{span: 5}" >
              <a-select v-model="queryParam.actype">
                <a-select-option :key="item.code" :value="item.code" v-for="(item, index) in ACTYPE_LIST">
                  {{ item.code_nm }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="6" :style="{ }">
            <a-form-item label="사용여부">
              <a-select v-model="queryParam.useyn">
                <a-select-option :key="item.code" :value="item.code" v-for="(item, index) in USEYN_LIST">
                  {{ item.code_nm }}
                </a-select-option>
              </a-select>
            </a-form-item>
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
          <AUIGrid ref="mstAcGrid" class="grid-wrap"
                   @cellDoubleClick="cellClickHandler"
                   @cellEditBegin="cellEditBeginGrid"
                   style="height:56vh;width: 100%;"
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
import {getCmCodeLoad, getLoginUserCtkey} from "@/services/common";
import AckeyPopup from "@/pages/components/modal/AckeyPopup";
import {mapMutations} from "vuex";

export default {

  components: {
    AUIGrid,
    AckeyPopup
  },
  data: function () {
    return {
      loading: false,     //로딩바 유무
      STORETYPE_LIST: [],
      ST011_LIST: [],
      ACTYPE_LIST: [],
      USEYN_LIST: [],
      // 쿼리 매개변수
      queryParam: {
        ackey: "",
        acname: "",
        storetype: "",
        st011: "",
        actype: "",
        useyn: "",
      },
      selectedCtkey:'',
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
    this.STORETYPE_LIST = await getCmCodeLoad('STORETYPE', '전체')
    this.ST011_LIST = await getCmCodeLoad('ST011', '전체')
    this.ACTYPE_LIST = await getCmCodeLoad('ACTYPE', '전체')
    this.USEYN_LIST = await getCmCodeLoad('USE_YN', '전체')
    this.YESNO_LIST = await getCmCodeLoad('YESNO', '전체')

    //2. 컬럼 레이아웃 선언
    this.columnLayout = [
      { dataField: "OWKEY", headerText: "화주",width: 80},
      { dataField: "ACKEY", headerText: "거래처 코드", headerStyle: "aui-grid-required-header", style: "", width: 100},
      { dataField: "ACNAME", headerText: "거래처명", width: 140, style: "left-text "},
      { dataField: "DELYN", headerText: "삭제여부", width: 100,
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
      { dataField: "REGNO", headerText: "사업자등록 번호", style: "left-text",width: 120},
      { dataField: "CEO", headerText: "대표자", width: 80},
      { dataField: "ACTEL", headerText: "전화번호", style: "left-text",width: 100},
      { dataField: "ADDRESS1", headerText: "주소", style: "left-text",width: 150},
      { dataField: "STORETYPE", headerText: "거래 상태", style: "left-text",width: 80,
        labelFunction: function (rowIndex, columnIndex, value, headerText, item) {
          var labelvalue = '';
          for(var i=0; i < that.STORETYPE_LIST.length; i++){
            if(that.STORETYPE_LIST[i].code == value) labelvalue = that.STORETYPE_LIST[i].code_nm;
          }
          return labelvalue;
        },
        editRenderer: {
          type: "DropDownListRenderer",
          showEditorBtnOver: true, // 마우스 오버 시 에디터버턴 보이기
          list: this.STORETYPE_LIST.filter(item => item.code != ""), //key-value Object 로 구성된 리스트
          keyField: "code", // key 에 해당되는 필드명
          valueField: "code_nm", // value 에 해당되는 필드명
        },
      },
      { dataField: "ACSTDATE",
        headerText: "거래시작일",
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
      { dataField: "ACENDDATE",
        headerText: "거래종료일",
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
      { dataField: "ETBUSINEITEM", headerText: "거래형태", style: "center-text", width: 100,
        labelFunction: function (rowIndex, columnIndex, value, headerText, item) {
          var labelvalue = '';
          for(var i=0; i < that.ST011_LIST.length; i++){
            if(that.ST011_LIST[i].code == value) labelvalue = that.ST011_LIST[i].code_nm;
          }
          return labelvalue;
        },
        editRenderer: {
          type: "DropDownListRenderer",
          showEditorBtnOver: true, // 마우스 오버 시 에디터버턴 보이기
          list: this.ST011_LIST.filter(item => item.code != ""), //key-value Object 로 구성된 리스트
          keyField: "code", // key 에 해당되는 필드명
          valueField: "code_nm", // value 에 해당되는 필드명
        },
      },
      { dataField: "ACTYPE", headerText: "거래처 유형", style: "center-text", width: 120,
        labelFunction: function (rowIndex, columnIndex, value, headerText, item) {
          var labelvalue = '';
          for(var i=0; i < that.ACTYPE_LIST.length; i++){
            if(that.ACTYPE_LIST[i].code == value) labelvalue = that.ACTYPE_LIST[i].code_nm;
          }
          return labelvalue;
        },
        editRenderer: {
          type: "DropDownListRenderer",
          showEditorBtnOver: true, // 마우스 오버 시 에디터버턴 보이기
          list: this.ACTYPE_LIST.filter(item => item.code != ""), //key-value Object 로 구성된 리스트
          keyField: "code", // key 에 해당되는 필드명
          valueField: "code_nm", // value 에 해당되는 필드명
        },
      },
      { dataField: "BUSINESSTYPE", headerText: "비즈니스타입", style: "left-text",width: 150},
      { dataField: "BUSINESSCATEGORY", headerText: "비즈니스카테고리", style: "left-text",width: 150},
      { dataField: "COUNTRYCODE", headerText: "지역코드",width: 80},
      { dataField: "ADDRESS2", headerText: "주소2", style: "left-text",width: 120},
      { dataField: "CITY", headerText: "도시명", style: "left-text",width: 100},
      { dataField: "STATE", headerText: "STATE", style: "left-text",width: 80},
      { dataField: "ZIPCODE", headerText: "우편번호", style: "left-text",width: 80},
      { dataField: "TEL1", headerText: "전화번호1", style: "left-text",width: 100},
      { dataField: "TEL2", headerText: "전화번호2", style: "left-text",width: 100},
      { dataField: "FAX", headerText: "팩스번호", style: "left-text",width: 100},
      { dataField: "CONTACT", headerText: "담당자", style: "left-text",width: 80},
      { dataField: "EMAIL", headerText: "E-MAIL", style: "left-text",width: 120},
      { dataField: "CLOSINGDATE", headerText: "종료일시", style: "left-text",width: 150},
      { dataField: "INSERTURKEY", headerText: "등록자", style: "left-text",width: 80, readOnly: true},
      { dataField: "INSERTDATE", headerText: "등록일시", style: "left-text",width: 150, readOnly: true},
      { dataField: "UPDATEURKEY", headerText: "수정자", style: "left-text",width: 80, readOnly: true},
      { dataField: "UPDATEDATE", headerText: "수정일시", style: "left-text",width: 150, readOnly: true},
      { dataField: "UDF1", headerText: "사용자정의1", style: "left-text",width: 100},
      { dataField: "UDF2", headerText: "사용자정의2", style: "left-text",width: 100},
      { dataField: "UDF3", headerText: "사용자정의3", style: "left-text",width: 100},
      { dataField: "PO_WEEKDAY", headerText: "발주요일", style: "left-text",width: 80},
      { dataField: "LOGGRPCD", headerText: "상저온코드", style: "left-text",width: 120},
      { dataField: "REGDATE",
        headerText: "등록일자",
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
      { dataField: "REP_ACKEY", headerText: "대표거래처코드", style: "left-text",width: 130},
      { dataField: "REP_ACTYPE", headerText: "대표거래처유형", style: "left-text",width: 130},
      { dataField: "ICGRKEY", headerText: "상품그룹코드", style: "left-text",width: 130},
      { dataField: "ADDRID", headerText: "주소ID", style: "left-text",width: 150},
      { dataField: "URKEY", headerText: "사용자코드", style: "left-text",width: 100},
      { dataField: "URNAME", headerText: "사용자명", style: "left-text",width: 100},
      { dataField: "STOREORDTYPE", headerText: "매장주문유형", style: "left-text",width: 130},
      { dataField: "ACICGRTYPE", headerText: "거래처구분", style: "left-text",width: 130},
      { dataField: "ETC_ACICGRTYPE", headerText: "잡화매입처구분", style: "left-text",width: 130},
      { dataField: "NEWYN", headerText: "신규구분", style: "center-text", width: 120,
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
      { dataField: "POORDTYPE", headerText: "매입처발주 유형", style: "left-text",width: 150},
      { dataField: "BHAULINGYN", headerText: "백하울링 여부", style: "center-text", width: 120,
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
      { dataField: "LDG_TIME", headerText: "상차시간", style: "left-text",width: 100},
      { dataField: "UNLDG_TIME", headerText: "하차시간", style: "left-text",width: 100},
      { dataField: "POLEADTM", headerText: "매입처발주리드타임", style: "left-text",width: 130},
      { dataField: "POCLOSDATE", headerText: "매입처발주마감시간", style: "left-text",width: 130},
      { dataField: "DCKEY", headerText: "회차구분", style: "left-text",width: 100},
      { dataField: "OPERSTATYPE", headerText: "운영상태", style: "left-text",width: 100},
      { dataField: "CUST_ID", headerText: "거래처 구분(저온)", style: "right-text",width: 120},
      { dataField: "CDCYN", headerText: "CDC여부", style: "center-text", width: 100,
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
      { dataField: "ETOPERNO", headerText: "사업자번호", style: "left-text",width: 100},
      { dataField: "TAXOWNERNAME", headerText: "대표자명", style: "left-text",width: 100},
      { dataField: "ADDR1", headerText: "주소1", style: "left-text",width: 100},
      { dataField: "ACCLS", headerText: "ACCLS", style: "left-text",width: 100},
    ]

    let mstAcGrid = this.$refs.mstAcGrid;
    mstAcGrid.create(this.columnLayout, this.auigridProps);
    // 그리드 데이터 삽입하기
    mstAcGrid.setGridData(this.gridData);

  },watch:{
    gridData: function (newVal, oldVal) {
      this.$refs.mstAcGrid.setGridData(newVal);
    },
  }, created() {

  },
  methods: {
    ...mapMutations('modal', ['setAckey_popup']),
    searchData() {
      this.loading = true
      this.$gridCallUrl("/backed/mstac/getMstAcList",this.queryParam).then((res) => {
        console.log('res.data===',res.data)
        // 실제로 새로 고침이 빨라서 setTimeout 으로 약간의 시간을 두는중.
        setTimeout(() => this.loading = false, this.$gridDelayTime)
        this.gridData = res.data
      })
    },
    gridAddRow() {
      // 하단에 1행 추가
      let item = {NEWYN:"N", BHAULINGYN: "N", DELYN: "N",CUST_ID: "0",CDCYN: "N", row_status: 'I'};
      this.$refs.mstAcGrid.addRow(item, "last");
    },
    gridRemoveRow() {
      const list = this.$refs.mstAcGrid.getCheckedRowItemsAll()
      if (list.length == 0) {
        this.$message.info('삭제할 행을 선택하세요.');
        return
      }
      // 체크된 행 삭제 처리
      this.$refs.mstAcGrid.removeCheckedRows()
    }, cellClickHandler(event) {
      // 셀클릭 이벤트 핸들링

    },
    onSearchAckey() {
      console.log('@@@@@@@@ 거래처팝업 호출')
      this.setAckey_popup(true)
    },
    cellEditBeginGrid(event) {
      //해당 필드는 update 불가, add 시 입력가능
      return this.$gridEditable(this.$refs.mstAcGrid, event, ["CTKEY", "ACKEY", "OWKEY"])
    }, saveGrid() {
      //필수입력조건
      const data = this.$gridGetCudData(this.$refs.mstAcGrid, ["ACKEY", "OWKEY"])
      if (data.length) {
        this.loading = true
        this.$gridCallUrl("/backed/mstac/saveMstAc",data).then((res) => {
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
       this.$refs.mstAcGrid.exportToXlsx({ isRowStyleFront: false,}) //엑셀다운로드 함수
    }, pageReset() {
      this.queryParam = {ctkey: "", storetype: "", actype: "",st011:"",useyn:""} //조회조건
      this.gridData = [];
    }, selectAckeyPopup(event) {
        this.queryParam.ackey  = event.ACKEY
        this.queryParam.acname = event.ACNAME

        this.setAckey_popup(false)
    },resetAckey(){
      console.log('!@@@@@@@@@@@@')
      this.queryParam.item_cd  = ''
      this.queryParam.item_nm  = ''
    },
  }
}

</script>

<style lang="less" scoped>

</style>