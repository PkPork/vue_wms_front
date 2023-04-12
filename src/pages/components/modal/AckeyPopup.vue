<template>
  <a-modal title="거래처 팝업" :visible="this.ackey_popup" :footer="null" @cancel="cancelEvent" :width="700"
           :dialogStyle="{height:50}" >
    <a-spin :spinning="loading" size="large">
      <a-row>
        <a-col :span="24">
          <a-form class="ant-advanced-search-form" layout="horizontal">
            <div>
              <a-row>
                <a-col :md="10" :sm="24">
                  <a-form-item
                      label="거래처 코드"
                      :labelCol="{span: 8}"
                      :wrapperCol="{span: 16}"
                  >
                    <a-input ref="popSearchZnkey" v-model="queryParam.ackey" @keyup.enter="searchData" placeholder="입력하세요."/>
                  </a-form-item>
                </a-col>
                <a-col :md="10" :sm="24">
                  <a-form-item
                      label="거래처 명"
                      :labelCol="{span: 8}"
                      :wrapperCol="{span: 16}"
                  >
                    <a-input ref="popSearchZnname" v-model="queryParam.acname" @keyup.enter="searchData" placeholder="입력하세요."/>
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
          <AUIGrid ref="ackeyPopupGrid" class="grid-wrap"
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
      queryParam: {ackey:"",acname:""},     // 쿼리 매개변수
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
        selectionMode: "singleRow",
        showStateColumn: false,
      },
    }
  },
  props: {
    cellClickinfo : {
      rowIndex : '',
      dataField : '',
    }
  },

  mounted() {
    // 그리드 칼럼 레이아웃 정의
    this.columnLayout = [
      {dataField: "ACKEY", headerText: "거래처 코드", width: 120, style:"column-link-css", visible: true},
      {dataField: "ACNAME", headerText: "거래처 명", width: 200, visible: true, style: "left-text "},
      {dataField: "remark", headerText: "비고", width: 140, style: "left-text ", visible: false},
      {dataField: "INSERTURKEY", headerText: "등록자", width: 100, editable: false},
      {dataField: "INSERTDATE", headerText: "등록일시", width: 140, editable: false},
      {dataField: "UPDATEURKEY", headerText: "수정자", width: 100, editable: false},
      {dataField: "UPDATEDATE", headerText: "수정일시", width: 140, editable: false}
    ]
    // $nextTick으로 렌더시에
    this.$nextTick(()=>{
      // 그리드 생성
      this.$refs.ackeyPopupGrid.create(this.columnLayout, this.auigridProps);
      // 그리드 데이터 삽입하기
      // this.$refs.ackeyPopupGrid.setGridData(this.gridData);
      this.$refs.popSearchZnkey.$el.focus();
    })

  },
  created() {
  },
  computed: {
    ...mapState('modal', ['ackey_popup']),
  },
  watch: {
    gridData: function (newVal, oldVal) {
      this.$refs.ackeyPopupGrid.setGridData(newVal);
    },
  },
  methods: {
    ...mapMutations('modal', ['setAckey_popup']),
    cancelEvent() {
      this.setAckey_popup(false)
    },
    searchData() {

      this.loading = true
      this.queryParam.use_yn = 'Y'
      this.$gridCallUrl("/backed/popup/getMstAcList",this.queryParam).then((res) => {
        console.log('res.data===',res.data)
        // 실제로 새로 고침이 빨라서 setTimeout 으로 약간의 시간을 두는중.
        setTimeout(() => this.loading = false, this.$gridDelayTime)
        this.gridData = res.data
        console.log('res.data.length==',res.data.length)
        this.listLength = res.data.length;
        if(res.data.length == 1){
          this.$emit("selectAckeyPopup", res.data[0])
        }
      })

    },itemSelected(event){

      const item = event.item;
      Object.assign(item, {['cellClickinfo']: this.cellClickinfo})
      this.$emit("selectAckeyPopup", item)
      //this.$emit(this.parent.queryParam.ackey = 'aaaa')

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
