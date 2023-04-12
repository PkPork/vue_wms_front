<template>
  <a-card :body-style="{padding: '5px'}" :bordered="false" >
    <a-form :form="form" id="PopBoard" layout="horizontal" >
      <a-row >
        <a-col :md="24" :sm="24" >
          <a-form-item label="제목" :labelCol="{span: 2}" :wrapperCol="{span: 21, offset: 1}" :colon=false layout="inline">
            <a-input v-model="param.post_tit"
                     v-decorator="['item_cd', {initialValue: param.post_tit, rules: [{ required: true, message: '제목을 입력하세요.'}]}]"
                     :disabled="param.state=='look'"
            />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row >
        <a-col :md="12" :sm="24" >
          <a-form-item label="작성일시" :labelCol="{span: 5}" :wrapperCol="{span: 18, offset: 1}" :colon=false>
            <a-input v-model="param.reg_dt"
                     disabled
            />
          </a-form-item>
        </a-col>
        <a-col :md="12" :sm="24" >
          <a-form-item label="작성자" :labelCol="{span: 5}" :wrapperCol="{span: 18, offset: 1}" :colon=false>
            <a-input v-model="param.reg_nm"
                     disabled
            />
          </a-form-item>
        </a-col>
        <a-col :md="12" :sm="24" v-show="param.state!='look'">
          <a-form-item label="게시기간" :labelCol="{span: 5}" :wrapperCol="{span: 18, offset: 1}" :colon=false>
            <a-range-picker
                :value="[moment(param.post_sd), moment(param.post_ed)]"
                style="width: 100%"
                @change="postDtChange"
            />
          </a-form-item>
        </a-col>
        <a-col :md="12" :sm="24" v-show="param.state!='look'">
          <a-form-item label="공지팝업여부" :labelCol="{span: 5}" :wrapperCol="{span: 18, offset: 1}" :colon=false>
            <a-checkbox v-model="param.noti_yn">
            </a-checkbox>
          </a-form-item>
        </a-col>
      </a-row>
      <a-divider/>
      <a-row >
        <vue-editor v-model="param.post_cont"
                    :disabled="param.state=='look'"
        ></vue-editor>
      </a-row>
      <a-row type="flex" justify="end">
        <file-attach-box v-if="this.$store.state.modal.file_popup" :visible="this.$store.state.modal.file_popup"
                         :callType="'input'" @closepopItem="closeFilePopup"></file-attach-box>
        <a-button icon="download"
                  @click="openFilePopup"
        >
          첨부파일
        </a-button>
      </a-row>
      <div v-show="comment_show">
        <a-row >
          <a-list
              class="comment-list"
              :header="`${comment.length} replies`"
              item-layout="horizontal"
              :data-source="comment"
              v-show="comment.length!= 0"
          >
            <a-list-item slot="renderItem" slot-scope="item, index">
              <a-comment :author="item.reg_nm">
                <span slot="actions" @click="deleteBoardComt(item)" v-show="item.reg_id==comnt_param.reg_id">삭제</span>
                <a-avatar
                    slot="avatar"
                    :src="item.avatar"
                    size="large"
                />
                <p slot="content">
                  {{ item.comnt_cont }}
                </p>
                <a-tooltip slot="datetime" :title="item.reg_dt">
                  <span>{{ item.reg_dt }}</span>
                </a-tooltip>
              </a-comment>
            </a-list-item>
          </a-list>
          <a-comment>
            <a-avatar
                slot="avatar"
                :src="this.$store.state.account.user.avatar"
            />
            <div slot="content">
              <a-form-item>
                <a-textarea :rows="4" v-model="comnt_param.comnt_cont"/>
              </a-form-item>
              <a-form-item>
                <a-button html-type="submit" type="primary" @click="saveBoardComt">
                  댓글등록
                </a-button>
              </a-form-item>
            </div>
          </a-comment>
        </a-row>
      </div>
      <a-divider/>
      <a-row type="flex" justify="end" >
        <a-button type="primary" style="margin-left: 8px" @click="saveBoard" > <a-icon type="save" />저장</a-button>
        <a-button type="primary" style="margin-left: 8px" @click="deleteBoard" v-show="param.state=='update'" > <a-icon type="delete" />삭제</a-button>
        <a-button type="primary" style="margin-left: 8px" @click="close" > <a-icon type="close" />닫기</a-button>
      </a-row>
    </a-form>
  </a-card>
</template>

<script>
import {
  getBoardComtList,
  saveBoardComtList,
  saveBoard,
  saveBoardLookCount,
  saveBoardFileGrpSeq
} from "@/services/board";
import moment from 'moment';
import { VueEditor } from "vue2-editor";
//첨부파일
import FileAttach from "@/pages/components/modal/FileAttach";
import {mapMutations} from "vuex";
import {getFileGrpSeq} from "@/services/common";
import FileAttachBox from "@/pages/components/modal/FileAttachBox";


export default {
  name : "PopBoard",
  components: {
    FileAttachBox,
    FileAttach,
    VueEditor
  },
  data () {
    return {
      comment: [],
      param : {
        plant_cd: '',
        owner_cd: '',
        row_status: '',
        state:'',

        board_id: '',
        post_no: '',
        post_grp_no: '',
        post_grp_sn: '',
        post_lvl: '',
        post_tit: '',
        post_cont: '',
        noti_yn: 'true',
        reg_dt: '',
        reg_id: '',
        mod_id: '',
        mod_nm: '',
        reg_nm: '',
        post_sd: '',
        post_ed: '',
        file_grp_seq: '',
      },
      comnt_param: {
        row_status: '',

        post_comnt_no: '',
        board_id: '',
        post_no: '',
        comnt_cont: '',
        reg_id: '',
        reg_nm: '',
      },
      form: this.$form.createForm(this)
    }
  },
  props : {
    popinit: {}
  },
  created() {
    //신규
    if(this.popinit.isNew === true) {
      const date = new Date();
      this.param.state = 'insert';
      this.param.post_sd = date.getFullYear() + '-' + (('0' + (date.getMonth() + 1)).slice(-2)) + '-' + '01';
      this.param.post_ed = date.getFullYear() + '-' + (('0' + (date.getMonth() + 1)).slice(-2)) + '-' + date.getDate();
      this.param.reg_dt  = date.getFullYear() + '-' + (('0' + (date.getMonth() + 1)).slice(-2)) + '-' + date.getDate()
          + ' ' +  ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2);
      this.param.reg_id = this.$store.state.account.user.user_id
      this.param.reg_nm = this.$store.state.account.user.name
      this.param.mod_id = this.$store.state.account.user.user_id
      this.param.mod_nm = this.$store.state.account.user.name

      this.param.board_id = '1';
      this.param.post_grp_no = '1';
      this.param.post_grp_sn = '1';
      this.param.post_lvl = '1'

      this.param.row_status = 'I';
      this.param.noti_yn = true;

      this.comnt_param.reg_nm = this.$store.state.account.user.name;
      this.comnt_param.reg_id = this.$store.state.account.user.user_id;
    }
    //수정
    else if(this.popinit.isNew === false) {
      this.param = this.popinit;
      this.param.state = 'update';
      this.param.noti_yn = this.popinit.noti_yn == 'Y' ? true : false ;
      this.param.row_status = 'U';

      this.comnt_param.reg_nm = this.$store.state.account.user.name;
      this.comnt_param.reg_id = this.$store.state.account.user.user_id;

      this.getBoardComt();
    }
    // 게시판 보러온 유저들
    else{
      this.param = this.popinit;
      this.param.state = 'look';
      this.param.noti_yn = this.popinit.noti_yn == 'Y' ? true : false ;
      this.param.row_status = 'U';

      this.comnt_param.reg_nm = this.$store.state.account.user.name;
      this.comnt_param.reg_id = this.$store.state.account.user.user_id;

      this.getBoardComt();
      this.addBoardLookCount();
    }

  },
  mounted() {
  },
  computed: {
    comment_show: function (){
      return this.param.state != 'insert';
    }
  },
  watch :{
  },
  methods : {
    ...mapMutations('modal', ['setFile_popup']),
    ...mapMutations('modal', ['setFile_grp_seq']),
    moment,
    close(){
      this.$emit("closepop", '')
    },
    saveBoard(){
      this.form.validateFields((err) => {
        if(!err) {
          const that = this;
          this.$confirm({
            title: 'save',
            content: '저장하시겠습니까?',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            centered: true,
            onOk() {
              saveBoard(that.param).then(that.aftersaveuser)
            },
            onCancel() {},
          });
        }
      })
    },
    deleteBoard(){
      const that = this;
      this.$confirm({
        title: 'delete',
        content: '삭제하시겠습니까?',
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        centered: true,
        onOk() {
          that.param.row_status = 'D';
          saveBoard(that.param).then(that.aftersaveuser)
        },
        onCancel() {},
      });

    },
    aftersaveuser(res) {
      if (res.code == '200') {
        if(this.param.row_status == 'I'){
          this.$message.success('저장 완료되었습니다.', 3)
          this.$emit("closepop", '')
        }else if(this.param.row_status == 'U'){
          this.$message.success('수정 완료되었습니다.', 3)
          this.$emit("closepop", '')
        }else if(this.param.row_status == 'D'){
          this.$message.success('삭제 완료되었습니다.', 3)
          this.$emit("closepop", '')
        }
      }
    },
    postDtChange(event, dateString){
      this.param.post_sd = dateString[0].replace(/-/g,'');
      this.param.post_ed = dateString[1].replace(/-/g,'');
    },
    getBoardComt() {
      return getBoardComtList(Object.assign(this.popinit)).then(
          (res) => {
            if(res.data.length > 0){
              this.comment = res.data;
              console.log('res====', this.comment)
            }
          }
      )
    },
    saveBoardComt() {
      this.comnt_param.row_status = 'I';
      this.comnt_param.post_no = this.param.post_no;
      this.comnt_param.board_id = this.param.board_id;

      return saveBoardComtList(this.comnt_param).then(
          () => {
            return getBoardComtList(Object.assign(this.popinit)).then(
                (res) => {
                  if(res.data.length > 0){
                    this.comment = res.data;
                    this.comnt_param.comnt_cont = '';
                  }
                }
            )
          }
      );
    },
    deleteBoardComt(e) {
      this.comnt_param.row_status = 'D';
      this.comnt_param.post_no = e.post_no;
      this.comnt_param.board_id = e.board_id;
      this.comnt_param.post_comnt_no = e.post_comnt_no

      return saveBoardComtList(this.comnt_param).then(
          () => {
            return getBoardComtList(Object.assign(this.popinit)).then(
                (res) => {
                  if(res.data.length > 0){
                    this.comment = res.data;
                    this.comnt_param.comnt_cont = '';
                  }
                }
            )
          }
      );
    },
    addBoardLookCount() {
      saveBoardLookCount(this.param);
    },
    async openFilePopup() {

      // 1.file_grp_seq가 null이면 생성 후 팝업에 파라미터로 던져주고 존재하면 그냥 던져줌.
      let saveCnt = 0
      if (this.param.file_grp_seq == null) {
        console.log('null입니다@@@@@@')
        this.param.file_grp_seq = await getFileGrpSeq()

        console.log(this.param);
        await saveBoardFileGrpSeq(this.param).then(
            (res) => {
              console.log('res====', res)
              if (res.code == 200) {
                saveCnt = res.data
              } else {
                this.$message.error(res.message);
              }
              //return res.data;
            },
            error => {
              console.log('error ==== ', error)
            }
        )
      }else{
        saveCnt = 1
      }
      if(saveCnt == 1){
        this.setFile_grp_seq(this.param.file_grp_seq)
        this.setFile_popup(true)
      }
    },
    //파일팝업 닫기
    closeFilePopup(event) {
      console.log("event=======", event)
      this.queryParam.item_cd = event.item_cd
      this.queryParam.item_nm = event.item_nm
      this.setItem_popup(false)
    }
  },
}
</script>

<style>
</style>
