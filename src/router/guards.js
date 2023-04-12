import {
  hasAuthority
} from "@/utils/authority-utils";
import {
  loginIgnore
} from "@/router/index";
import {
  checkAuthorization
} from "@/utils/request";
import NProgress from "nprogress";

NProgress.configure({
  showSpinner: false
});

/**
 * 진행 표시줄 시작
 * @param to
 * @param form
 * @param next
 */
const progressStart = (to, from, next) => {
  // start progress bar
  if (!NProgress.isStarted()) {
    NProgress.start();
  }
  next();
};

/**
 * 로그인 가드
 * @param to
 * @param form
 * @param next
 * @param options
 */
const loginGuard = (to, from, next, options) => {
  if (!loginIgnore.includes(to) && !checkAuthorization()) {
    next({
      path: "/login"
    });
  } else if (checkAuthorization() && to.path == '/login') {
    next({
      path: "/"
    });
  } else {
    next();
  }
};

/**
 * 허가 가드
 * @param to
 * @param form
 * @param next
 * @param options
 */
const authorityGuard = (to, from, next, options) => {
  const {
    store,
    message
  } = options;
  const role = store.getters["account/role"];
  if (!hasAuthority(to, role)) {
    message.warning(`죄송합니다. 페이지에 액세스할 수 있는 권한이 없습니다.: ${to.fullPath}，관리자에게 문의하세요`);
    next({
      path: "/403"
    });
    // NProgress.done()
  } else {
    next();
  }
};

/**
 * 혼합 탐색 모드에서 다음 수준 메뉴 점프 리디렉션
 * @param to
 * @param from
 * @param next
 * @param options
 * @returns {*}
 */
const redirectGuard = (to, from, next, options) => {
  const {
    store
  } = options;
  const getFirstChild = (routes) => {
    const route = routes[0];
    if (!route.children || route.children.length === 0) {
      return route;
    }
    return getFirstChild(route.children);
  };
  if (store.state.setting.layout === "mix") {
    const firstMenu = store.getters["setting/firstMenu"];
    if (firstMenu.find((item) => item.fullPath === to.fullPath)) {
      store.commit("setting/setActivatedFirst", to.fullPath);
      const subMenu = store.getters["setting/subMenu"];
      if (subMenu.length > 0) {
        const redirect = getFirstChild(subMenu);
        return next({
          path: redirect.fullPath
        });
      }
    }
  }
  next();
};

/**
 * 진행률 표시줄 끝
 * @param to
 * @param form
 * @param options
 */
const progressDone = () => {
  // finish progress bar
  NProgress.done();
};

export default {
  beforeEach: [progressStart, loginGuard, authorityGuard, redirectGuard],
  afterEach: [progressDone],
};