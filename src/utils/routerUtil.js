import { mergeI18nFromRoutes } from "@/utils/i18n";
import { constantRouterComponents, defaultSettingRoutes } from "@/router/config";

//应用配置
let appOptions = {
  router: undefined,
  i18n: undefined,
  store: undefined,
};

/**
 * 앱 구성 설정
 * @param options
 */
function setAppOptions(options) {
  const { router, store, i18n } = options;
  appOptions.router = router;
  appOptions.store = store;
  appOptions.i18n = i18n;
}

function translateRouter(routes, parent) {
  return routes.map((item) => {
    const { invisible, icon, cacheAble } = item;
    let path = "";
    if (!item.path.startsWith("/") && item.path !== "*") {
      if (parent && parent.path && parent.path != "/") {
        path = `${parent.path}/${item.path}`;
      } else {
        path = `/${item.path}`;
      }
    }
    const currentRouter = {
      path: path,
      name: item.name,
      component: constantRouterComponents[item.component],
      meta: { page: {} },
    };

    item.component = constantRouterComponents[item.component];

    if (icon) {
      currentRouter.meta.icon = icon;
    }
    if (cacheAble == 1) {
      currentRouter.meta.page.cacheAble = true;
    }
    if (invisible == 1) {
      currentRouter.meta.invisible = true;
    }
    // 是否有子菜单，并递归处理
    if (item.children && item.children.length > 0) {
      if (item.redirect) {
        currentRouter.redirect = item.path == "/" ? `/${item.redirect}` : `${item.path}/${item.redirect}`;
      }
      currentRouter.children = translateRouter(item.children, item);
    } else {
      delete item.children;
    }
    return currentRouter;
  });
}

function loadRoutes() {
  // 애플리케이션 구성
  const { router, store, i18n } = appOptions;
  // 경로 국제화 데이터 추출
  mergeI18nFromRoutes(i18n, router.options.routes);
  // 관리자 백그라운드 메뉴 데이터 초기화
  const rootRoute = router.options.routes.find((item) => item.path === "/");
  const menuRoutes = rootRoute && rootRoute.children;
  if (menuRoutes) {
    store.commit("setting/setMenuData", menuRoutes);
  }
}

/**
 * 형식화된 경로
 * @param routes 라우팅 구성
 */
function formatRoutes(routes) {
  routes.forEach((route) => {
    const { path } = route;
    if (!path.startsWith("/") && path !== "*") {
      route.path = "/" + path;
    }
  });
  formatAuthority(routes);
}

/**
 * 형식이 지정된 경로에 대한 권한 구성
 * @param routes 라우팅
 * @param pAuthorities 상위 라우팅 권한 구성 집합
 */
function formatAuthority(routes, pAuthorities = []) {
  routes.forEach((route) => {
    const meta = route.meta;
    const defaultAuthority = pAuthorities[pAuthorities.length - 1] || {
      role: "*",
    };
    if (meta) {
      let authority = {};
      if (!meta.authority) {
        authority = defaultAuthority;
      } else if (typeof meta.authority === "string") {
        authority.role = meta.authority;
      } else if (typeof meta.authority === "object") {
        authority = meta.authority;
        const { role } = authority;
        if (typeof role === "string") {
          authority.role = [role];
        }
        if (!authority.role && !authority.role) {
          authority = defaultAuthority;
        }
      }
      meta.authority = authority;
    } else {
      const authority = defaultAuthority;
      route.meta = { authority };
    }
    route.meta.pAuthorities = pAuthorities;
    if (route.children) {
      formatAuthority(route.children, [...pAuthorities, route.meta.authority]);
    }
  });
}

/**
 * path 경로에서 i18n key 가져오기
 * @param path
 * @returns {*}
 */
function getI18nKey(path) {
  const keys = path
    .split("/")
    .filter((item) => !item.startsWith(":") && item != "");
  keys.push("name");
  return keys.join(".");
}

/**
 * 네비게이션 가드 로드
 * @param guards
 * @param options
 */
function loadGuards(guards, options) {
  const { beforeEach, afterEach } = guards;
  const { router } = options;
  beforeEach.forEach((guard) => {
    if (guard && typeof guard === "function") {
      router.beforeEach((to, from, next) => guard(to, from, next, options));

      router.beforeEach((to, from, next) => guard(to, from, next, options));

      //a.vue 를 빌드시 최초aaa.js 이나 또 빌드하면 bbb.js 같이 파일명이 변함.
      //파일이 없을때 chunk 에러가 발생하는데 chunk 에러 발생시 화면을 로그할 수 있게 리로드 해준다.
      //참고 사이트1 : https://blog.francium.tech/vue-lazy-routes-loading-chunk-failed-9ee407bbd58
      //참고 사이트2 : https://satisfactoryplace.tistory.com/194
      // router.onError(error => {
      //   console.log('리로드 청크 에러 ',error)
      //   if (/loading chunk \d* failed./i.test(error.message)) {
      //     window.location.reload()
      //   }
      // })

      //a.vue 를 빌드시 최초aaa.js 이나 또 빌드하면 bbb.js 같이 파일명이 변함.
      //파일이 없을때 chunk 에러가 발생하는데 chunk 에러 발생시 화면을 로그할 수 있게 리로드 해준다.
      //참고 사이트1 : https://blog.francium.tech/vue-lazy-routes-loading-chunk-failed-9ee407bbd58
      //참고 사이트2 : https://satisfactoryplace.tistory.com/194
      // router.onError(error => {
      //   console.log('리로드 청크 에러 ',error)
      //   if (/loading chunk \d* failed./i.test(error.message)) {
      //     window.location.reload()
      //   }
      // })

      //2022.11.09 위 로직은 적용 되지 않는 것을 확인함.
      //다시 구글링으로 다른 로직의 적용을 찾음.
      // 참고사이트 : https://blog.wanzargen.me/m/39
      let nextPath=""
      router.onError((error) => {
        console.error(error);

        if (error.name === 'ChunkLoadError') {
          window.location.href = nextPath || '/'
        }
      })
    }
  });
  afterEach.forEach((guard) => {
    if (guard && typeof guard === "function") {
      router.afterEach((to, from) => guard(to, from, options));
    }
  });
}

function getRouters() {
  let menus = localStorage.getItem(process.env.VUE_APP_MENUS_KEY);
  menus = JSON.parse(menus);
  let routes = [
    {
      path: "/",
      component: "TabsView",
      redirect: menus[0]["path"],
      children: JSON.parse(JSON.stringify(menus)),
    },
  ];
  routes = translateRouter(routes);
  routes[0].children = routes[0].children.concat(defaultSettingRoutes)
  return routes;
}

export {
  loadRoutes,
  getRouters,
  formatAuthority,
  getI18nKey,
  loadGuards,
  formatRoutes,
  setAppOptions,
};
