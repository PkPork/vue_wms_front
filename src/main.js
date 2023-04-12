import Vue from "vue";
import App from "./App.vue";
import {
  initRouter
} from "./router";
import "./theme/index.less";
import Antd from "ant-design-vue";
import Viser from "viser-vue";
import store from "./store";
import "animate.css/source/animate.css";
import "@/theme/auigrid_custom.css";
import Plugins from "@/plugins";
import {
  initI18n
} from "@/utils/i18n";
import bootstrap from "@/bootstrap";
import "moment/locale/zh-cn";
import "moment/locale/ko"
import "file-saver";
import {
  checkAuthorization
} from '@/utils/request'
const router = initRouter(false, checkAuthorization() ? true : false);
const i18n = initI18n("KO", "US");
import { library } from '@fortawesome/fontawesome-svg-core'
/*
   import specific icons
   원하는 아이콘을 개별적으로 import
*/
import { faSquarePlus } from '@fortawesome/free-solid-svg-icons'
/* import font awesome 컴포넌트 */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* grid용 유틸 import */
import gridUtil from "@/utils/gridUtil";


library.add(faSquarePlus)

/* font awesome 컴포넌트를 전역으로 등록 */
Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.use(Antd);
Vue.config.productionTip = false;
Vue.use(Viser);
Vue.use(Plugins);
Vue.use(gridUtil);

bootstrap({
  router,
  store,
  i18n,
  message: Vue.prototype.$message
});

new Vue({
  router,
  store,
  i18n,
  render: (h) => h(App),
}).$mount("#app");