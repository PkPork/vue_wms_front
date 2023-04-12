import TabsView from "@/layouts/tabs/TabsView";
import BlankView from "@/layouts/BlankView";
import PageView from "@/layouts/PageView";

// 일반 라우팅 구성
export const commonRoutes = [
  {
    path: "/login",
    name: "로그인 페이지",
    component: () => import("@/pages/login"),
  },
  {
    path: "*",
    name: "404",
    component: () => import("@/pages/exception/404"),
  },
  {
    path: "/403",
    name: "403",
    component: () => import("@/pages/exception/403"),
  },
];

export const defaultSettingRoutes = [
  {
    path: 'setting',
    name: '개인 설정',
    meta: {
      invisible: true,
    },
    component: () => import("@/pages/setting/Index"),
    redirect: "/setting/base",
    children: [
      {
        path: 'base',
        name: '기본 설정',
        component: () => import("@/pages/setting/BaseSetting"),
      },
      {
        path: 'security',
        name: '보안 설정',
        component: () => import("@/pages/setting/Security"),
      },
      {
        path: 'custom',
        name: '개인 설정',
        component: () => import("@/pages/setting/Custom"),
      },
    ]
  }
];

// 프런트 엔드 라우팅 테이블
export const constantRouterComponents = {
  TabsView: TabsView,
  PageView: PageView,
  BlankView: BlankView,
  Login: () => import("@/pages/login"),
  "403": () => import(/* webpackChunkName: "error" */ "@/pages/exception/403"),
  "404": () => import(/* webpackChunkName: "error" */ "@/pages/exception/404"),
  Workplace: () => import("@/pages/workplace"),
  UserList: () => import("@/pages/user/UserList"),
  SystemUserList: () => import("@/pages/system/UserList"),
  SystemUser2List: () => import("@/pages/system/User2List.vue"),
  MenuList: () => import("@/pages/system/MenuList"),
  MenuListGrid: () => import("@/pages/system/MenuListGrid"),
  RoleList: () => import("@/pages/system/RoleList"),
  LogList: () => import("@/pages/system/LogList"),
  Success: () => import("@/pages/result/Success"),
  Error: () => import("@/pages/result/Error"),
  SeniorTable: () => import("@/pages/components/table"),
  CommonCode: () => import("@/pages/master/CommonCode"),
  NoticeBoardList: () => import("@/pages/system/NoticeBoardList"),
  RoleListGrid: () => import("@/pages/system/RoleListGrid"),
  MstIc: () => import("@/pages/master/MstIc"),          //품목 관리
  MstCt: () => import("@/pages/master/MstCt"),          //센터 관리
  MstDrvr: () => import("@/pages/master/MstDrvr"),        //차량정보 관리
  SysRoleCt: () => import("@/pages/system/SysRoleCt"),  //권한별 센터관리
  MstAc: () => import("@/pages/master/MstAc"),        //거래처 관리
  MstZn: () => import("@/pages/master/MstZn"),        //존_로케이션 관리
  InboundOrder: () => import("@/pages/inbound/InboundOrder"),        //입고 지시
  MstPda: () => import("@/pages/master/MstPda"),
  InbSchConf: () => import("@/pages/inbound/InbSchConf"), //입고예정&입고확정
  InventoryUpload: () => import("@/pages/inventory/InventoryUpload.vue"), //재고업로드
  workControl: () => import("@/pages/inventory/workControl.vue"), //작업지시 관리
  workOrderCreate: () => import("@/pages/inventory/workOrderCreate.vue"), //작업지시 생성
  OutboundOrder: () => import("@/pages/inbound/InboundOrder"),        //출고 지시
  QcJdgmnt: () => import("@/pages/inbound/QcJdgmnt"),        //QC판정
};