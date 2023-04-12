<template>
  <div class="action-size" ref="root">
    <a-tooltip title="밀도">
      <a-dropdown placement="bottomCenter" :trigger="['click']" :get-popup-container="() => $refs.root">
        <a-icon class="action" type="column-height" />
        <a-menu :selected-keys="[value]" slot="overlay" @click="onClick">
          <a-menu-item key="default">
            기본
          </a-menu-item>
          <a-menu-item key="middle">
            중간
          </a-menu-item>
          <a-menu-item key="small">
            작게
          </a-menu-item>
        </a-menu>
      </a-dropdown>
    </a-tooltip>
  </div>
</template>

<script>
  export default {
    name: 'ActionSize',
    props: ['value'],
    inject: ['table'],
    data() {
      return {
        selectedKeys: ['middle']
      }
    },
    methods: {
      onClick({key}) {
        this.$emit('input', key)
      }
    }
  }
</script>

<style scoped lang="less">
.action-size{
  display: inline-block;
}
</style>