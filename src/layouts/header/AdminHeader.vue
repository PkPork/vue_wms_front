<template>
  <a-layout-header :class="[headerTheme, 'admin-header']">
    <div :class="['admin-header-wide', layout, pageWidth]">
      <router-link v-if="isMobile || layout === 'head'" to="/" :class="['logo', isMobile ? null : 'pc', headerTheme]">
        <img width="32" src="@/assets/img/logo.png" />
        <h1 v-if="!isMobile">{{systemName}}</h1>
      </router-link>
      <a-divider v-if="isMobile" type="vertical" />
      <a-icon v-if="layout !== 'head'" class="trigger" :type="collapsed ? 'menu-unfold' : 'menu-fold'" @click="toggleCollapse"/>
      <div v-if="layout !== 'side' && !isMobile" class="admin-header-menu" :style="`width: ${menuWidth};`">
        <i-menu class="head-menu" :theme="headerTheme" mode="horizontal" :options="menuData" @select="onSelect"/>
      </div>
      <div :class="['admin-header-right', headerTheme]">
          <!-- <header-notice class="header-item"/> -->
          <a-row>
            <a-col >
              <a-select v-model="selectedCtkey" style="width: 200px;" @change="ctkeyChange">
                <a-select-option :key="item.CTKEY" :value="item.CTKEY" v-for="(item, index) in CT_LIST">
                  {{ item.CTKEY }} {{ item.CTNAME }}
                </a-select-option>
              </a-select>
            </a-col>
          </a-row>
          <span style="margin-right:24px">
            <a-badge dot>
              <a-avatar icon="bell" style="background: white; color: black" @click="onNotice"/>
            </a-badge>
          </span>
          <header-avatar class="header-item" />
          <!-- <a-dropdown class="lang header-item">
            <div>
              <a-icon type="global"/> {{langAlias}}
            </div>
            <a-menu @click="val => setLang(val.key)" :selected-keys="[lang]" slot="overlay">
              <a-menu-item v-for=" lang in langList" :key="lang.key">{{lang.key.toLowerCase() + ' ' + lang.name}}</a-menu-item>
            </a-menu>
          </a-dropdown> -->
      </div>
    </div>
    <div>
      <a-modal
          :title="'게시판 등록'"
          style="top: 5px"
          :width="1100"
          v-model="isPopUp"
          :footer="null"
      >
        <PopBoard v-if="isPopUp" @closepop="closePopBoard" :popinit="this.popinit"/>
      </a-modal>
    </div>
  </a-layout-header>
</template>

<script>
// import HeaderNotice from './HeaderNotice'
import HeaderAvatar from './HeaderAvatar'
import IMenu from '@/components/menu/menu'
import {mapState, mapMutations} from 'vuex'
import {getNoticeBoardList} from "@/services/board";
import PopBoard from "@/pages/master/PopBoard";
import {getCtComboList, getLoginUserCtkey} from "@/services/common";

export default {
  name: 'AdminHeader',
  components: {IMenu, HeaderAvatar, PopBoard},
  props: ['collapsed', 'menuData'],
  data() {
    return {
      CT_LIST: [],
      langList: [
        {key: 'KO', name: '한국어', alias: '한글'},
        {key: 'CN', name: '简体中文', alias: '简体'},
        {key: 'HK', name: '繁體中文', alias: '繁體'},
      ],
      noticeList: [],
      isPopUp: false,    //팝업호출여부
      popinit: {},       //팝업변수
      selectedCtkey:'',
    }
  },
  async mounted() {
    this.CT_LIST = await getLoginUserCtkey(this.$store.state.account.user.user_id)

    if(localStorage.getItem(process.env.VUE_APP_CT_KEY) == null ){
      console.log('this.CT_LIST111===',this.CT_LIST)

      if(this.CT_LIST.length > 0){
        console.log('this.CT_LIST112=== ',this.CT_LIST[0].CTKEY)
        this.setCtkey(this.CT_LIST[0].CTKEY)
        this.selectedCtkey = this.CT_LIST[0].CTKEY
      }
    }else{
      this.setCtkey(localStorage.getItem(process.env.VUE_APP_CT_KEY))
      console.log('this.$store.state.account.ctkey11112',this.$store.state.account.ctkey)
      this.selectedCtkey = localStorage.getItem(process.env.VUE_APP_CT_KEY)
    }
  },
  computed: {
    ...mapState('setting', ['theme', 'isMobile', 'layout', 'systemName', 'lang', 'pageWidth']),
    headerTheme () {
      if (this.layout == 'side' && this.theme.mode == 'dark' && !this.isMobile) {
        return 'light'
      }
      return this.theme.mode
    },
    langAlias() {
      let lang = this.langList.find(item => item.key == this.lang)
      return lang.alias
    },
    menuWidth() {
      const {layout, searchActive} = this
      const headWidth = layout === 'head' ? '100% - 188px' : '100%'
      const extraWidth = searchActive ? '600px' : '400px'
      return `calc(${headWidth} - ${extraWidth})`
    }
  },
  methods: {
    ...mapMutations("account", ["setCtkey"])
    , openPopBoard(param) {
      this.popinit = param;
      this.isPopUp = true
    },
    closePopBoard() {
      //console.log('sssss')
      this.isPopUp = false
      this.search()
      //this.$router.go()
    },
    toggleCollapse () {
      this.$emit('toggleCollapse')
    },
    onSelect (obj) {
      this.$emit('menuSelect', obj)
    },
    ctkeyChange () {

      this.setCtkey(this.selectedCtkey)
      console.log('this.$store.state.account.ctkey11112',this.$store.state.account.ctkey)
    },
    async onNotice() {
      const res = await getNoticeBoardList()
        this.noticeList = res.data
          console.log('res =-=', res);
        for (let i = 0; i < this.noticeList.length; i++) {
          console.log('key ====',this.noticeList[i].post_no)
          setTimeout(() => {
          this.$notification.open({
            key: this.noticeList[i].post_no,
            message: this.noticeList[i].post_tit,
            description: this.noticeList[i].post_cont,
            btn: h => {
              return h(
                  'a-button',
                  {
                    props: {
                      type: 'primary',
                      size: 'small',
                    },
                    on: {
                      click: () => {
                        //전체 notification 닫기
                        for(let j = 0; j < this.noticeList.length; j++){
                          this.$notification.close(this.noticeList[j].post_no);
                        }
                        this.openPopBoard(this.noticeList[i]);
                      }
                    },
                  },
                  '공지 상세보기',
              )
            },
            // onClose: close,
          })
        }, i*500);
        }


    },
    ...mapMutations('setting', ['setLang'])
  }
}
</script>

<style lang="less" scoped>
@import "index";
</style>
