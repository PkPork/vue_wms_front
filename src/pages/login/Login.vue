<template>
  <common-layout>
    <div class="top">
      <div class="header">
        <img alt="logo" class="logo" src="@/assets/img/logo.png" />
        <span class="title">{{ systemName }}</span>
      </div>
      <div class="desc">프로소프트 웹 프레임워크</div>
    </div>
    <div class="login">
      <a-form @submit="onSubmit" :form="form">
        <a-alert
          type="error"
          :closable="true"
          v-show="error"
          :message="error"
          showIcon
          style="margin-bottom: 24px"
        />
        <a-form-item>
          <a-input
            autocomplete="autocomplete"
            size="large"
            placeholder="사용자 이름을 입력하십시오"
            v-decorator="[
              'user_id',
              {
                initialValue: '',
                rules: [
                  { required: true, message: '사용자 이름을 입력하십시오', whitespace: true },
                ],
              },
            ]"
          >
            <a-icon slot="prefix" type="user" />
          </a-input>
        </a-form-item>
        <a-form-item>
          <a-input
            size="large"
            placeholder="비밀번호를 입력 해주세요"
            autocomplete="autocomplete"
            type="password"
            v-decorator="[
              'password',
              {
                initialValue: '',
                rules: [
                  { required: true, message: '비밀번호를 입력 해주세요', whitespace: true },
                ],
              },
            ]"
          >
            <a-icon slot="prefix" type="lock" />
          </a-input>
        </a-form-item>
        <div>
          <a-checkbox :checked="true">자동 로그인</a-checkbox>
        </div>
        <a-form-item>
          <a-button
            :loading="logging"
            style="width: 100%; margin-top: 24px"
            size="large"
            htmlType="submit"
            type="primary"
            >로그인</a-button
          >
        </a-form-item>

        <!-- <div>
          기타 로그인 방법
          <a-icon class="icon" type="alipay-circle" />
          <a-icon class="icon" type="taobao-circle" />
        </div>-->
      </a-form>
    </div>
  </common-layout>
</template>

<script>
import CommonLayout from "@/layouts/CommonLayout";
import {login, logout} from "@/services/system";
import { setAuthorization } from "@/utils/request";
import { mapMutations } from "vuex";
import { mapState } from "vuex";
import {getCmCodeListAllUseStore} from "@/services/common";
export default {
  name: "Login",
  components: { CommonLayout },
  data() {
    return {
      logging: false,
      error: "",
      form: this.$form.createForm(this),
      verCode: "",
    };
  },
  computed: {
    systemName() {
      return this.$store.state.setting.systemName;
    },
  },
  created() {
    this.newVerCode();
  }, async mounted() {

  }, methods: {
    ...mapMutations("account", [
      "setUser",
      "setPermissions",
      "setRole",
      "setMenus",
    ]),
    ...mapMutations("commcd", ["setCommoncodes"]),
    newVerCode() {
      this.verCode =
        process.env.VUE_APP_API_BASE_URL +
        "/backed/captcha" +
        "?m=" +
        Math.random();
    },
    onSubmit(e) {
      const that = this
      e.preventDefault();
      this.form.validateFields((err) => {
        if (!err) {
          this.logging = true
          const user_id = this.form.getFieldValue("user_id");
          const password = this.form.getFieldValue("password");
          const code = this.form.getFieldValue("code");
          login({ user_id, password, code  })
              .then(this.afterLogin)
              .catch(function(error) {
                that.logging = false
          });
        }
      })
    },
    translatePermission(permissions) {
      return permissions.map((item) => {
        return {
          operation: JSON.parse(item.operation),
          component: item.component,
        };
      });
    },
    afterLogin(loginRes) {
      const that = this
      if (loginRes.code == 200) {
        let { user, permissions, menus } = loginRes.data;
        permissions = this.translatePermission(permissions);
        this.setUser(user);
        this.setPermissions(permissions);
        console.log('menus === ',menus)
        // alert('menus === ',menus)
        this.setMenus(menus);
        this.setRole(user.role);
        setAuthorization({
          token: loginRes.data.token,
          expireAt: new Date(loginRes.data.tokenExpireAt),
        });
            this.logging = false
            this.$message.loading('잠시만 기다려주세요... 기준정보 로딩중입니다...', 10)
            getCmCodeListAllUseStore({}).then((res) => {
              console.log('res == ',res)
              // alert('@@@@@@@@@@@@',JSON.parse(res.data[0].cm_code_list))
              const cm_list = res.data
              const result1 = cm_list.filter(cm => cm.group_cd == "GENDER");
              const result2 = cm_list.filter(cm => cm.group_cd == "USEYN");
              const result3 = cm_list.filter(cm => cm.group_cd == "USERGB");


              this.setCommoncodes(cm_list);
              // this.$store.commit('commcd/setCommoncodes', 'teststes')
              this.logging = false;
              // console.log('user====',user)
              console.log('@@@@@@@@@@####### = ',this.$store.state.commcd.commoncodes)
               window.location.href = '/'
            })


      } else {
        this.logging = false
        this.error = loginRes.message;
      }
    },
  },
};
</script>

<style lang="less" scoped>
.common-layout {
  .top {
    text-align: center;
    .header {
      height: 44px;
      line-height: 44px;
      a {
        text-decoration: none;
      }
      .logo {
        height: 44px;
        vertical-align: top;
        margin-right: 16px;
      }
      .title {
        font-size: 33px;
        color: @title-color;
        font-family: "Myriad Pro", "Helvetica Neue", Arial, Helvetica,
          sans-serif;
        font-weight: 600;
        position: relative;
        top: 2px;
      }
    }
    .desc {
      font-size: 14px;
      color: @text-color-second;
      margin-top: 12px;
      margin-bottom: 40px;
    }
  }
  .login {
    width: 368px;
    margin: 0 auto;
    @media screen and (max-width: 576px) {
      width: 95%;
    }
    @media screen and (max-width: 320px) {
      .captcha-button {
        font-size: 14px;
      }
    }
    .icon {
      font-size: 24px;
      color: @text-color-second;
      margin-left: 16px;
      vertical-align: middle;
      cursor: pointer;
      transition: color 0.3s;

      &:hover {
        color: @primary-color;
      }
    }
  }
}
</style>
