<template>
  <div class="page-header-index-wide">
    <a-card
      :bordered="false"
      :bodyStyle="{ padding: '16px 0', height: '100%' }"
      :style="{ minHeight: '560px' }"
    >
      <div class="account-settings-info-main" :class="isMobile ? 'mobile' : ''">
        <div class="account-settings-info-left">
          <a-menu
            :mode="isMobile ? 'horizontal' : 'inline'"
            :style="{ border: '0', width: isMobile ? '560px' : 'auto' }"
            :selectedKeys="selectedKeys"
            type="inner"
            @openChange="onOpenChange"
          >
            <a-menu-item key="/setting/base">
              <router-link :to="{ path: '/setting/base' }">
                기본 설정
              </router-link>
            </a-menu-item>
            <a-menu-item key="/setting/security">
              <router-link :to="{ path: '/setting/security' }">
                보안 설정
              </router-link>
            </a-menu-item>
            <a-menu-item key="/setting/custom">
              <router-link :to="{ path: '/setting/custom' }">
                개인 설정
              </router-link>
            </a-menu-item>
          </a-menu>
        </div>
        <div class="account-settings-info-right">
          <div class="account-settings-info-title">
            <span>{{ $route.name }}</span>
          </div>
          <router-view :style="{ minHeight: '560px' }" />
        </div>
      </div>
    </a-card>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      // horizontal  inline
      mode: "inline",

      openKeys: [],
      selectedKeys: [],

      // cropper
      preview: {},
      option: {
        info: true,
        size: 1,
        outputType: "jpeg",
        canScale: false,
        autoCrop: true,
        // 자동 스크린샷이 켜져 있을 때만 너비와 높이가 적용됩니다.
        autoCropWidth: 180,
        autoCropHeight: 180,
        fixedBox: true,
        // 너비 및 높이 비율 켜기
        fixed: true,
        fixedNumber: [1, 1],
      },

      pageTitle: "",
    };
  },
  computed: {
    ...mapState("setting", ["isMobile"]),
  },
  created() {
    this.updateMenu();
  },
  methods: {
    onOpenChange(openKeys) {
      this.openKeys = openKeys;
    },
    updateMenu() {
      const routes = this.$route.matched.concat();
      this.selectedKeys = [routes.pop().path];
    },
  },
  watch: {
    $route(val) {
      this.updateMenu();
    },
  },
};
</script>

<style lang="less" scoped>
.account-settings-info-main {
  width: 100%;
  display: flex;
  height: 100%;
  overflow: auto;

  &.mobile {
    display: block;

    .account-settings-info-left {
      border-right: unset;
      border-bottom: 1px solid #e8e8e8;
      width: 100%;
      height: 50px;
      overflow-x: auto;
      overflow-y: scroll;
    }
    .account-settings-info-right {
      padding: 20px 40px;
    }
  }

  .account-settings-info-left {
    border-right: 1px solid #e8e8e8;
    width: 224px;
  }

  .account-settings-info-right {
    flex: 1 1;
    padding: 8px 40px;

    .account-settings-info-title {
      color: rgba(0, 0, 0, 0.85);
      font-size: 20px;
      font-weight: 500;
      line-height: 28px;
      margin-bottom: 12px;
    }
    .account-settings-info-view {
      padding-top: 12px;
    }
  }
}
</style>
