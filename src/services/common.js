//import {CODEGRPLIST, CODELIST, SAVECODEGRP, SAVECODECODE} from '@/services/api'
//import {request, METHOD, axios} from '@/utils/request'
import {axios} from '@/utils/request'


/**
 * 사용자조회
 * @returns {Promise<AxiosResponse<T>>}
 */
export async function getFileGrpSeq() {
  const param = {
    'test': '11111'
  }
  const response = await axios.post("/common/getFileGrpSeq", param, {})
  let   data     = response.data
  console.log('data ==',data)
  return data
}


/**
 * 향후에는 Store 에 저장하기 위해 로그인시 기준정보를 전부 가져올 계획임
 * 그러기 위해서 만들어둔 함수 23.01.04
 * @param params
 * @returns {AxiosPromise}
 */
export function getCmCodeListAllUseStore(params) {
  console.log('getCmCodeListAllUseStore===',params)
  return axios({
    url: "/backed/commoncode/getCmCodeListAllUseStore",
    method: "post",
    params,
  });
}


/**
 * @param group_cd 기준정보 group_cd
 * @param option "전체" or "선택" or null
 * @returns {Promise<any>}
 */
export async function getCmCodeLoad(group_cd,option) {
  console.log('getCmCodeList===',group_cd)
  const param = {
    group_cd: group_cd
  }
  const response = await axios.post("/backed/commoncode/getCmCodeLoad", param, {})
  let   data     = response.data
  if(option != null && option != ""){
    let firstRow = new Object()
    firstRow.group_cd = group_cd
    firstRow.code     = ''
    firstRow.code_nm = option
    firstRow.code_nm_en = option
    firstRow.data1 = ''
    firstRow.data2 = ''
    firstRow.data3 = ''
    firstRow.data4 = ''
    firstRow.data5 = ''
    firstRow.data6 = ''
    firstRow.data7 = ''
    firstRow.data8 = ''
    firstRow.data9 = ''
    firstRow.data10 = ''
    firstRow.rem = ''

    data.unshift(firstRow)
  }
  console.log('data ==',data)
  return data
}

/**
 * @param group_cd 기준정보 group_cd를 배열형태로 반환.
 * @param option "전체" or "선택" or null
 * @returns {Promise<any>}
 */
export async function getCmCodeLoadArray(array,option) {
  console.log('getCmCodeList===',array)
  const param = {
    groupCdArr: array
  }
  const response = await axios.post("/backed/commoncode/getCmCodeLoadArray", param, {})
  let   data     = response.data
  Object.keys(data).forEach(function(k){

    if(option != null && option != ""){
      let firstRow = new Object()
      firstRow.group_cd = k
      firstRow.code     = ''
      firstRow.code_nm = option
      firstRow.code_nm_en = option
      firstRow.data1 = ''
      firstRow.data2 = ''
      firstRow.data3 = ''
      firstRow.data4 = ''
      firstRow.data5 = ''
      firstRow.data6 = ''
      firstRow.data7 = ''
      firstRow.data8 = ''
      firstRow.data9 = ''
      firstRow.data10 = ''
      firstRow.rem = ''

      data[k].unshift(firstRow)
    }
  });
  console.log('data=====',data)
  return data
}

//
//
/**
 * 사업장 정보 가져오기
 * @param option "전체" or "선택" or null
 * @returns {Promise<any>}
 */
export async function getPlantComboList(option) {
  const param = {
    plant_cd: ''
  }
  const response = await axios.post("/backed/plant/getPlantComboList", param, {})
  let   data     = response.data
  if(option != null && option != ""){
    let firstRow = new Object()
    firstRow.plant_cd     = ''
    firstRow.plant_nm = option
    firstRow.addr = ''
    firstRow.use_yn = 'Y'
    firstRow.remark = ''
    data.unshift(firstRow)
  }
  console.log('data ==',data)
  return data
}

/**
 * 센터 리스트 가져오기
 * @param option "전체" or "선택" or null
 * @returns {Promise<any>}
 */
export async function getCtComboList(option) {
  const param = {
    ctkey: ''
  }
  const response = await axios.get("/backed/std_info/getMstCtList", param, {})
  let   data     = response.data
  console.log('ctkeyList ===',data)
  if(option != null && option != ""){
    let firstRow = new Object()
    firstRow.CTKEY     = ''
    firstRow.CTNAME = option
    firstRow.DELYN = 'N'
    data.unshift(firstRow)
  }
  console.log('data ==',data)
  return data
}

/**
 * 로그인 사용자의 권한이 있는 센터정보 가져오기
 * @param user_id "전체" or "선택" or null
 * @returns {Promise<any>}
 */
export async function getLoginUserCtkey(user_id) {
  console.log('로그인 센터정보를 가져오이이이이이이이이@@@@@@@')
  const response = await axios.get("/backed/std_info/getLoginUserCtkey", {
    params: {
      sessionUserId: user_id
    }
  }, {})
  let   data     = response.data
  console.log('data ==',data)
  return data
}

/**
 * 로그인 사용자의 센터권한이 존재하는지 확인
 * @param option "전체" or "선택" or null
 * @returns {Promise<any>}
 */
export async function hasVerifyCtkey(user_id,ctkey) {
  const param = {
    user_id: user_id,
    ctkey:ctkey
  }
  console.log('param33333====',param)
  const response = await axios.get("/backed/std_info/hasVerifyCtkey", {
    params: {
      user_id: user_id,
      ctkey:ctkey
    }
    }, {})
  return response.data
}





