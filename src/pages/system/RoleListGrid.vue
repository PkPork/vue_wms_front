<template>
  <div>
  <a-spin :spinning="loading" size="large">
    <a-row>
      <a-col :span="24">
        <a-form layout="horizontal">
          <div>
            <a-row>
              <a-col>
                <span style="float: right; margin-top: 3px;">
                  <a-button type="primary" icon="search" @click="searchMaster" :loading="loading">조회</a-button>
                </span>
              </a-col>
            </a-row>
          </div>
        </a-form>

      </a-col>
    </a-row>

    <a-row>
      <a-col :span="24" :xl="10">
        <a-row type="flex" justify="end" style="margin-top:10px; margin-bottom: 10px;">
          <a-space >
            <a-col :span="6">
              <a-button type="primary" @click="masterAddRow" size="small">
                <a-icon type="plus-square"/>
                추가
              </a-button>
              </a-col>
              <a-col  :span="6">
              <a-button type="primary" @click="masterRemoveRow" size="small">
                <a-icon type="delete"/>
                삭제
              </a-button>
              </a-col>
              <a-col  :span="6">
                <a-button type="primary" @click="saveMaster" size="small">
                  <a-icon type="save"/>
                  저장
                </a-button>
              </a-col>
              <a-col  :span="6">
                <a-button type="primary" @click="downLoadExcel('grid1')" size="small">
                  <a-icon type="file-excel"/>
                  다운로드
                </a-button>
              </a-col>
          </a-space>
        </a-row>
        <a-row type="flex">
          <a-col :span="24">
        <AUIGrid ref="myGrid1" class="grid-wrap"
                 @cellClick="cellClickHandler"
                 style="height:65vh"
        >
        </AUIGrid>
          </a-col>
        </a-row>
      </a-col>

      <a-col :span="24" :xl="14">
        <a-row type="flex" justify="end" style="margin-top:10px; margin-bottom: 10px;">
          <a-space >
            <a-col  :span="6">
              <a-button type="primary" @click="saveDetail" size="small">
                <a-icon type="save"/>
                저장
              </a-button>
            </a-col>
            <a-col  :span="6">
              <a-button type="primary" @click="downLoadExcel('grid2')" size="small">
                <a-icon type="file-excel"/>
                다운로드
              </a-button>
            </a-col>
          </a-space>
        </a-row>
        <a-row type="flex">
          <a-col :span="24">
            <AUIGrid ref="myGrid2" class="grid-wrap"
                     style="height:65vh"
            >
            </AUIGrid>
          </a-col>
        </a-row>
      </a-col>
    </a-row>
  </a-spin>
  </div>
</template>


<script>


// AUIGrid 컴포넌트

import AUIGrid from "@/components/auigrid/import/AUIGrid-Vue.js/AUIGrid";
import {getCmCodeLoad} from "@/services/common";
import ItemPopup from "@/pages/components/modal/ItemPopup";
import {mapMutations} from "vuex";
import {
  getMenuList,
  getRoleList,
  getRoleMenuList,
  getRoleMenusList2,
  saveRoleList,
  saveRoleMenuList
} from "@/services/system";

const useYnList = []
export default {

  components: {
    ItemPopup,
    AUIGrid
  },
  data: function () {
    return {
      loading: false,     //로딩바 유무
      masterRow: {},       //그룹코드 정보
      useYnList,
      // 쿼리 매개변수
      queryParam: {
        item_cd:"",
        item_nm:"",
      },
      // 그리드 칼럼 레이아웃 정의
      columnLayoutHD: [],
      columnLayoutDT: [],

      // 그리드 속성 정의
      auigridProps: {
        // 엑스트라 체크박스 표시 설정
        showRowCheckColumn: true,
        // 엑스트라 체크박스에 shiftKey + 클릭으로 다중 선택 할지 여부 (기본값 : false)
        enableRowCheckShiftKey: true,
        // 전체 체크박스 표시 설정
        showRowAllCheckBox: true,
        // 편집 가능 여부 (기본값 : false)
        editable: true,
        // 셀 선택모드 (기본값: singleCell)
        selectionMode: "singleCell",
        //필터사용유무
        enableFilter : true,
      },
      auigridPropsDt: {
        // 편집 가능 여부 (기본값 : false)
        editable: false,

        // 트리관련 설정
        displayTreeOpen : true,

        // 엑스트라 체크박스 표시 설정
        showRowCheckColumn: true,

        // 전체 체크박스 표시 설정
        showRowAllCheckBox: true,

        // 셀 선택모드 (기본값: singleCell)
        selectionMode: "singleCell",
        showStateColumn: true,

        flat2tree : true,
        // 트리의 고유 필드명
        treeIdField : "menu_id",
        // 계층 구조에서 내 부모 행의 treeIdField 참고 필드명
        treeIdRefField : "parent_id"
      },

      // 그리드 데이터
      gridDataHD: [],
      gridDataDT: [],
      visible: false,

    }

  },
  async beforeMount() {

  },
  async mounted() {
    this.useYnList = await getCmCodeLoad('USEYN','전체')
    this.columnLayoutHD = [
      {
        dataField: "id",
        headerText: "Id",
        style: "left-text",
        width: 40
      },
      {
        dataField: "unique_key",
        headerText: "고유키",
        headerStyle: "aui-grid-required-header",
        width: 60,
        style: "left-text "
      },
      {
        dataField: "name",
        headerText: "Role명",
        headerStyle: "aui-grid-required-header",
        width: 80,
        style: "left-text "
      },
      {
        dataField: "remark",
        headerText: "비고",
        headerStyle: "aui-grid-required-header",
        width: 140,
        style: "left-text "
      }
    ]

    this.columnLayoutDT = [
      {dataField: "name", headerText: "메뉴명", width: 200}
    ]

    let grid1 = this.$refs.myGrid1;
    let grid2 = this.$refs.myGrid2;

    // 그리드 생성

    grid1.create(this.columnLayoutHD, this.auigridProps);
    grid2.create(this.columnLayoutDT, this.auigridPropsDt);

    // 그리드 데이터 삽입하기
    grid1.setGridData(this.gridDataHD);
    grid2.setGridData(this.gridDataDT);

  }, created() {
    // this.$refs.myGrid1.resize(null,1200)
    // this.$refs.myGrid2.resize(null,1200)
  },
  methods: {
    ...mapMutations('modal', ['setItem_popup']),
    searchMaster() {
      console.log('조회를 시작합니다.', this.queryParam)
      this.loading = true
      return getRoleList(Object.assign(this.queryParam)).then(
          (res) => {
              this.$refs.myGrid1.setGridData(res.data)
              this.$refs.myGrid2.clearGridData()
            // 실제로 새로 고침은 매우 빠르며, 이 지연을 추가하는 것은 순전히 로딩 상태를 잠시 동안 표시하여 사용자가 새로 고침 과정을 인지할 수 있도록 하기 위한 것입니다.
              setTimeout(() => this.loading = false, this.$gridDelayTime)
          }
      )
    }, searchDetail() {
      this.loading = true
      console.log('조회를 시작합니다.', Object.assign(this.masterRow))
      return getRoleMenuList(Object.assign(this.masterRow)).then(
          (res) => {
            this.$refs.myGrid2.setGridData(res.data)
            console.log('data===', res.data)
            for(let i=0; i<res.data.length;i++){
              this.$refs.myGrid2.addCheckedRowsByValue("menu_id", res.data[i]["menu_ids"])
            }

            // this.loading = false
            setTimeout(() => this.loading = false, this.$gridDelayTime)
            //return res.data;
          }
      )
    },
    masterAddRow() {
      // 하단에 1행 추가
      console.log('행추가 !!')
      let item = {use_yn: "Y", row_status: 'I'};
      this.$refs.myGrid1.addRow(item, "last");
      this.$refs.myGrid2.clearGridData()
    },
    masterRemoveRow() {
      // 체크된 행 삭제 처리
      this.$refs.myGrid1.removeCheckedRows();
    },
    cellClickHandler(event) {
      // 셀클릭 이벤트 핸들링
      console.log('cell click ===', event)
      this.masterRow = event.item
      this.searchDetail()
    },
    saveMaster() {
      const data = this.$gridGetCudData(this.$refs.myGrid1,["unique_key", "name"])
      if(data.length){
        saveRoleList(data).then(
            (res) => {
              if (res.code == 200) {
                this.searchMaster()
              } else {
                this.$message.error(res.message);
              }
            },
            error => {
              console.log('error ==== ', error)
            }
        )
      }
    }, saveDetail() {
      let data = this.$refs.myGrid2.getCheckedRowItemsAll()
      if(data.length){
        saveRoleMenuList(data).then(
            (res) => {
              console.log('res====', res)
              if (res.code == 200) {
                this.searchMaster()
              } else {
                this.$message.error(res.message);
              }
              //return res.data;
            },
            error => {
              console.log('error ==== ', error)
            }
        )
      }

    },
    downLoadExcel(id) {
      // 내보내기 실행
      if(id == "grid1"){
        this.$refs.myGrid1.exportToXlsx({
          isRowStyleFront: false,
        })
      }else{
        this.$refs.myGrid2.exportToXlsx({
          isRowStyleFront: false,
        })
      }


    },
    onSearchAckey(){
      console.log('팝업 띄우는 쌤플')
      this.setItem_popup(true)
    },resetAckey(){
      console.log('!@@@@@@@@@@@@')
      this.queryParam.item_cd  = ''
      this.queryParam.item_nm  = ''
    },
    //품번팝업에서 선택한 대상
    closepopItem(event) {
      console.log("event=======", event)
      this.queryParam.item_cd = event.item_cd
      this.queryParam.item_nm = event.item_nm
      this.setItem_popup(false)
    }
  }
}

</script>

<style lang="less" scoped>

</style>