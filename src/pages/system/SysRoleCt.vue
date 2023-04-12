<template>
  <div id="components-form-demo-advanced-search">
    <a-spin :spinning="loading" size="large">
      <a-form class="ant-advanced-search-form">
        <a-row :gutter="24">
          <a-col :span="21" :style="{ }">
            <a-form-item label="권한명">
              <a-input v-model="queryParam.groupCd" placeholde1="입력하세요."/>
            </a-form-item>
          </a-col>
          <a-col :span="3" :style="{ textAlign: 'right' }">
            <a-button type="primary" @click="searchMaster">조회</a-button>
            <a-button :style="{ marginLeft: '8px' }" @click="pageReset">초기화</a-button>
          </a-col>
        </a-row>
      </a-form>

      <div class="search-result-list" style="{width: 100%;}">
        <a-row >
          <a-col :span="24" style="text-align: left;" >
            <div class="sub_title" style="">권한</div>
          </a-col>
          <a-col :span="24">
            <AUIGrid ref="sysRoleGrid" class="grid-wrap"
                     @cellDoubleClick="cellClickHandler"
                     style="height:25vh;"
            >
            </AUIGrid>
          </a-col>
        </a-row>
        <a-row >
          <a-col :span="24" style="text-align: left;" >
            <div style="margin-top: 10px;">
              <div class="sub_title" style="display: inline-block;">센터</div>
              <div class="btn_area" style="float: right;">
                <a-button type="primary" @click="saveDetail" size="small"><a-icon type="save"/>저장</a-button>
              </div>
            </div>
          </a-col>
          <a-col :span="24">
            <AUIGrid ref="ctRole" class="grid-wrap"
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
        showRowCheckColumn: false,
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
    this.useYnList = await getCmCodeLoad('USE_YN', '전체')
    this.columnLayoutHD = [
      { dataField: "ID", headerText: "ID",width: 60 ,editable: false, },
      { dataField: "NAME", headerText: "그룹코드명", style: "column-link-css", editable: false,   },
    ]

    this.columnLayoutDT = [
      { dataField: "CTKEY", headerText: "센터코드", filter: {showIcon: true}, width: 120 ,editable:false },
      { dataField: "CTNAME", headerText: "센터명", filter: {showIcon: true} ,editable:false  },
      { dataField: "CT_YN",
        headerText: "사용여부",
        width: 160,
        headerTooltip: {
          show: true,
          tooltipHtml: "센터권한 활성화 여부<br/>(선택적 체크박스 수정 여부 판단)"
        },
        renderer: {
          type: "CheckBoxEditRenderer",
          editable: true, // 체크박스 편집 활성화 여부(기본값 : false)
          checkValue: "Y",
          unCheckValue: "N",
        }
      }
    ]

    let sysRoleGrid = this.$refs.sysRoleGrid;
    let ctRole = this.$refs.ctRole;

    // 그리드 생성

    sysRoleGrid.create(this.columnLayoutHD, this.auigridPropsHD);
    ctRole.create(this.columnLayoutDT, this.auigridPropsDT);

    // 그리드 데이터 삽입하기
    sysRoleGrid.setGridData(this.gridDataHD);
    ctRole.setGridData(this.gridDataDT);

  },watch:{
    gridDataHD: function (newVal, oldVal) {
      this.$refs.sysRoleGrid.setGridData(newVal);
    },
    gridDataDT: function (newVal, oldVal) {
      this.$refs.ctRole.setGridData(newVal);
    },
  }, created() {
    // this.$refs.sysRoleGrid.resize(null,1200)
    // this.$refs.ctRole.resize(null,1200)
  },
  methods: {
    searchMaster() {
      this.loading = true
      this.$gridCallUrl("/backed/sysrolect/getSysRoleList",this.queryParam).then((res) => {
            // 실제로 새로 고침이 빨라서 setTimeout 으로 약간의 시간을 두는중.
            setTimeout(() => this.loading = false, this.$gridDelayTime)
            this.gridDataDT = []
            this.masterRow  = {}
            this.gridDataHD = res.data
      })
    }, searchDetail() {
      this.loading = true
      this.$gridCallUrl("/backed/sysrolect/getSysRoleCtList",this.masterRow).then((res) => {
          setTimeout(() => this.loading = false, this.$gridDelayTime)
            this.gridDataDT = res.data
      })
    },
    masterAddRow() {
      // 하단에 1행 추가
      console.log('행추가 !!')
      let item = {use_yn: "Y", row_status: 'I'};
      this.$refs.sysRoleGrid.addRow(item, "last");
      this.$refs.ctRole.clearGridData();
    },
    masterRemoveRow() {
      const list = this.$refs.sysRoleGrid.getCheckedRowItemsAll()
      if (list.length == 0) {
        this.$message.info('삭제할 행을 선택하세요.');
        return
      }
      // 체크된 행 삭제 처리
      this.$refs.sysRoleGrid.removeCheckedRows()
    },
    detailAddRow() {
      if (this.masterRow) {
        let item = {use_yn: "Y", row_status: 'I', group_cd: this.masterRow.group_cd, sort: 0}
        this.$refs.ctRole.addRow(item, "last")
      } else {
        this.$message.warn('그룹코드를 선택하세요.', 3)
      }
      console.log('test == ', this.masterRow)
    },
    detailRemoveRow() {
      const list = this.$refs.ctRole.getCheckedRowItemsAll()
      if (list.length == 0) {
        this.$message.info('삭제할 행을 선택하세요.');
        return
      }
      // 체크된 행 삭제 처리
      this.$refs.ctRole.removeCheckedRows()
    }, cellClickHandler(event) {
      // 셀클릭 이벤트 핸들링
      if (event.dataField == "NAME" && event.item.row_status != "I") {
        this.masterRow = event.item
        this.searchDetail()
      } else {
        this.$refs.ctRole.clearGridData();
      }
    }, saveDetail() {
      const rows = this.$gridGetCudData(this.$refs.ctRole, [])
      const data = rows.map(item =>({
            ...item,ROLE_ID:this.masterRow.ID,UNIQUE_KEY:this.masterRow.UNIQUE_KEY
          }))
      console.log('data===@@ ',data)
      if (data.length > 0) {
        this.loading = true
        this.$gridCallUrl("/backed/sysrolect/mergeSysRoleCt",data).then((res) => {
              this.$message.success('저장완료');
              this.searchDetail()
            }, error => {
              console.log('error ==== ', error)
        })
      }
    }, downLoadExcel(id) {
      // 내보내기 실행
      if (id == "grid1") {
        this.$refs.sysRoleGrid.exportToXlsx({ isRowStyleFront: false,}) //엑셀다운로드 함수
      } else {
        this.$refs.ctRole.exportToXlsx({ isRowStyleFront: false,})  //엑셀다운로드 함수
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