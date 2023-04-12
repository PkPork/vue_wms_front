<template>
  <a-modal title="첨부파일 팝업" :visible="this.$store.state.modal.file_popup" :footer="null" @cancel="cancelEvent" :width="650"
           :dialogStyle="{height:50}" >
    <a-spin :spinning="loading" size="large">
      <a-upload
          name="file"
          :multiple="true"
          :action="fileactions"
          :headers="headers"
          :data="params"
          @change="handleChange"
      >
        <a-button> <a-icon type="upload" /> 파일업로드 </a-button>
      </a-upload>
    </a-spin>
  </a-modal>
</template>

<script>
import {mapMutations, mapState} from "vuex";
import {getFileList, saveFileInfo} from "@/services/fileAttach";
import Cookie from "js-cookie";


export default {
  components: {
  },

  data() {
    return {
      headers: {
        authorization: Cookie.get('Authorization'),
      },
      params: {
        file_grp_seq: this.$store.state.modal.file_grp_seq,
      },
      fileactions: process.env.VUE_APP_API_BASE_URL+'/common/uploads',
      loading: false,     //로딩바 유무
      queryParam: {},     // 쿼리 매개변수
      columnLayout: [],  //컬럼 레이아웃
      gridData: [],      // 그리드 데이터
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
    callType:null
  },

  async mounted() {

  },
  created() {
    // this.searchData()
  },
  computed: {
    ...mapState('modal', ['file_popup']),
  },
  watch: {
  },
  methods: {
    ...mapMutations('modal', ['setFile_popup']),
    handleChange(info) {

      const file_grp_seq = this.$store.state.modal.file_grp_seq
      //console.log('file_grp_seq==', file_grp_seq)

      if (info.file.status !== 'uploading') {
        //console.log(info.file, info.fileList);
        // console.log("info====", info);
        // console.log("name==", info.file.name)
        // console.log("type==", info.file.type)
        // console.log("originFileObj==", info.file.originFileObj)
        // console.log("uid==", info.file.originFileObj.uid)
        // console.log("path==", info.file.response.data)
        // console.log("size==", info.file.originFileObj.size)

        const file_nm = info.file.response.data.replace("http://localhost:8020/open_admin//", "");
        const file_type = info.file.type.replace("application/", "");

        let fileInfo = {};
        Object.assign(fileInfo, {['row_status']: 'I'})
        Object.assign(fileInfo, {['file_grp_seq']: file_grp_seq})
        Object.assign(fileInfo, {['file_no']: info.file.originFileObj.uid})
        Object.assign(fileInfo, {['file_nm']: file_nm})
        Object.assign(fileInfo, {['file_type']: file_type})
        Object.assign(fileInfo, {['file_size']: info.file.originFileObj.size})
        Object.assign(fileInfo, {['file_path']: info.file.response.data})
        Object.assign(fileInfo, {['orgin_file_nm']: info.file.name})
        Object.assign(fileInfo, {['use_yn']: "Y"})
        Object.assign(fileInfo, {['reg_id']: this.$store.state.account.user.user_id})
        Object.assign(fileInfo, {['mod_id']: this.$store.state.account.user.user_id})

        let data = [];
        data.push(fileInfo)

        saveFileInfo(data)

      }
      if (info.file.status === 'done') {
        this.$message.success(`${info.file.name} 파일업로드 성공`);
      } else if (info.file.status === 'error') {
        this.$message.error(`${info.file.name} 파일 업로드 실패.`);
      }
    },
    cancelEvent() {
      this.setFile_popup(false)
    },
    searchData() {

      this.loading = true
      return getFileList(Object.assign(this.queryParam)).then(
          (res) => {
            this.$refs.filePopupGrid.setGridData(res.data);
            setTimeout(() => this.loading = false, this.$gridDelayTime)
          }
      )
    },itemSelected(event){
      console.log('event ==',event)
      console.log('callType ==',this.callType)

      this.$emit("closepopItem", event.item)
      //this.$emit(this.parent.queryParam.ackey = 'aaaa')

    },
    handleFileChange(e) {
      this.file_name = e.target.files[0].name;
    }
  }
}
</script>

<style scoped>
.popupStyle {
  height: 100px;
}
</style>
