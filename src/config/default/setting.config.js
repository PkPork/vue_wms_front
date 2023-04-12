// 이 구성은 시스템의 기본 설정이며, 설정 항목을 수정하려면 src/config/config.js에 수정된 항목을 추가하면 됩니다. 이 파일에서 직접 수정할 수도 있습니다.
module.exports = {
  lang: "KO", //언어, KR(한국어), CN(간체), HK(번체), 기타 언어도 확장 가능
  theme: {
    //구성
    color: "#1890ff", //테마 색상
    mode: "dark", //테마 모드 dark、 light , night
    success: "#52c41a", //성공 색상
    warning: "#faad14", //경고 색상
    error: "#f5222f", //잘못된 색상
  },
  layout: "side", //네비게이션 레이아웃， side , head
  fixedHeader: false, //고정 헤더 상태 표시줄，true:고정，false:비고정
  fixedSideBar: true, //고정 사이드바，true:고정，false:비고정
  fixedTabs: false, //고정 탭 헤더，true:고정，false:비고정
  pageWidth: "fixed", //콘텐츠 영역 너비，fixed:고정 폭，fluid:흐름 폭
  weekMode: false, //색상 약한 모드, true: 열림, false: 열리지 않음
  multiPage: false, //멀티탭 모드, true: 활성화, false: 비활성화
  cachePage: true, //페이지 데이터를 캐시할지 여부는 멀티탭 모드에서만 적용되며 true 캐시, false는 캐시하지 않습니다.
  hideSetting: false, //설정 서랍 숨기기, true: 숨김, false: 숨겨지지 않음
  systemName: "Pro Framework", //시스템 이름
  copyright: "2023 Prosofot All rights reserved (문의 Tel:070-8121-4838)", //copyright
  showPageTitle: true, //페이지 제목(PageLayout 레이아웃의 페이지 제목) 표시 여부, true: 표시, false: 표시 안 함
  filterMenu: true, //권한에 따른 필터 메뉴, true: 필터, false: 필터 없음
  animate: {
    //애니메이션 설정
    disabled: true, //애니메이션 비활성화, true: 비활성화, false: 활성화
    name: "bounce", //애니메이션 효과, 지원되는 애니메이션 효과는 ./animate.config.js를 참조하세요.
    direction: "left", //애니메이션 방향, 페이지 전환 시 애니메이션 방향은 ./animate.config.js 참조
  },
  footerLinks: [
    //페이지 하단의 링크，{link: '링크 주소', name: '이름/표시 텍스트', icon: '아이콘'}
    {
      // link: "https://github.com/cxp1539/open-admin",
      // icon: "github"
    },
  ],
};