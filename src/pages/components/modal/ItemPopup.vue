<template>
  <a-modal title="품번 검색 팝업" :visible="this.item_popup" :footer="null" @cancel="cancelEvent" :width="700"
           :dialogStyle="{height:50}" >
    <a-spin :spinning="loading" size="large">
      <a-row>
        <a-col :span="24">
          <a-form class="ant-advanced-search-form" layout="horizontal">
            <div>
              <a-row>
                <a-col :md="10" :sm="24">
                  <a-form-item
                      label="품번"
                      :labelCol="{span: 8}"
                      :wrapperCol="{span: 16}"
                  >
                    <a-input ref="popSearchItemCd" v-model="queryParam.ickey" @keyup.enter="searchData" placeholder="입력하세요."/>
                  </a-form-item>
                </a-col>
                <a-col :md="10" :sm="24">
                  <a-form-item
                      label="품명"
                      :labelCol="{span: 8}"
                      :wrapperCol="{span: 16}"
                  >
                    <a-input ref="popSearchItemNm" v-model="queryParam.icname" @keyup.enter="searchData" placeholder="입력하세요."/>
                  </a-form-item>
                </a-col>
                <a-col :md="4" :sm="24">
                <span style="float: right; margin-top: 3px;">
                  <a-button type="primary" icon="search" @click="searchData" :loading="loading">조회</a-button>
                </span>
                </a-col>
              </a-row>
            </div>
          </a-form>
        </a-col>
      </a-row>

      <a-row>
        <a-col>
          전체 : {{listLength}}건
        </a-col>
      </a-row>
      <a-row>
        <a-col :md="24" :sm="24">
          <AUIGrid ref="itemPopupGrid" class="grid-wrap"
                   style="height:65vh"
                   @cellClick="itemSelected"
          >
          </AUIGrid>
        </a-col>
      </a-row>
    </a-spin>
  </a-modal>
</template>

<script>
import AUIGrid from "@/components/auigrid/import/AUIGrid-Vue.js/AUIGrid";
import {mapMutations, mapState} from "vuex";
import {getCmCodeLoad} from "@/services/common";

export default {
  components: {
    AUIGrid
  },

  data() {
    return {
      loading: false,     //로딩바 유무
      listLength:0,
      queryParam: {
        ickey:"",
        icname:""
      },     // 쿼리 매개변수
      columnLayout: [],  //컬럼 레이아웃
      gridData: [],      // 그리드 데이터
      useYnList: [],
      bodyStyle: {
        height: 50,
      },
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
    }
  },
  props: {
    callid:null,
    callType:null
  },

  async mounted() {
    this.useYnList = await getCmCodeLoad('USEYN', '전체')

    // 그리드 칼럼 레이아웃 정의
    this.columnLayout = [
      {dataField: "CTKEY", headerText: "사업장", width: 120, visible: false},
      {dataField: "OWKEY", headerText: "화주코드", width: 140, visible: false},
      {dataField: "ICKEY", headerText: "품번", width: 120, style:"column-link-css", visible: true},
      {dataField: "ICNAME", headerText: "품명", width: 200, visible: true, style: "left-text "},
      {
        headerText: "기본적치",
        children: [
          { dataField: "TO_ZNKEY", headerText: "기본적치존", headerStyle: "", style: "", width: 180 },
          { dataField: "TO_LCKEY", headerText: "기본적치위치", headerStyle: "", style: "", width: 120 },
        ],
      },
      {dataField: "INSERTURKEY", headerText: "등록자", width: 100, editable: false},
      {dataField: "INSERTDATE", headerText: "등록일자", width: 140, editable: false},
      {dataField: "UPDATEURKEY", headerText: "수정자", width: 100, editable: false},
      {dataField: "UPDATEDATE", headerText: "수정일자", width: 140, editable: false}
    ]

    // 그리드 생성
    this.$refs.itemPopupGrid.create(this.columnLayout, this.auigridProps);

    // 그리드 데이터 삽입하기
    // this.$refs.itemPopupGrid.setGridData(this.gridData);
    this.$refs.popSearchItemCd.$el.focus();

  },
  created() {
    console.log('callid====',this.callid)
    // this.$refs.popSearchItemCd.focus()

  },
  computed: {
    ...mapState('modal', ['item_popup']),
  },
  watch: {
  },
  methods: {
    ...mapMutations('modal', ['setItem_popup']),
    cancelEvent() {
      this.setItem_popup(false)
    },
    searchData() {

      this.loading = true
      return this.$gridCallUrl("/backed/mstic/getMstIcList",this.queryParam).then((res) => {
            this.$refs.itemPopupGrid.setGridData(res.data);
            setTimeout(() => this.loading = false, this.$gridDelayTime)
            this.listLength = this.$refs.itemPopupGrid.getRowCount()
            if(res.data.length == 1){
              this.$emit("closepopItem", res.data[0])
            }
      })
    },itemSelected(event){
      console.log('event ==',event)
      if(event.dataField == "ICKEY"){
        console.log('callid ==',this.callid)
        console.log('callType ==',this.callType)

        this.$emit("closepopItem", event.item)
      }
    }
  }
}
</script>

<style scoped>
*{ font-family: NotoSansKR }
.popupStyle {
  height: 100px;
}
</style>
