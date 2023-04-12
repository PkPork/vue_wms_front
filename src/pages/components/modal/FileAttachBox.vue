<template>
  <a-modal title="첨부파일 팝업" :visible="this.file_popup" :footer="null" @cancel="cancelEvent" :width="650"
           :dialogStyle="{height:50}" >
    <a-spin :spinning="loading" size="large">
      <div >
        <a-row >
          <a-upload-dragger
              :file-list="fileList"
              :before-upload="beforeUpload"
              :multiple="true"
              :showUploadList="false"
              @change="handleChange"
          >
            <p class="ant-upload-drag-icon">
              <a-icon type="inbox" />
            </p>
            <p class="ant-upload-text">
              업로드하려면 이곳을 클릭하거나 파일을 드래그하세요.
            </p>
            <p class="ant-upload-hint">
              단일 또는 일괄 업로드를 지원합니다. 회사 데이터 등의 업로드를 엄격히 금지합니다.
            </p>
          </a-upload-dragger>
        </a-row>
        <a-row >
          <AUIGrid ref="fileGrid" class="grid-wrap"
                   @cellClick="cellClickHandler"
                   style="height:35vh"
          >
          </AUIGrid>
        </a-row>
      </div>
    </a-spin>
  </a-modal>
</template>

<script>
import {mapMutations, mapState} from "vuex";
import {deleteFile, fileSave, getFileList, saveFileInfo} from "@/services/fileAttach";
import Cookie from "js-cookie";
import AUIGrid from "@/components/auigrid/import/AUIGrid-Vue.js/AUIGrid";
import {getCmCodeLoad} from "@/services/common";
import confirm from "ant-design-vue"

import {axios} from "@/utils/request";
import {setSysUserInfo} from "@/services/system";


export default {
  components: {
    AUIGrid
  },

  data() {
    return {
      headers: {
        // authorization: Cookie.get('Authorization'),
        responseType: 'arraybuffer',
      },
      fileList: [],
      params: {
        file_grp_seq: this.$store.state.modal.file_grp_seq,
      },
      loading: false,     //로딩바 유무
      queryParam: {},     // 쿼리 매개변수
      columnLayout: [{
        dataField : "delIcon",
        headerText : "삭제",
        width:"40",
        renderer : {
          type : "IconRenderer",
          iconWidth  : 16,
          iconHeight : 16,
          iconTableRef : {"default" : this.$delIcon},
          altField : "삭제",
          onClick : this.goDeleteFile
        }
      }, {
        dataField : "orgin_file_nm",
        headerText : "파일명",
        style : "aui-grid-left",
        // width:"250"
      }, {
        dataField : "file_size",
        headerText : "크기",
        style : "aui-grid-right",
        width:"100"
      }, {
        dataField : "file_seq",
        headerText : "파일Seq",
        width:"0",
        visible : false

      }, {
        dataField : "file_grp_seq",
        headerText : "파일그룹Seq",
        width:"0",
        visible : false
      }, {
        dataField : "file_nm",
        headerText : "파일명",
        width:"0",
        visible : false
      }
      ],  //컬럼 레이아웃
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
      useYnList: [],
    }
  },
  props: {
    callType:null
  },

  async mounted() {
    console.log('파일팝업@@@@@@@@@@@!!!!!!!!!!!!!')
    // let grid = this.$refs.fileGrid;
    this.useYnList = await getCmCodeLoad('USEYN', '전체')
    // 그리드 생성
    this.$refs.fileGrid.create(this.columnLayout, this.auigridProps);

    // 그리드 데이터 삽입하기
    const res = await getFileList({file_grp_seq: this.$store.state.modal.file_grp_seq})
    console.log('list====', res.data)
    this.$refs.fileGrid.setGridData(res.data)
    // this.$refs.fileGrid.clearGridData()
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
    beforeUpload(file) {
      this.fileList = [...this.fileList, file];
      return false;
    },
    handleChange(info) {
      console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@',info)
      if(info.file.status !== 'uploading'){
        console.log('업로드 시작합니다.!!!!!!!!!')
        const { fileList } = this;
        const formData = new FormData();
        // fileList.forEach(file => {
        //   formData.append('files', file);
        // });
        formData.append('files', info.file);
        formData.append('file_grp_seq', this.$store.state.modal.file_grp_seq);
        formData.append('file_size', info.file.size);
        formData.append('file_type', info.file.type);
        formData.append('file_uid', info.file.uid);

        console.log('formData==== ',formData)
        fileSave(formData).then(async (res) => {
              if (res.code == 200) {
                console.log('파일업로드 성공')
                this.$message.success(`${info.file.name} 파일업로드 성공`);
                const res = await getFileList({file_grp_seq: this.$store.state.modal.file_grp_seq})
                console.log('res====', res)
                this.$refs.fileGrid.setGridData(res.data)
              } else {
                this.$message.error(`${info.file.name} 파일 업로드 실패.`);
              }
            }
        )
        this.loading = false

      }else{
        this.loading = true
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
    },
    async goDeleteFile(event) {
      console.log('삭제@!!!!', event.item)
      const that = this

      this.$confirm({
        title: '첨부를 삭제하시겠습니까?',
        // content: 'Bla bla ...',
        okText: '확인',
        cancelText: '취소',
        onOk() {
          // console.log('this.'this)
          // this.test12(event.item)
          deleteFile({file_seq: event.item.file_seq}).then(
              async (res) => {
                console.log('res====', res)
                if (res.code == 200) {
                  console.log('삭제후 들어왔습니다.!@!@!@@!@!@!@!')
                  that.$message.success(`파일삭제 완료`)
                  const res = await getFileList({file_grp_seq: event.item.file_grp_seq})
                  console.log('res====', res)
                  that.$refs.fileGrid.setGridData(res.data)
                } else {
                  that.$message.error(res.message)
                }
                //return res.data;
              },
              error => {
                console.log('error ==== ', error)
              }
          )

        }
      })
    },
    async cellClickHandler(event) {
      // 셀클릭 이벤트 핸들링
      console.log('cell click ===', event)
      if (event.dataField == "orgin_file_nm") {
        // const config = {
        //   method: "GET",
        //   url: '/upload/'+event.item.file_nm,
        //   headers: this.headers,
        //   responseType: "blob",
        //   // data: data,
        // };
        // const response = await axios(config);
        // const name = response.headers["content-disposition"]
        //     .split("filename=")[1]
        //     .replace(/"/g, "");
        // const url = window.URL.createObjectURL(new Blob([response.data]));
        // const link = document.createElement("a");
        // link.href = url;
        // link.setAttribute("download", name);
        // link.style.cssText = "display:none";
        // document.body.appendChild(link);
        // link.click();
        // link.remove();

        axios.post('/common/filedown', { file_nm: event.item.file_nm },{ responseType: 'blob' })
            .then((response) => {
              // console.log(name)
              const url = window.URL.createObjectURL(new Blob([response]))
              const link = document.createElement('a')
              link.href = url
              link.setAttribute('download', event.item.orgin_file_nm)
              link.style.cssText = 'display:none'
              document.body.appendChild(link)
              link.click()
              link.remove()

              // try {
              //   let blob = new Blob([response.data], { type: response.headers['content-type'] })
              //   let fileName = this.getFileName(response.headers['content-disposition'])
              //   fileName = decodeURI(fileName) // 파일명 디코딩 (프로젝트에 따라 사용여부 옵션)
              //
              //   if (window.navigator.msSaveOrOpenBlob) { // IE 10+
              //     window.navigator.msSaveOrOpenBlob(blob, fileName)
              //   } else { // not IE
              //     let link = document.createElement('a')
              //     link.href = window.URL.createObjectURL(blob)
              //     link.target = '_self'
              //     if (fileName) link.download = fileName
              //     link.click()
              //   }
              //
              //   // requestObj.callback(res.data)
              // } catch (e) {
              //   console.error(e)
              // }
            })

      }
    },
    test12(item){
      console.log('test중입니다.')

    },
    getFileName (contentDisposition) {
      let fileName = contentDisposition
          .split(';')
          .filter((ele) => {
            return ele.indexOf('fileName') > -1
          })
          .map((ele) => {
            return ele
                .replace(/"/g, '')
                .split('=')[1]
          })
      return fileName[0] ? fileName[0] : null
    }
  }
}
</script>

<style scoped>
</style>
