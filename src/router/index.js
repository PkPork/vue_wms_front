import Vue from "vue";
import Router from "vue-router";
import {
  formatRoutes,
  getRouters
} from "@/utils/routerUtil";
import {
  commonRoutes
} from "./config";

const originalPush = Router.prototype.push;
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch((err) => err);
};

Vue.use(Router);

// 로그인 가로채기가 필요하지 않은 라우팅 구성
const loginIgnore = {
  names: ["404"], //경로 이름으로 일치
  paths: ["/login", "/403"], //경로 fullPath에 따라 일치
  /**
   * 경로가 구성에 포함되어 있는지 확인
   * @param route vue-router 의 route 객체
   * @returns {boolean}
   */
  includes(route) {
    return (
      (this.names.includes(route.name) && route.path != "/") ||
      this.paths.includes(route.path)
    );
  },
};


/**
 * 라우팅 인스턴스 초기화
 * @returns {VueRouter}
 */
function initRouter(isSync, isAuth) {
  const options = {
    mode: 'history', // mode에 history 값을 설정하여 history모드로 변경한다.
    routes: isSync ? require('./sync.config').default.routes : isAuth ? commonRoutes.concat(getRouters()) : commonRoutes,
  };
  formatRoutes(options.routes);
  return new Router(options);
}
export {
  loginIgnore,
  initRouter
};