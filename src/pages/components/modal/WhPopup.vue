<template>
  <a-modal title="창고 검색 팝업" :visible="this.wh_popup" :footer="null" @cancel="cancelEvent" :width="1200"
           :dialogStyle="{height:50}" >
    <a-spin :spinning="loading" size="large">
      <a-row>
        <a-col :span="24">
          <a-form layout="horizontal">
            <div>
              <a-row>
                <a-col :md="10" :sm="24">
                  <a-form-item
                      label="창고코드"
                      :labelCol="{span: 5}"
                      :wrapperCol="{span: 18, offset: 1}"
                  >
                    <a-input ref="popSearchWhCd" v-model="queryParam.wh_cd" @keyup.enter="searchData" placeholder="입력하세요."/>
                  </a-form-item>
                </a-col>
                <a-col :md="10" :sm="24">
                  <a-form-item
                      label="창고명"
                      :labelCol="{span: 5}"
                      :wrapperCol="{span: 18, offset: 1}"
                  >
                    <a-input ref="popSearchWhNm" v-model="queryParam.wh_nm" @keyup.enter="searchData" placeholder="입력하세요."/>
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
        <a-col :md="24" :sm="24">
          <AUIGrid ref="whPopupGrid" class="grid-wrap"
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
import {getMstWhList} from "@/services/mstWh";

export default {
  components: {
    AUIGrid
  },

  data() {
    return {
      loading: false,     //로딩바 유무
      queryParam: {},     // 쿼리 매개변수
      columnLayout: [],  //컬럼 레이아웃
      gridData: [],      // 그리드 데이터
      useYnList: [],
      whTypeList : [],


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
    cellClickinfo : {
      rowIndex : '',
      dataField : '',
    }
  },

  async mounted() {
    console.log('@@@@@@@@@@@@')
    this.useYnList = await getCmCodeLoad('USEYN', '전체')
    this.whTypeList = await getCmCodeLoad('WH_TYPE')
    console.log('whTypeList === ',this.whTypeList)


    //console.log("whTypeList====", this.whTypeList)


    // 그리드 칼럼 레이아웃 정의
    this.columnLayout = [
      {dataField: "plant_cd", headerText: "사업장", width: 120, visible: false},

      {dataField: "wh_cd", headerText: "창고코드", width: 120, visible: true},
      {dataField: "wh_nm", headerText: "창고고명", idth: 120, visible: true, style: "left-text "},
      {dataField: "wh_type", headerText: "창고유형", width: 120, visible: true, style: "left-text ",
          renderer: {
            type: "DropDownListRenderer",
            list: this.whTypeList, //key-value Object 로 구성된 리스트
            keyField: "code", // key 에 해당되는 필드명
            valueField: "code_nm" // value 에 해당되는 필드명
          }
      },
      // {
      //   dataField: "use_yn", headerText: "사용여부", width: 140,
      //   renderer: {
      //     type: "DropDownListRenderer",
      //     list: this.useYnList, //key-value Object 로 구성된 리스트
      //     keyField: "code", // key 에 해당되는 필드명
      //     valueField: "value" // value 에 해당되는 필드명
      //   }
      // },
      {dataField: "remark", headerText: "비고", width: 140, style: "left-text "},
      {dataField: "reg_id", headerText: "등록자", width: 140, editable: false},
      {dataField: "reg_dt", headerText: "등록일자", width: 140, editable: false},
      {dataField: "mod_id", headerText: "수정자", width: 140, editable: false},
      {dataField: "mod_dt", headerText: "수정일자", width: 140, editable: false}
    ]

    // 그리드 생성
    this.$refs.whPopupGrid.create(this.columnLayout, this.auigridProps);

    // 그리드 데이터 삽입하기
    // this.$refs.whPopupGrid.setGridData(this.gridData);
    this.$refs.popSearchWhCd.$el.focus();

  },
  created() {
    //console.log('cellClickinfo====',this.cellClickinfo)
    // this.$refs.popSearchItemCd.focus()

  },
  computed: {
    ...mapState('modal', ['wh_popup']),
  },
  watch: {
  },
  methods: {
    ...mapMutations('modal', ['setWh_popup']),
    cancelEvent() {
      this.setWh_popup(false)
    },
    searchData() {

      this.loading = true
      this.queryParam.use_yn = 'Y'
      return getMstWhList(Object.assign(this.queryParam)).then(
          (res) => {
            this.$refs.whPopupGrid.setGridData(res.data);
            setTimeout(() => this.loading = false, this.$gridDelayTime)

            if(res.data.length == 1){
              this.$emit("closepopItem", res.data[0])
            }
          }
      )
    },itemSelected(event){
      //console.log('event ==',event)
      //console.log('cellClickinfo ==',this.cellClickinfo)
      //console.log('callType ==',this.callType)

      const item = event.item;

      Object.assign(item, {['cellClickinfo']: this.cellClickinfo})

      this.$emit("selectWh", item)
      //this.$emit(this.parent.queryParam.ackey = 'aaaa')

    }
  }
}
</script>

<style scoped>
.popupStyle {
  height: 100px;
}
</style>
