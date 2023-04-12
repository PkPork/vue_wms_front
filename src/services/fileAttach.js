import { axios, removeAuthorization } from "@/utils/request";

export async function getFileList(params) {
  console.log('getFileList===',params)
  return axios({
    url: "/common/getCmFileList",
    method: "post",
    params,
  });
}

export function saveFileInfo(params) {
  console.log('saveItem===', params)

  return axios.post("/front/file/saveFile", params)
  // return axios({
  //   url: "/backed/commoncode/saveCmCodeGrp",
  //   method: "post",
  //   params,
  // })
}
export function fileSave(formData) {
  return axios.post('/common/uploads', formData, {
    contentType: false, processData: false, headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
  })
}

export function deleteFile(params) {
  console.log('deleteFile===',params)
  return axios({
    url: "/common/deleteFile",
    method: "post",
    params,
  });
}

