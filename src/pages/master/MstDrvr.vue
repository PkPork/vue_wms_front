<template>
  <div id="components-form-demo-advanced-search">
    <a-spin :spinning="loading" size="large">
      <a-form class="ant-advanced-search-form">
        <a-row :gutter="24">
          <a-col :span="5" :style="{ }">
            <a-form-item label="기사명" :labelCol ="{span: 5}" >
              <a-input v-model="queryParam.drvname" placeholde1="입력하세요." @keyup.enter="searchData" />
            </a-form-item>
          </a-col>
          <a-col :span="6" :style="{ }">
            <a-form-item label="차량번호" :labelCol ="{span: 4}">
              <a-input v-model="queryParam.plateno" placeholde1="입력하세요." @keyup.enter="searchData" />
            </a-form-item>
          </a-col>
          <a-col :span="5" :style="{ }">
            <a-form-item label="차종">
              <a-select v-model="queryParam.equiptypcd">
                <a-select-option :key="item.code" :value="item.code" v-for="(item, index) in CARTYPE_LIST">
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
        <a-row :gutter="24">
          <a-col :span="5" :style="{ }">
            <a-form-item label="모바일번호">
              <a-input v-model="queryParam.mobileno" placeholde1="입력하세요." @keyup.enter="searchData" />
            </a-form-item>
          </a-col>
          <a-col :span="6" :style="{ }">
            <a-form-item label="운송사코드">
              <a-input v-model="queryParam.carrkey" placeholde1="입력하세요." @keyup.enter="searchData" />
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
          <AUIGrid ref="mstDrvrGrid" class="grid-wrap"
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
      CARTYPE_LIST: [],   //차종
      YESNO_LIST: [],
      // 쿼리 매개변수
      queryParam: {
        drvname: "",
        plateno: "",
        equiptypcd: "",
        delyn: "",
        mobileno: "",
        carrkey: "",

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
    //this.CARTYPE_LIST = await getCmCodeLoad('CARTYPE', '전체')
    //this.YESNO_LIST = await getCmCodeLoad('YESNO', '전체')

    //1.1 공통코드 배열형태로 들고오기
    const cm_code = await getCmCodeLoadArray(['YESNO','KX001'],'전체')
    this.CARTYPE_LIST = cm_code.KX001
    this.YESNO_LIST  = cm_code.YESNO


    //2. 컬럼 레이아웃 선언
    this.columnLayout = [
      {dataField: "MOBILENO", headerText: "모바일번호", headerStyle: "aui-grid-required-header", style: "", width: 120,
        labelFunction: function (rowIndex, columnIndex, value, headerText, item, dataField) { // 출력 텍스트 사용자 정의
          value = value + ""; // 완전한 문자로 다시 확인
          if (value.length == 11) {
            var v1 = value.substr(0, 3);
            var v2 = value.substr(3, 4);
            var v3 = value.substr(7, 4);
            return v1 + "-" + v2+ "-" + v3; // 3자리 끊어서 대쉬 넣음
          }
          return value; // 원래대로 출력시킴
        },
        editRenderer: {
          type: "InputEditRenderer",
          onlyNumeric: true, // Input 에서 숫자만 가능케 설정
          // 에디팅 유효성 검사
          validator: function (oldValue, newValue, item) {
            var isValid = false;
            if (newValue && newValue.length == 11) {
              isValid = true;
            }
            // 리턴값은 Object 이며 validate 의 값이 true 라면 패스, false 라면 message 를 띄움
            return { "validate": isValid, "message": "010 휴대전화 번호를 정확히 입력해 주세요.." };
          }
        }
      },

      {dataField: "DRVNAME", headerText: "기사명", headerStyle: "aui-grid-required-header", style: "", width: 120 },
      { dataField: "EQUIPTYPCD", headerText: "차종", headerStyle: "aui-grid-required-header", width: 120,
        labelFunction: function (rowIndex, columnIndex, value, headerText, item) {
          var labelvalue = '';
          for(var i=0; i < that.CARTYPE_LIST.length; i++){
            if(that.CARTYPE_LIST[i].code == value) labelvalue = that.CARTYPE_LIST[i].code_nm;
          }
          return labelvalue;
        },
        editRenderer: {
          type: "DropDownListRenderer",
          showEditorBtnOver: true, // 마우스 오버 시 에디터버턴 보이기
          list: this.CARTYPE_LIST.filter(item => item.code != ""), //key-value Object 로 구성된 리스트
          keyField: "code", // key 에 해당되는 필드명
          valueField: "code_nm", // value 에 해당되는 필드명
        },
      },
      {dataField: "PLATENO", headerText: "차량번호", style: "left-text", width: 120},
      {dataField: "CARRKEY", headerText: "운송사코드", style: "left-text",width: 120 },
      {dataField: "PSNNO", headerText: "주민번호", style: "left-text", width: 120},
      {dataField: "TEL", headerText: "전화번호", style: "left-text", width: 120},
      {dataField: "ZIPCD", headerText: "우편번호", width: 120,
        labelFunction: function (rowIndex, columnIndex, value, headerText, item, dataField) { // 출력 텍스트 사용자 정의
          value = value + ""; // 완전한 문자로 다시 확인
          if (value.length == 6) {
            var v1 = value.substr(0, 6);}
          return value; // 원래대로 출력시킴
        },
        editRenderer: {
          type: "InputEditRenderer",
          onlyNumeric: true, // Input 에서 숫자만 가능케 설정
          // 에디팅 유효성 검사
          validator: function (oldValue, newValue, item) {
            var isValid = false;
            if (newValue && newValue.length == 6) {
              isValid = true;
            }
            // 리턴값은 Object 이며 validate 의 값이 true 라면 패스, false 라면 message 를 띄움
            return { "validate": isValid, "message": "정확한 우편번호 6자리를 입력해 주세요." };
          }
        }
      },


      {dataField: "ADDRESS1", headerText: "주소 1", style: "left-text", width: 220},
      {dataField: "ADDRESS2", headerText: "주소 2", style: "left-text", width: 220},
      {dataField: "DRVLICNO", headerText: "라이선스번호", style: "left-text", width: 120},
      {dataField: "URKEY", headerText: "사용자 아이디", style: "left-text", width: 120},
      {dataField: "DELURTYPE", headerText: "배송담당구분", style: "left-text", width: 120},
      {dataField: "REGULATYPE", headerText: "정규/예비 구분", style: "left-text", width: 120},
      {dataField: "FILENAME", headerText: "첨부파일명", style: "left-text", width: 120},
      {dataField: "IMGFILE", headerText: "사진파일", style: "left-text", width: 120},
      {dataField: "TEAMKEY", headerText: "조코드", style: "left-text", width: 120},
      {dataField: "CTKEY", headerText: "센터코드", style: "left-text", width: 120,visible:false},
      {dataField: "DT_ENTER", headerText: "입사일", style: "left-text", width: 120},
      {dataField: "DELYN", headerText: "삭제여부", style: "left-text", width: 120},
      {dataField: "INSERTURKEY", headerText: "등록 사용자 ID", style: "left-text", width: 120},
      {dataField: "INSERTDATE", headerText: "등록일시", style: "left-text", width: 135},
      {dataField: "UPDATEURKEY", headerText: "수정 사용자 ID", style: "left-text", width: 120},
      {dataField: "UPDATEDATE", headerText: "수정 일시", style: "left-text", width: 135},
      {dataField: "OWKEY", headerText: "화주코드", style: "left-text", width: 120,visible:false},
    ]

    let mstDrvrGrid = this.$refs.mstDrvrGrid;
    mstDrvrGrid.create(this.columnLayout, this.auigridProps);
    // 그리드 데이터 삽입하기
    mstDrvrGrid.setGridData(this.gridData);

  },watch:{
    gridData: function (newVal, oldVal) {
      this.$refs.mstDrvrGrid.setGridData(newVal);
    },
  }, created() {

  },
  methods: {
    searchData() {
      this.loading = true
      this.$gridCallUrl("/backed/mstdrvr/getMstDrvrList",this.queryParam).then((res) => {
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
      this.$refs.mstDrvrGrid.addRow(item, "last");
    },
    gridRemoveRow() {
      const list = this.$refs.mstDrvrGrid.getCheckedRowItemsAll()
      if (list.length == 0) {
        this.$message.info('삭제할 행을 선택하세요.');
        return
      }
      // 체크된 행 삭제 처리
      this.$refs.mstDrvrGrid.removeCheckedRows()
    }, cellClickHandler(event) {
      // 셀클릭 이벤트 핸들링

    },
    cellEditBeginGrid(event) {
      //해당 필드는 update 불가, add 시 입력가능
      return this.$gridEditable(this.$refs.mstDrvrGrid, event, ["MOBILENO"])
    }, saveGrid() {

      //예를 그리드 이름 홍길동 지어놓고 부르는건 영희를 불렀음.
      //영희는 없음
      const data = this.$gridGetCudData(this.$refs.mstDrvrGrid, ["MOBILENO","DRVNAME","EQUIPTYPCD"])

      if (data.length>0) {
        this.loading = true
        this.$gridCallUrl("/backed/mstdrvr/saveMstDrvr",data).then((res) => {
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
      this.$refs.mstDrvrGrid.exportToXlsx({ isRowStyleFront: false,fileName : "차량정보관리_엑셀자료"}) //엑셀다운로드 함수
    }, pageReset() {
      this.queryParam.drvname    = '';
      this.queryParam.plateno    = '';
      this.queryParam.equiptypcd = '';
      this.queryParam.delyn      = '';
      this.queryParam.mobileno   = '';
      this.queryParam.carrkey    =  '';

      this.gridData = [];
    },
  }
}

</script>

<style lang="less" scoped>

</style>