import Cookie from 'js-cookie'

const xsrfCookieName = "Authorization";
import {logout} from '@/services/system'

// 401 가로채기
const resp401 = {
  /**
   * 데이터에 응답하기 전에 무언가를 하십시오
   * @param response 응답 객체
   * @param options 애플리케이션 구성에는 다음이 포함됩니다.: {router, i18n, store, message}
   * @returns {*}
   */
  onFulfilled(response, options) {
    const {message} = options
    if (response.code === 401) {
      message.error('권한이 없습니다')
    }
    return response
  },
  /**
   * 오류 시 실행
   * @param error 오류 개체
   * @param options 애플리케이션 구성에는 다음이 포함됩니다.: {router, i18n, store, message}
   * @returns {Promise<never>}
   */
  onRejected(error, options) {
    const {message} = options
    const {response} = error
    if (response.status === 401) {
      message.error('해당 권한이 없습니다')
    }
    return Promise.reject(error)
  }
}

const resp403 = {
  onFulfilled(response, options) {
    const {message} = options
    if (response.code === 403) {
      message.error('요청 거부')
    }
    return response
  },
  onRejected(error, options) {
    const {message} = options
    const {response} = error
    if (response.status === 403) {
      message.error('요청 거부')
    }
    return Promise.reject(error)
  }
}

const resp500 = {
  onFulfilled(response, options) {
    const {message} = options
    if (response.code === 500) {
      message.error('처리중 장애가 발생했습니다.\n'+response.data.message)
      console.log('res1111====',response)
    }
    return response
  },
  onRejected(error, options) {
    const {message} = options
    const {response} = error
    if (response.status === 500) {
      console.log('res22222====',response)
      if(response.data.code == 99998){
        message.error('중복된 값이 존재합니다.')
      }else{
        message.error('처리중 장애가 발생했습니다.\n'+response.data.message)
      }
      // console.log('errrrrrrrrrrrrrr=',response)
    }
    return Promise.reject(error)
  }
}

const reqCommon = {
  /**
   * 요청을 보내기 전에 해야 할 일
   * @param config axios config
   * @param options 애플리케이션 구성에는 다음이 포함됩니다.: {router, i18n, store, message}
   * @returns {*}
   */
  onFulfilled(config, options) {
    const {message} = options
    const {url} = config
    if(url.indexOf('/backed/std_info/') > -1){
      console.log('/backed/std_info/ 호출@@@@@@@@@@@@')
      //config.headers['Authorization'] = ''
    }else{
      if (url.indexOf('login') === -1 && !Cookie.get(xsrfCookieName)) {
        message.warning('인증 토큰이 만료되었습니다. 다시 로그인하십시오.',() => {
          logout().then(() => {
            window.location.reload();
          })
        })
      }else {
        config.headers['Authorization'] = Cookie.get(xsrfCookieName)
      }
    }

    return config
  },
  /**
   * 요청이 잘못되었을 때 해야 할 일
   * @param error 오류 개체
   * @param options 애플리케이션 구성에는 다음이 포함됩니다.: {router, i18n, store, message}
   * @returns {Promise<never>}
   */
  onRejected(error, options) {
    const {message} = options
    message.error(error.message)
    return Promise.reject(error)
  }
}

export default {
  request: [reqCommon], // 차단 요청
  response: [ resp401, resp403,resp500] // 응답 가로채기
}
