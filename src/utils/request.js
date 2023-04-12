import axios from "axios";
import Cookie from "js-cookie";

const xsrfHeaderName = "Authorization";

// axios 인스턴스 생성
const service = axios.create({
  withCredentials: true,
  baseURL: process.env.VUE_APP_API_BASE_URL, // api base_url
  // timeout: 6000, // 요청 시간 초과 (사용하지 않음)
});

/**
 * 인증 정보 설정
 * @param auth {Object}
 */
function setAuthorization(auth) {
  Cookie.set(xsrfHeaderName, auth.token, { expires: auth.expireAt });
}

/**
 * 인증 정보 제거
 */
function removeAuthorization() {
  Cookie.remove(xsrfHeaderName);
}

/**
 * 인증 정보 확인
 * @param authType
 * @returns {boolean}
 */
function checkAuthorization() {
  if (Cookie.get(xsrfHeaderName)) {
    return true;
  } else {
    return false;
  }
}

/**
 * axios 인터셉터 로드
 * @param interceptors
 * @param options
 */
function loadInterceptors(interceptors, options) {
  const { request, response } = interceptors;
  // 로드 요청 인터셉터
  request.forEach((item) => {
    let { onFulfilled, onRejected } = item;
    if (!onFulfilled || typeof onFulfilled !== "function") {
      onFulfilled = (config) => config;
    }
    if (!onRejected || typeof onRejected !== "function") {
      onRejected = (error) => Promise.reject(error);
    }
    service.interceptors.request.use(
      (config) => onFulfilled(config, options),
      (error) => onRejected(error, options)
    );
  });
  // 로드 응답 인터셉터
  response.forEach((item) => {
    let { onFulfilled, onRejected } = item;
    if (!onFulfilled || typeof onFulfilled !== "function") {
      onFulfilled = (response) => response;
    }
    if (!onRejected || typeof onRejected !== "function") {
      onRejected = (error) => Promise.reject(error);
    }
    service.interceptors.response.use(
      (response) => onFulfilled(response, options),
      (error) => onRejected(error, options)
    );

  });

  service.interceptors.response.use((response) => {
    return response.data;
  })

}

/**
 * URL의 파라미터 구문 분석
 * @param url
 * @returns {Object}
 */
function parseUrlParams(url) {
  const params = {};
  if (!url || url === "" || typeof url !== "string") {
    return params;
  }
  const paramsStr = url.split("?")[1];
  if (!paramsStr) {
    return params;
  }
  const paramsArr = paramsStr.replace(/&|=/g, " ").split(" ");
  for (let i = 0; i < paramsArr.length / 2; i++) {
    const value = paramsArr[i * 2 + 1];
    params[paramsArr[i * 2]] =
      value === "true" ? true : value === "false" ? false : value;
  }
  return params;
}

export {
  service as axios,
  setAuthorization,
  removeAuthorization,
  checkAuthorization,
  loadInterceptors,
  parseUrlParams,
};
