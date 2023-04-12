import delIcon from "@/assets/img/delete_icon.png"
import searchIcon from "@/assets/img/search.png"
import {axios} from "@/utils/request";

export default {
    install(Vue){

        //전역변수
        Vue.prototype.$gridDelayTime = 500  //GRID 호출시 DELAY TIME
        Vue.prototype.$delIcon       = delIcon
        Vue.prototype.$searchIcon    = searchIcon
        Vue.prototype.$CELL_INFO = {    //GRID 선택시 row 정보 저장
                 rowIndex: '',
                dataField: '',
        }

        Vue.prototype.$DEFAULT_GRID_PROP = {    //GRID 선택시 row 정보 저장
            noDataMessage:"조회된 데이터가 없습니다.",
            // 엑스트라 체크박스 표시 설정
            showRowCheckColumn: true,
            // 엑스트라 체크박스에 shiftKey + 클릭으로 다중 선택 할지 여부 (기본값 : false)
            enableRowCheckShiftKey: true,
            // 전체 체크박스 표시 설정
            showRowAllCheckBox: true,
            // 편집 가능 여부 (기본값 : false)
            editable: true,
            // 셀 선택모드 (기본값: singleCell)
            selectionMode: "multipleCells",
            //필터사용유무
            enableFilter: true,
        }

        /**
         * grid 객체와 url , params 를 넣으면 해당 그리드에 데이터를 바인딩 시켜준다.
         * 해당 함수는 추가,수정,삭제 된 row 정보를 모두 담아서 배열로 return 한다.
         * 행의 상태는 row_status 항목에 담겨져 있다.
         * @param grid vue grid 객체
         * @param url axios url
         * @param params 파라미터
         */
        Vue.prototype.$gridSearchData = function(grid,url,params){

            axios.post(url, params).then(response => {
                console.log(response)
            }).catch(error => {
                console.log(error.response)
            });
        }

        /**
         * axios post 호출용 전역 함수.
         * @param url axios url
         * @param params 파라미터
         * @returns {Promise<AxiosResponse<any>>}
         */
        Vue.prototype.$gridCallUrl = function(url,params){
            params.sessionUserId = this.$store.state.account.user.user_id
            params.sessionCtkey = this.$store.state.account.ctkey
            console.log('params.sessionUserId@@@',params.sessionUserId)
            console.log('params.sessionCtkey@@@',params.sessionCtkey)

            return axios.post(url, params)
        }

        /**
         * axios get 호출용 전역 함수.
         * @param url axios url
         * @param params 파라미터
         * @returns {Promise<AxiosResponse<any>>}
         */
        Vue.prototype.$callUrlGet = function(url,params){
            params.sessionUserId = this.$store.state.account.user.user_id
            params.sessionCtkey = this.$store.state.account.ctkey
            console.log('params.sessionUserId@@@',params.sessionUserId)
            console.log('params.sessionCtkey@@@',params.sessionCtkey)
            return axios.get(url, {
                params: params
            }, {})
        }

        /**
         * axios post 호출용 전역 함수.
         * @param url axios url
         * @param params 파라미터
         * @returns {Promise<AxiosResponse<any>>}
         */
        Vue.prototype.$callUrlPost = function(url,params){
            params.sessionUserId = this.$store.state.account.user.user_id
            params.sessionCtkey = this.$store.state.account.ctkey
            console.log('params.sessionUserId@@@',params.sessionUserId)
            console.log('params.sessionCtkey@@@',params.sessionCtkey)
            return axios.post(url, params)
        }


        /**
         * GRID 객체를 던져주면 필수입력 체크 후 array 형태로 반환해준다.
         * 이때 row_status 라는 컬럼을 추가하여 I(추가),U(수정),D(삭제) flag 를 넣어둔다.
         * @param grid vue grid 객체
         * @param requireArr dataField(컬럼)명 여러개 일수도 있어서 배열형태로 담아줌
         * @returns {*[]}
         */
        Vue.prototype.$gridGetCudData = function(grid,requireArr){
            console.log("grid==="+grid)
            const isValid = grid.validateChangedGridData(requireArr, "필수입력 입니다.");
            console.log("isValid==="+isValid)

            if (isValid) {
                console.log(' this.$store.state.account.user.user_id===', this.$store.state.account.user.user_id)
                // let items = grid.getCheckedRowItems();
                // console.log("items===", JSON.stringify(items))

                let addedRowItems = grid.getAddedRowItems(); // 추가된 행 아이템들(배열)
                let editedRowItems = grid.getEditedRowItems(); // 수정된 행 아이템들(배열) (수정되지 않은 칼럼들의 값도 가지고 있음)
                let removedRowItems = grid.getRemovedItems(); // 삭제된 행 아이템들(배열)

                // console.log("addedRowItems===", JSON.stringify(addedRowItems))
                // console.log("editedRowItems===", JSON.stringify(editedRowItems))
                // console.log("removedRowItems===", JSON.stringify(removedRowItems))

                let data = [];
                if (addedRowItems.length > 0) {
                    for (let i = 0; i < addedRowItems.length; i++) {
                        let addItem = addedRowItems[i]
                        Object.assign(addItem, {['row_status']: 'I'})   //행의 상태
                        Object.assign(addItem, {['sessionUserId']: this.$store.state.account.user.user_id}) //로그인 사용자 정보
                        Object.assign(addItem, {['sessionCtkey']: this.$store.state.account.ctkey}) //로그인 사용자의 센터코드
                        //console.log("editedItem==", editedItem)
                        data.push(addItem)
                    }
                    //data.add = addedRowItems;
                }
                if (editedRowItems.length > 0) {
                    for (let i = 0; i < editedRowItems.length; i++) {
                        let editedItem = editedRowItems[i]
                        Object.assign(editedItem, {['row_status']: 'U'})
                        Object.assign(editedItem, {['sessionUserId']: this.$store.state.account.user.user_id})
                        Object.assign(editedItem, {['sessionCtkey']: this.$store.state.account.ctkey})
                        //console.log("editedItem==", editedItem)
                        data.push(editedItem)
                    }
                    //data.update = editedRowItems;
                }
                if (removedRowItems.length > 0) {
                    for (let i = 0; i < removedRowItems.length; i++) {
                        let removeItem = removedRowItems[i]
                        Object.assign(removeItem, {['row_status']: 'D'})
                        Object.assign(removeItem, {['sessionUserId']: this.$store.state.account.user.user_id})
                        Object.assign(removeItem, {['sessionCtkey']: this.$store.state.account.ctkey})
                        //console.log("editedItem==", editedItem)
                        data.push(removeItem)
                    }
                    //data.remove = removedRowItems;
                }
                // if (data.add || data.update || data.remove) {
                if (data.length == 0) {
                    this.$message.warn('추가, 수정, 삭제된 행이 없습니다.', 3)
                    return []
                } else {
                    return data
                }

            }
        }

        /**
         * GRID 객체를 던져주면 필수입력 체크 후 array 형태로 반환해준다.
         * 이때 row_status 라는 컬럼을 추가하여 R(조회),I(추가),U(수정),D(삭제) flag 를 넣어둔다.
         * @param grid vue grid 객체
         * @param requireArr dataField(컬럼)명 여러개 일수도 있어서 배열형태로 담아줌
         * @returns {*[]}
         */
        Vue.prototype.$gridGetCrudData = function(grid,requireArr){
            const isValid = grid.validateChangedGridData(requireArr, "필수입력 입니다.");

            if (isValid) {
                console.log(' this.$store.state.account.user.user_id===', this.$store.state.account.user.user_id)
                // let items = grid.getCheckedRowItems();
                // console.log("items===", JSON.stringify(items))

                let addedRowItems = grid.getAddedRowItems(); // 추가된 행 아이템들(배열)
                let editedRowItems = grid.getEditedRowItems(); // 수정된 행 아이템들(배열) (수정되지 않은 칼럼들의 값도 가지고 있음)
                let removedRowItems = grid.getRemovedItems(); // 삭제된 행 아이템들(배열)

                // console.log("addedRowItems===", JSON.stringify(addedRowItems))
                // console.log("editedRowItems===", JSON.stringify(editedRowItems))
                // console.log("removedRowItems===", JSON.stringify(removedRowItems))

                let data = [];
                if (addedRowItems.length > 0) {
                    for (let i = 0; i < addedRowItems.length; i++) {
                        let addItem = addedRowItems[i]
                        Object.assign(addItem, {['row_status']: 'I'})
                        Object.assign(addItem, {['sessionUserId']: this.$store.state.account.user.user_id})
                        //console.log("editedItem==", editedItem)
                        data.push(addItem)
                    }
                    //data.add = addedRowItems;
                }
                if (editedRowItems.length > 0) {
                    for (let i = 0; i < editedRowItems.length; i++) {
                        let editedItem = editedRowItems[i]
                        Object.assign(editedItem, {['row_status']: 'U'})
                        Object.assign(editedItem, {['sessionUserId']: this.$store.state.account.user.user_id})
                        //console.log("editedItem==", editedItem)
                        data.push(editedItem)
                    }
                    //data.update = editedRowItems;
                }
                if (removedRowItems.length > 0) {
                    for (let i = 0; i < removedRowItems.length; i++) {
                        let removeItem = removedRowItems[i]
                        Object.assign(removeItem, {['row_status']: 'D'})
                        //console.log("editedItem==", editedItem)
                        data.push(removeItem)
                    }
                    //data.remove = removedRowItems;
                }
                // if (data.add || data.update || data.remove) {
                if (data.length == 0) {
                    this.$message.warn('추가, 수정, 삭제된 행이 없습니다.', 3)
                    return []
                } else {
                    return data
                }

            }
        }

        /**
         * 그리드에서 pk dataField는 수정을 방지하기 위한 함수
         * @param grid vue grid 객체
         * @param event event 객체
         * @param dataFields Edit를 방지할 dataField 컬럼명
         * @returns {boolean}
         */
        Vue.prototype.$gridEditable = function(grid,event,dataFields){
            if (dataFields.indexOf(event.dataField) > -1) {
                // rowIdField 설정 값 얻기
                const rowIdField = grid.getProp("rowIdField");
                // 추가된 행 아이템인지 조사하여 추가된 행인 경우만 에디팅 진입 허용
                if (event.isClipboard ||grid.isAddedById(event.item[rowIdField])) {
                    return true
                } else {
                    return false // false 반환하면 기본 행위 안함(즉, cellEditBegin 의 기본행위는 에디팅 진입임)
                }
            } else {
                return true // 다른 필드들은 편집 허용
            }
        }

        /**
         * 오늘날짜 전역함수 (YYYY-MM-DD)
         * @returns {string}
         */
        Vue.prototype.$TODAY= function() {
            let today = new Date();
            let month = today.getMonth() + 1;
            let day = today.getDate();

            month = month >= 10 ? month : '0' + month;
            day = day >= 10 ? day : '0' + day;
            return today.getFullYear() + '-' + month + '-' + day;
        }

        /**
         * 오늘에서 after(DAY)만큼 계산해서 리턴해주는 전역 함수
         * @param after
         * @returns {string}
         */
        Vue.prototype.$AFTER_DAY= function(after) {
            let today = new Date();
            var afterday = new Date(today.setDate(today.getDate() + after));	// 내일
            let month = afterday.getMonth() + 1;
            let day = afterday.getDate();

            month = month >= 10 ? month : '0' + month;
            day = day >= 10 ? day : '0' + day;
            return afterday.getFullYear() + '-' + month + '-' + day;
        }

        /**
         * 
         * @param checkList 체크할 기준정보 배열 예시:['MST_AC','MST_ZN','MST_LC','MST_IC','MST_CT']
         * @param dataList 데이터 리스트
         * @returns errList 기준정보가 없는 row_number 와 메시지를 담아서 반환한다.
         * 예시: [{row_number:5,message:'품목 정보가 없습니다'}]
         */
        Vue.prototype.$checkStandardInfo = async function(checkList,dataList){
            const params = {
                CHECK_LIST: checkList,
                DATA_LIST: dataList
            }
            let res = await axios.post('/backed/check/checkStandardInfo', params)
            return res.data

        }
    }
}