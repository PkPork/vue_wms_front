<template>
  <div :style="{ minHeight: '800px' }">
    <a-spin :spinning="loading" size="large">
      <a-modal
          :title="'게시판 등록'"
          style="top: 5px"
          :width="1100"
          v-model="isPopUp"
          :footer="null"
      >
        <PopBoard v-if="isPopUp" @closepop="closePopBoard" :popinit="this.popinit"/>
      </a-modal>

      <a-form layout="horizontal">
        <a-row type="flex">
          <a-col :span="24" :xl="4" flex="auto">
            <a-select v-model="queryParam.search_type" placeholder="선택">
              <a-select-option :key="item.code" :value="item.code" v-for="(item, index) in boardSearchList">{{item.code_nm}}</a-select-option>
            </a-select>
          </a-col>
          <a-col :span="24" :xl="16" flex="auto">
            <a-input v-model="queryParam.search_comment"
                     placeholder="입력하세요."
                     @keyup.enter="search"/>
          </a-col>
          <a-col :span="24" :xl="6" flex="180px" >
            <span style="float: right; margin-top: 3px;">
              <a-button type="primary" icon="search" @click="search" :loading="loading">조회</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>

      <a-row type="flex" justify="end" style="margin-top:10px; margin-bottom: 10px;">
        <a-space>
          <a-col :span="24">
            <a-button type="primary" @click="addBoard" size="small">
              <a-icon type="plus-square"/>
              글쓰기
            </a-button>
          </a-col>
        </a-space>
      </a-row>

      <a-row type="flex">
        <a-col :span="24">
          <AUIGrid ref="itemGrid" class="grid-wrap"
                   @cellDoubleClick="cellDoubleClickHandler"
                   style="height: 65vh;"
          />
        </a-col>
      </a-row>
    </a-spin>
  </div>

</template>

<script>
// AUIGrid 컴포넌트
import AUIGrid from "@/components/auigrid/import/AUIGrid-Vue.js/AUIGrid";
import {getBoardList} from "@/services/board";
import PopBoard from "@/pages/master/PopBoard";
import {getCmCodeLoad} from "@/services/common";

const boardSearchList= []

export default {
  name: "NoticeBoardList",
  components: {
    PopBoard,
    AUIGrid
  },
  data: function () {
    return {
      loading: false,     //로딩바 유무
      delayTime: 1000,    //로딩 딜레이
      isPopUp: false,    //팝업호출여부
      // 쿼리 매개변수
      queryParam: {search_type: "E"},
      boardSearchList,
      columnLayout: [],
      // 그리드 속성 정의
      auigridProps: {
        // 편집 가능 여부 (기본값 : false)
        editable: false,
        // 엑스트라 체크박스 표시 설정
        showRowCheckColumn: false,
        // 전체 체크박스 표시 설정
        showRowAllCheckBox: false,
        // 셀 선택모드 (기본값: singleCell)
        selectionMode: "multipleCells",
        showStateColumn: false,
      },
      popinit: {},
      // 그리드 데이터
      gridData: []
    }
  },
  beforeMount() {

  },
  async mounted() {

    // 기초코드 들고오기
    this.boardSearchList = await getCmCodeLoad('BOARD_SEARCH')

    // 그리드 칼럼 레이아웃 정의
    this.columnLayout = [
      {dataField: "plant_cd", headerText: "사업장", width: 120, visible: false},
      {dataField: "owner_cd", headerText: "화주코드", width: 140, visible: false},
      {dataField: "post_no", headerText: "등록번호", width: 100, visible: true},
      {dataField: "post_tit", headerText: "제목", visible: true, style: "left-text "},
      {dataField: "view_cnt", headerText: "조회수", width: 100, visible: true},
      {dataField: "attfile_cnt", headerText: "첨부문서", width: 100, visible: true},
      {dataField: "noti_yn", headerText: "표시여부", width: 100, visible: true},
      {dataField: "reg_nm", headerText: "등록자", width: 100, editable: false},
      {dataField: "reg_dt", headerText: "등록일자", width: 120, editable: false},
      {dataField: "mod_nm", headerText: "수정자", width: 100, editable: false},
      {dataField: "mod_dt", headerText: "수정일자", width: 120, editable: false}
    ]
    let grid = this.$refs.itemGrid;
    // 그리드 생성
    grid.create(this.columnLayout, this.auigridProps);
    // 그리드 데이터 삽입하기
    grid.setGridData(this.gridData);
  },
  methods: {
    search() {
      this.loading = true
      return getBoardList(Object.assign(this.queryParam)).then(
          (res) => {
            console.log('res====', res)
            this.$refs.itemGrid.setGridData(res.data);
            //return res.data;
            setTimeout(() => this.loading = false, 500)
          }
      )
    },
    cellDoubleClickHandler(event) {
      console.log("event.item===", event.item)
      let POpParam = event.item;
      Object.assign(POpParam, {['isNew']: false})
      this.openPopBoard(POpParam)
      this.isPopUp = true
    },
    openPopBoard(param) {
      this.popinit = param;
      this.isPopUp = true
    },
    closePopBoard() {
      //console.log('sssss')
      this.isPopUp = false
      this.search()
      //this.$router.go()
    },
    addBoard() {
      this.openPopBoard({['isNew']: true});
    }
  }
}
</script>

<style>
</style>