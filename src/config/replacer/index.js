/**
 * webpack-theme-color-replacer 배치
 * webpack-theme-color-replacer는 시스템이 실행 중일 때 테마를 동적으로 전환할 수 있는 효율적인 테마 색상 교체 플러그인입니다.
 * 그러나 어떤 경우에는 맞춤형 요구 사항을 달성하기 위해 webpack-theme-color-replacer에 대한 몇 가지 규칙을 구성해야 합니다.
 *
 * @cssResolve: webpack-theme-color-replacer가 테마 색상을 대체해야 하는 CSS를 추출한 후 적용되는 CSS 처리 규칙입니다. 일반적으로
 *              webpack-theme-color-replacer는 기본 규칙이 요구 사항을 충족할 수 없을 때 사용됩니다.。
 */
const cssResolve = require('./resolve.config')
module.exports = {cssResolve}
