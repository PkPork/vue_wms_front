import { axios } from "@/utils/request";

// 게시판 조회
export function getBoardList(params) {
    console.log('getBoardList===',params)
    return axios({
        url: "/front/board/getBoardList",
        method: "post",
        params,
    });
}

// 게시판 CRUD
export function saveBoard(params) {
    console.log('saveItem===', params)
    return axios({
        url: "/front/board/saveBoard",
        method: "post",
        params,
    });
}

// 게시판 댓글 조회
export function getBoardComtList(params) {
    console.log('getBoardComtList===',params)
    return axios({
        url: "/front/board/getBoardComtList",
        method: "post",
        params,
    });
}

// 게시판 댓글 CRUD
export function saveBoardComtList(params) {
    console.log('saveBoardComtList===', params)
    return axios({
        url: "/front/board/saveBoardComtList",
        method: "post",
        params,
    });
}

// 공지대상 게시판 조회
export async function getNoticeBoardList(params) {
    console.log('getNoticeBoardList===',params)
    return axios({
        url: "/front/board/getNoticeBoardList",
        method: "post",
        params,
    });
}