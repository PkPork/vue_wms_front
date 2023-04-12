<template>
  <page-layout :avatar="currUser.avatar" :style="{minHeight: '736px'}">
    <div slot="headerContent">
      <div class="title">{{timeFix[lang]}}，{{currUser.name}}</div>
    </div>
    <template>
      <a-card :bordered="false">
        <div style="display: flex; flex-wrap: wrap">
            <head-info title="내 할 일" content="8개의 미션" :bordered="true"/>
            <head-info title="이번 주 작업의 평균 처리 시간" content="32분" :bordered="true"/>
            <head-info title="이번 주에 완료된 작업 수" content="24"/>
        </div>
      </a-card>
    </template>
  </page-layout>
</template>

<script>
import PageLayout from "@/layouts/PageLayout";
import { mapState } from "vuex";
import { request } from "@/utils/request";
import { timeFix } from "@/utils/util"
import HeadInfo from '../../components/tool/HeadInfo'
export default {
  name: "WorkPlace",
  components: { PageLayout, HeadInfo },
  data() {
    return {
      timeFix: timeFix()
    };
  },
  computed: {
    ...mapState("account", { currUser: "user" }),
    ...mapState("setting", ["lang"])
  },
  created() {
  }
};
</script>

<style lang="less">
</style>
