<template>
  <div id="components-form-demo-advanced-search">
    <a-spin :spinning="loading" size="large">
      <a-form class="ant-advanced-search-form">
        <a-row :gutter="24">
          <a-col :span="5" :style="{ }">
            <a-form-item label="사용자이름">
              <a-input v-model="queryParam.user_id" placeholde1="입력하세요." @keyup.enter="searchData" />
            </a-form-item>
          </a-col>
          <a-col :span="6" :style="{ }">
            <a-form-item label="이름">
              <a-input v-model="queryParam.name" placeholde1="입력하세요." @keyup.enter="searchData" />
            </a-form-item>
          </a-col>
          <a-col :span="5" :style="{ }">
            <a-form-item label="역할">
              <a-input v-model="queryParam.role_id" placeholde1="입력하세요." @keyup.enter="searchData" />
            </a-form-item>
          </a-col>
          <a-col :span="5" :style="{ }">
            <a-form-item label="상태">
              <a-select v-model="queryParam.status">
                <a-select-option :key="item.code" :value="item.code" v-for="(item, index) in USER_STATUS_LIST">
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
          <AUIGrid ref="codeGrpGrid" class="grid-wrap"
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
      USER_STATUS_LIST: [],
      USE_YN_LIST: [],
      // 쿼리 매개변수
      queryParam: {
        id: "",
        user_id: "",
        name: "",
        role_id: "",
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
    //1. 공통코드 load
    //this.CTTYPE_LIST = await getCmCodeLoad('CTTYPE', '전체')
    //this.YESNO_LIST = await getCmCodeLoad('YESNO', '전체')

    //1.1 공통코드 배열형태로 들고오기
    const cm_code = await getCmCodeLoadArray(['USE_YN', 'USER_STATUS'],'전체')
    this.USE_YN_LIST = cm_code.USE_YN
    this.USER_STATUS_LIST = cm_code.USER_STATUS

    //2. 컬럼 레이아웃 선언
    this.columnLayout = [
      { dataField: "ID", headerText: "기본 키", headerStyle: "aui-grid-required-header", style: "", width: 80 },
      { dataField: "USER_ID", headerText: "사용자ID", headerStyle: "aui-grid-required-header", width: 140, style: "left-text " },
      { dataField: "PASSWORD", headerText: "비밀번호", style: "left-text", width: 80,},
      { dataField: "NAME", headerText: "이름", style: "left-text",width: 150,},
      { dataField: "AVATAR", headerText: "아바타", style: "middle-text",width: 150,
        renderer:{
          type: "ImageRenderer",
          imgHeight: 24, // 이미지 높이, 지정하지 않으면 rowHeight에 맞게 자동 조절되지만 빠른 렌더링을 위해 설정을 추천합니다.
          altField: null, // alt(title) 속성에 삽입될 필드명, 툴팁으로 출력됨. 만약 null 을 설정하면 툴팁 표시 안함.
        }



      },
      { dataField: "ROLE_ID", headerText: "권한ID", style: "left-text",width: 100,},
      { dataField: "STATUS", headerText: "상태",width: 120,
        renderer: {
          type: "DropDownListRenderer",
          list: this.USER_STATUS_LIST.filter(item => item.code != ""), //key-value Object 로 구성된 리스트
          keyField: "code", // key 에 해당되는 필드명
          valueField: "code_nm" // value 에 해당되는 필드명
        },
      },
      { dataField: " CREATED_TIME", headerText: "생성 시간", width: 135,},
      { dataField: "USE_YN", headerText: "사용여부", style: "middle-text",width: 120,
        renderer: {
          type: "DropDownListRenderer",
          list: this.USE_YN_LIST.filter(item => item.code != ""), //key-value Object 로 구성된 리스트
          keyField: "code", // key 에 해당되는 필드명
          valueField: "code_nm" // value 에 해당되는 필드명
        },

      },
      { dataField: "DESCRIPTION", headerText: "비고", style: "left-text",width: 120,},
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
      this.$gridCallUrl("/backed/sysuser2/getSysUser2List",this.queryParam).then((res) => {
        console.log('res.data===',res.data)
        // 실제로 새로 고침이 빨라서 setTimeout 으로 약간의 시간을 두는중.
        setTimeout(() => this.loading = false, this.$gridDelayTime)
        this.gridData = res.data
      })
    },
    gridAddRow() {
      // 하단에 1행 추가
      console.log('행추가 !!')
      let item = {row_status: 'I'};
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
      return this.$gridEditable(this.$refs.codeGrpGrid, event, ["ID"])
    }, saveGrid() {
      const data = this.$gridGetCudData(this.$refs.codeGrpGrid, ["ID", "USER_ID", "NAME"])
      if (data.length) {
        this.loading = true
        this.$gridCallUrl("/backed/sysuser2/saveSysUser2",data).then((res) => {
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
      this.$refs.codeGrpGrid.exportToXlsx({ isRowStyleFront: false,}) //엑셀다운로드 함수
    }, pageReset() {
      this.queryParam = {groupCd: "", groupNm: "", id: "", user_id:"", name:""}
      this.gridData = [];
    },
  }
}

</script>

<style lang="less" scoped>

</style>