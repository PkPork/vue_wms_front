<template>
  <a-card class="result-success" :bordered="false">
    <result :is-success="true" :description="description" :title="title">
      <template slot="action">
        <a-button class="action" type="primary">목록으로</a-button>
        <a-button class="action" @click="print">인쇄</a-button>
      </template>
      <div>
        <div class="project-name">프로젝트명</div>
        <detail-list size="small" style="max-width: 800px; margin-bottom: 8px">
          <detail-list-item term="프로젝트 ID">20180724089</detail-list-item>
          <detail-list-item term="담당자">쿠 릴리</detail-list-item>
          <detail-list-item term="유효기간">016-12-12 ~ 2017-12-12</detail-list-item>
        </detail-list>
        <a-steps :current="1" progressDot>
          <a-step title="프로젝트 생성">
            <a-step-item-group slot="description">
              <a-step-item title="쿠 릴리" icon="dingding-o"/>
              <a-step-item title="2016-12-12 12:32"/>
            </a-step-item-group>
          </a-step>
          <a-step title="부서 예비 검토">
            <a-step-item-group slot="description">
              <a-step-item title="홍길동" icon="dingding-o" :iconStyle="{color: '#00A0E9'}"/>
              <a-step-item title="첨언" :titleStyle="{color: '#00A0E9'}"/>
            </a-step-item-group>
          </a-step>
          <a-step title="재무 검토"></a-step>
          <a-step title="마감" ></a-step>
        </a-steps>
      </div>
    </result>
  </a-card>
</template>

<script>
import Result from '../../components/result/Result'
import DetailList from '../../components/tool/DetailList'
import AStepItem from '../../components/tool/AStepItem'

const AStepItemGroup = AStepItem.Group
const DetailListItem = DetailList.Item
export default {
  name: 'Success',
  components: {AStepItemGroup, AStepItem, DetailListItem, DetailList, Result},
  data () {
    return {
      title: '성공적으로 제출됨',
      description: '제출 결과 페이지는 일련의 작업 작업의 처리 결과를 피드백하는 데 사용됩니다.，\n' +
      ' 단순한 작업이라면 메시지 전역 프롬프트 피드백을 사용하세요.\n' +
      ' 이 텍스트 영역은 유사한 디스플레이가 있는 경우 간단한 추가 지침을 표시할 수 있습니다.\n' +
      ' "문서" 요구 사항의 경우 아래 회색 영역이 더 복잡한 내용을 나타낼 수 있습니다.。'
    }
  },
  methods: {
    print () {
      window.print()
    }
  }
}
</script>

<style scoped lang="less">
.result-success{
  .action:not(:first-child){
    margin-left: 8px;
  }
  .project-name{
    font-size: 16px;
    color: @title-color;
    font-weight: 500;
    margin-bottom: 20px;
  }
}
</style>
