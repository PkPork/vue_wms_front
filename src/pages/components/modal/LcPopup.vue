<template>
  <a-modal title="로케이션 검색 팝업" :visible="this.lc_popup" :footer="null" @cancel="cancelEvent" :width="700"
           :dialogStyle="{height:50}" >
    <a-spin :spinning="loading" size="large">
      <a-row>
        <a-col :span="24">
          <a-form class="ant-advanced-search-form" layout="horizontal">
            <div>
              <a-row>
                <a-col :md="20" :sm="24">
                  <a-form-item
                      label="존 코드"
                      :labelCol="{span: 4}"
                      :wrapperCol="{span: 16}"
                  >
                    <a-select ref="popSearchZnkey" v-model="queryParam.znkey" @keyup.enter="searchData" >
                      <a-select-option :key="item.ZNKEY" :value="item.ZNKEY" v-for="(item, index) in znkeyList">
                        {{ item.ZNNAME }}
                      </a-select-option>
                    </a-select>
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
        <a-col :md="24" :sm="24">
          <AUIGrid ref="znPopupGrid" class="grid-wrap"
                   style="height:65vh"
                   @cellDoubleClick="itemSelected"
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
        znkey:"",
        linetype:"",
      },     // 쿼리 매개변수
      columnLayout: [],  //컬럼 레이아웃
      gridData: [],      // 그리드 데이터

      znkeyList : [],

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
    },
    ZNKEY : {
      type: String,
    }
  },

  async mounted() {
    console.log('@@@@@@@@@@@@')
    this.useYnList = await getCmCodeLoad('USEYN', '전체')

    // 그리드 칼럼 레이아웃 정의
    this.columnLayout = [
      {dataField: "LCKEY", headerText: "로케이션 코드", width: 150, visible: true, style:"column-link-css"},
      {dataField: "ZNKEY", headerText: "존코드", width: 140, style: "left-text ", visible: false,},
      {dataField: "INSERTURKEY", headerText: "등록자", width: 100, editable: false},
      {dataField: "INSERTDATE", headerText: "등록일시", width: 140, editable: false},
      {dataField: "UPDATEURKEY", headerText: "수정자", width: 100, editable: false},
      {dataField: "UPDATEDATE", headerText: "수정일시", width: 140, editable: false}
    ]

    // 그리드 생성
    this.$refs.znPopupGrid.create(this.columnLayout, this.auigridProps);

    // 그리드 데이터 삽입하기
    // this.$refs.znPopupGrid.setGridData(this.gridData);
    this.$refs.popSearchZnkey.$el.focus();

    //znkey 콤보박스
    this.queryParam.use_yn = 'Y'
    this.$callUrlGet("/backed/std_info/getZnList",this.queryParam).then((res) => {
      this.znkeyList = res.data
    })
    if(this.ZNKEY != '' && this.ZNKEY != null && this.ZNKEY != undefined){
      this.queryParam.znkey = this.ZNKEY;
      this.searchData();
    }
  },
  created() {
  },
  computed: {
    ...mapState('modal', ['lc_popup']),
  },
  watch: {
    gridData: function (newVal, oldVal) {
      this.$refs.znPopupGrid.setGridData(newVal);
    },
  },
  methods: {
    ...mapMutations('modal', ['setLc_popup']),
    cancelEvent() {
      this.setLc_popup(false)
    },
    searchData() {
      this.loading = true
      this.queryParam.use_yn = 'Y'
      console.log(this.queryParam);
      this.$callUrlGet("/backed/std_info/getLcList",this.queryParam).then((res) => {
        console.log('res.data===',res.data)
        // 실제로 새로 고침이 빨라서 setTimeout 으로 약간의 시간을 두는중.
        setTimeout(() => this.loading = false, this.$gridDelayTime)
        this.gridData = res.data
        this.listLength = res.data.length;
        if(res.data.length == 1){
          this.$emit("selectLc", res.data[0])
        }
      })

    },itemSelected(event){

      const item = event.item;
      Object.assign(item, {['cellClickinfo']: this.cellClickinfo})
      this.$emit("selectLc", item)
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
