<template>

  <div>
    <a-list
      itemLayout="horizontal"
      :dataSource="data"
    >
      <a-list-item slot="renderItem" slot-scope="item, index" :key="index">
        <a-list-item-meta>
          <a slot="title">{{ item.title }}</a>
          <span slot="description">
            <span class="security-list-description">{{ item.description }}</span>
            <span v-if="item.value"> : </span>
            <span class="security-list-value">{{ item.value }}</span>
          </span>
        </a-list-item-meta>
        <template v-if="item.actions">
          <a slot="actions" @click="item.actions.callback">{{ item.actions.title }}</a>
        </template>

      </a-list-item>

    </a-list>

    <a-modal title="비밀번호 변경" :width="800" @cancel="cancel" v-model="visible" @ok="handleOk">

      <a-form ref="ruleForm" :form="form" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-form-item
          label="사용자 이름"
        >
          <a-input
            disabled="disabled"
            :value="currUser.username"
          />
        </a-form-item>

        <a-form-item
          label="비밀번호"
        >
          <a-input
            placeholder="기존 비밀번호를 입력하세요!"
            v-decorator="['sourcePassword', { rules: [{ required: true, message: '기존 비밀번호를 입력하세요!' }] }]"
          />
        </a-form-item>

        <a-form-item
          label="새 비밀번호"
        >
          <a-input
            placeholder="새 비밀번호를 입력하세요!"
            v-decorator="['password', { rules: [{ required: true, validator: checkPassword }] }]"
          />
        </a-form-item>

        <a-form-item
          label="새 비밀번호 확인"
        >
          <a-input
            placeholder="확인을 위해 새 비밀번호를 입력하세요.!"
            v-decorator="['confirmPassword', { rules: [{ required: true, validator: checkConfirmPassword }] }]"
          />
        </a-form-item>


      </a-form>
    </a-modal>

  </div>

</template>

<script>
import { setSysUserPassword } from '@/services/system'
import {mapState} from 'vuex'
export default {
  name: 'Security',
  data () {
    let pwdRegex = new RegExp('(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9]).{8,30}');
    let checkPassword = (rule, value, callback) => {

      if(!value){
        callback(new Error('새 비밀번호를 입력하세요!'));
      }

      if (value) {
        if(!pwdRegex.test(value)){
          callback(new Error('암호 복잡성을 너무 낮게 설정하십시오. 대문자와 소문자, 숫자, 특수 문자를 포함해야 하며 8자 이상이어야 합니다.'));
        }
      }
       callback();
    };
    let checkConfirmPassword = (rule, value, callback) => {

      if(!value){
        callback(new Error('새 비밀번호를 입력하세요!'));
      }

      if (value) {
        if(!pwdRegex.test(value)){
          callback(new Error('암호 복잡성을 너무 낮게 설정하십시오. 대문자와 소문자, 숫자, 특수 문자를 포함해야 하며 8자 이상이어야 합니다.'));
        }

        if(value != this.$refs['ruleForm'].form.getFieldValue("password")){
          callback(new Error('두 번 입력한 비밀번호가 일치하지 않습니다！'));
        }

      }
       callback();
    };
    return {
      data: [
        { title: '비밀번호 변경', actions: { title: '수정', callback: () => { this.showDialog()} } },
      ],
      visible: false,
      checkPassword: checkPassword,
      checkConfirmPassword: checkConfirmPassword,
      form: this.$form.createForm(this),
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      },
    }
  },
  computed: {
    ...mapState("account", { currUser: "user" }),
  },
  methods: {
    showDialog(){
      this.visible = true
    },
    cancel(){
      this.$refs['ruleForm'].form.resetFields();
    },
    handleOk(e) {
      e.preventDefault();
      this.$refs['ruleForm'].form.validateFields((err, values) => {
        if (!err) {
          setSysUserPassword(values).then(res => {
            if(res.code == 200){
              this.$message.success('비밀번호가 업데이트되었습니다!');
              this.visible = false;
            }else{
              this.$message.error(res.message);
            }
          });
        }
      });
    }

  }
}
</script>

<style scoped>

</style>
