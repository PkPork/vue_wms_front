<template>
  <a-card :body-style="{padding: '24px 32px'}" :bordered="false" >
    <a-form :form="form" id="PopItemfrm" layout="horizontal" >
      <div>
        <a-row >
          <a-col :md="12" :sm="24" >
            <a-form-item
                label="품번"
                :labelCol="{span: 5}"
                :wrapperCol="{span: 18, offset: 1}"
            >
              <a-input name="item_cd"
                       v-model="popinit.item_cd"
                       :readonly="!popinit.isNew"
                       v-decorator="['item_cd', {initialValue: popinit.item_cd,rules: [{ required: true, message: '품번을 입력하세요.'}]}]"
              />


            </a-form-item>
          </a-col>

          <a-col :md="12" :sm="24" >
            <a-form-item
                label="품명"
                :labelCol="{span: 5}"
                :wrapperCol="{span: 18, offset: 1}"
            >
              <a-input name="item_nm"
                       v-model="popinit.item_nm"
                       v-decorator="['item_nm', {initialValue: popinit.item_nm,rules: [{ required: true, message: '품명을 입력하세요.'}]}]"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row >
          <a-col :md="12" :sm="24" >
            <a-form-item
                label="규격"
                :labelCol="{span: 5}"
                :wrapperCol="{span: 18, offset: 1}"
            >

              <a-input name="spec"
                       v-model="popinit.spec"
              />
            </a-form-item>
          </a-col>

          <a-col :md="12" :sm="24" >
            <a-form-item
                label="단위"
                :labelCol="{span: 5}"
                :wrapperCol="{span: 18, offset: 1}"
            >

              <a-select v-model="popinit.unit" name="unit" placeholder="선택하세요.">
                <a-select-option :key="item.code" :value="item.code" v-for="(item, index) in unitList">{{item.code_nm}}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row >
          <a-col :md="12" :sm="24" >
            <a-form-item
                label="구분1"
                :labelCol="{span: 5}"
                :wrapperCol="{span: 18, offset: 1}"
            >
              <a-select v-model="popinit.class1" name="class1" placeholder="선택하세요.">
                <a-select-option :key="item.code" :value="item.code" v-for="(item, index) in class1List">{{item.code_nm}}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :md="12" :sm="24" >
            <a-form-item
                label="구분2"
                :labelCol="{span: 5}"
                :wrapperCol="{span: 18, offset: 1}"
            >
              <a-select v-model="popinit.class2" name="class2" placeholder="선택하세요.">
                <a-select-option :key="item.code" :value="item.code" v-for="(item, index) in class2List">{{item.code_nm}}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row >
          <a-col :md="12" :sm="24" >
            <a-form-item
                label="구분3"
                :labelCol="{span: 5}"
                :wrapperCol="{span: 18, offset: 1}"
            >
              <a-select v-model="popinit.class3" name="class3" placeholder="선택하세요.">
                <a-select-option :key="item.code" :value="item.code" v-for="(item, index) in class3List">{{item.code_nm}}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>


          <a-col :md="12" :sm="24" >
            <a-form-item
                label="적정재고"
                :labelCol="{span: 5}"
                :wrapperCol="{span: 18, offset: 1}"
            >
              <a-input name="appro_inv"
                       type="number"
                       v-model="popinit.appro_inv"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row >
          <a-col :md="12" :sm="24" >
            <a-form-item
                label="팔렛트당수량"
                :labelCol="{span: 5}"
                :wrapperCol="{span: 18, offset: 1}"
            >
              <a-input name="pltqty"
                       type="number"
                       v-model="popinit.pltqty"
              />
            </a-form-item>
          </a-col>

          <a-col :md="12" :sm="24" >
            <a-form-item
                label="박스당수량"
                :labelCol="{span: 5}"
                :wrapperCol="{span: 18, offset: 1}"
            >
              <a-input name="boxqty"
                       type="number"
                       v-model="popinit.boxqty"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row >
          <a-col :md="12" :sm="24" >
            <a-form-item
                label="입고가"
                :labelCol="{span: 5}"
                :wrapperCol="{span: 18, offset: 1}"
            >

              <a-input name="in_price1"
                       type="number"
                       v-model="popinit.in_price1"
              />
            </a-form-item>
          </a-col>

          <a-col :md="12" :sm="24" >
            <a-form-item
                label="출고가"
                :labelCol="{span: 5}"
                :wrapperCol="{span: 18, offset: 1}"
            >

              <a-input name="out_price1"
                       type="number"
                       v-model="popinit.out_price1"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row >
          <a-col :md="12" :sm="24" >
            <a-form-item
                label="LOT관리여부"
                :labelCol="{span: 5}"
                :wrapperCol="{span: 18, offset: 1}"
            >
              <a-select v-model="popinit.lot_yn" name="lot_yn" placeholder="선택하세요.">
                <a-select-option :key="item.code" :value="item.code" v-for="(item, index) in manageYnList">{{item.code_nm}}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :md="12" :sm="24" >
            <a-form-item
                label="선입선출여부"
               :labelCol="{span: 5}"
                :wrapperCol="{span: 18, offset: 1}"
            >
              <a-select v-model="popinit.fifo_yn" name="fifo_yn" placeholder="선택하세요.">
                <a-select-option :key="item.code" :value="item.code" v-for="(item, index) in manageYnList">{{item.code_nm}}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row >
          <a-col :md="12" :sm="24" >
            <a-form-item
                label="입고창고"
                :labelCol="{span: 5}"
                :wrapperCol="{span: 18, offset: 1}"
            >
              <a-input name="in_wh_cd"
                       v-model="popinit.in_wh_cd"
              />
            </a-form-item>
          </a-col>

          <a-col :md="12" :sm="24" >
            <a-form-item
                label="입고로케이션"
                :labelCol="{span: 5}"
                :wrapperCol="{span: 18, offset: 1}"
            >
              <a-input name="in_lc_cd"
                       v-model="popinit.in_lc_cd"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row >
          <a-col :md="12" :sm="24" >
            <a-form-item
                label="사용여부"
                :labelCol="{span: 5}"
                :wrapperCol="{span: 18, offset: 1}"
            >
              <a-select v-model="popinit.use_yn" name="use_yn" placeholder="선택하세요.">
                <a-select-option :key="item.code" :value="item.code" v-for="(item, index) in useYnList">{{item.code_nm}}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row >
          <a-col :md="12" :sm="24" >
            <a-form-item
                label="비고사항"
                :labelCol="{span: 5}"
                :wrapperCol="{span: 18, offset: 1}"
            >
              <a-textarea name="remark"
                          v-model="popinit.remark"
              />
            </a-form-item>
          </a-col>


        </a-row>

      </div>
      <a-row>
        <a-col :md="24" :sm="24" >
          <a-form-item style="margin-top: 24px" :wrapperCol="{span: 10, offset: 7}">
            <a-button type="primary" style="margin-left: 8px" @click="saveItem" > <a-icon type="save" />저장</a-button>
            <a-popconfirm
                title="삭제하시겠습니까?"
                ok-text="예"
                cancel-text="아니요"
                @confirm="deleteItem"
            >
              <a-icon slot="icon" type="question-circle-o" style="color: red" />
              <a href="#" class="primary">
                    <a-button type="primary" style="margin-left: 8px" v-show="!popinit.isNew" >
                      <a-icon type="delete" />삭제
                    </a-button>
              </a>

            </a-popconfirm>

            <a-button type="primary" style="margin-left: 8px" @click="close" > <a-icon type="close" />닫기</a-button>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </a-card>

</template>

<script>
import {saveItem} from "@/services/item";
import {getCmCodeLoad} from "@/services/common";

const unitList = [] //단위
const class1List = [] // 구분1
const class2List = [] // 구분2
const class3List = [] // 구분3
const manageYnList = [] //관리여부
const useYnList = []

export default {

  data () {
    return {

      unitList,
      class1List,
      class2List,
      class3List,
      manageYnList,
      useYnList,

      plant_cd : '',
      owner_cd : '',
      item_cd : '',
      item_nm : '',
      spec : '',
      unit : '',
      class1 : '',
      class2 : '',
      class3 : '',
      boxqty : '',
      pltqty : '',
      in_price1 : '',
      out_price1 : '',
      lot_yn : '',
      fifo_yn : '',
      appro_inv : '',
      in_wh_cd : '',
      in_lc_cd : '',
      remark : '',
      use_yn : '',
      reg_id : '',
      reg_dt : '',
      mod_id : '',
      mod_dt : '',
      form: this.$form.createForm(this)
    }
  },
  props : {
    popinit : {
      plant_cd : '',
      owner_cd : '',
      item_cd : '',
      item_nm : '',
      spec : '',
      unit : '',
      class1 : '',
      class2 : '',
      class3 : '',
      boxqty : '',
      pltqty : '',
      in_price1 : '',
      out_price1 : '',
      lot_yn : '',
      fifo_yn : '',
      appro_inv : '',
      in_wh_cd : '',
      in_lc_cd : '',
      remark : '',
      use_yn : '',
      isNew : null,

    }
  },
  created() {

    if(this.popinit.item_cd == ''){
      console.log('null임')
    }
    else
    {
      console.log('null 아님', this.popinit.item_cd)
    }
  },
  async mounted() {
    this.unitList = await getCmCodeLoad('UNIT', '전체')
    this.class1List = await getCmCodeLoad('CLASS1', '선택')
    this.class2List = await getCmCodeLoad('CLASS2', '선택')
    this.class3List = await getCmCodeLoad('CLASS3', '선택')
    this.manageYnList = await getCmCodeLoad('MANAGEYN', '선택')
    this.useYnList = await getCmCodeLoad('USEYN', '선택')
  },
  computed: {

  },
  watch :{

  },
  methods : {
    close(){
      this.$emit("closepop", '')
    },
    saveItem(){
      console.log('saveItem')
      this.form.validateFields((err) => {

        if(!err) {

          let insUserid = this.$store.state.account.user.user_id;

          this.popinit.reg_id = insUserid;
          this.popinit.mod_id = insUserid;

          if(this.popinit.isNew)
          {
            this.popinit.row_status = "I";
          }else
          {
            this.popinit.row_status = "U";
          }

          console.log('popinit.item_cd ==', this.popinit.item_cd);

          let data = [];
          data.push(this.popinit);
          console.log("popinit===", this.popinit);
          saveItem(data).then(this.aftersaveuser)
        }

      })

    },
    aftersaveuser(res) {

      if (res.code == '200') {

        this.$message.success('저장완료되었습니다.', 3)
        this.$emit("closepop", '')

      }
    },
    deleteItem(){

      //console.log('saveItem')
      let insUserid = this.$store.state.account.user.user_id;

      this.popinit.mod_id = insUserid;

      this.popinit.row_status = "D";
      let data = [];
      data.push(this.popinit);
      //console.log("popinit===", this.popinit);
      saveItem(data).then(this.aftersaveuser)

    },
  }

}
</script>

<style scoped>

</style>
