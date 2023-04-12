<template>
  <a-modal title="사용자 팝업" :visible="this.user_popup" :footer="null" @cancel="cancelEvent" :width="550"
           :dialogStyle="{height:50}" >
    <a-spin :spinning="loading" size="large">
      <a-row>
        <a-col :span="24">
          <a-form layout="horizontal">
            <div>
              <a-row>
                <a-col :md="10" :sm="24">
                  <a-form-item
                      label="아이디"
                      :labelCol="{span: 5}"
                      :wrapperCol="{span: 18, offset: 1}"
                  >
                    <a-input ref="popSearchUserId" v-model="queryParam.user_id" @keyup.enter="searchData" placeholder="입력하세요."/>
                  </a-form-item>
                </a-col>
                <a-col :md="10" :sm="24">
                  <a-form-item
                      label="성명"
                      :labelCol="{span: 5}"
                      :wrapperCol="{span: 18, offset: 1}"
                  >
                    <a-input ref="popSearchUserNm" v-model="queryParam.username" @keyup.enter="searchData" placeholder="입력하세요."/>
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
          <AUIGrid ref="userPopupGrid" class="grid-wrap"
                   style="height:65vh"
                   @cellDoubleClick="userSelected"
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
        user_id:"",
        username:""
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
        selectionMode: "singleRow",
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
      {dataField: "USER_ID", headerText: "아이디", width: 120, style:"column-link-css",},
      {dataField: "NAME", headerText: "성명",  },
    ]

    // 그리드 생성
    this.$refs.userPopupGrid.create(this.columnLayout, this.auigridProps);

    // 그리드 데이터 삽입하기
    // this.$refs.userPopupGrid.setGridData(this.gridData);
    this.$refs.popSearchUserNm.$el.focus();

  },
  created() {
    console.log('callid====',this.callid)
    // this.$refs.popSearchUserId.focus()

  },
  computed: {
    ...mapState('modal', ['user_popup']),
  },
  watch: {
  },
  methods: {
    ...mapMutations('modal', ['setUser_popup']),
    cancelEvent() {
      this.setUser_popup(false)
    },
    searchData() {

      this.loading = true
      return this.$gridCallUrl("/backed/popup/getSysUserList",this.queryParam).then((res) => {
            this.$refs.userPopupGrid.setGridData(res.data);
            setTimeout(() => this.loading = false, this.$gridDelayTime)
            this.listLength = this.$refs.userPopupGrid.getRowCount()
            if(res.data.length == 1){
              this.$emit("closepopItem", res.data[0])
            }
      })
    },userSelected(event){
      console.log('event ==',event)
        this.$emit("closepopItem", event.item)
    }
  }
}
</script>

<style scoped>
.popupStyle {
  height: 100px;
}
</style>
