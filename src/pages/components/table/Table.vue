<template>
  <div class="table">
    <advance-table
      :columns="columns"
      :data-source="dataSource"
      title="고급 양식 - 베타"
      :loading="loading"
      rowKey="id"
      @search="onSearch"
      @refresh="onRefresh"
      :format-conditions="true"
      @reset="onReset"
      :pagination="{
        current: page,
        pageSize: pageSize,
        total: total,
        showSizeChanger: true,
        showLessItems: true,
        showQuickJumper: true,
        showTotal: (total, range) => `제 ${range[0]}-${range[1]} 바, 총 ${total} 개`,
        onChange: onPageChange,
        onShowSizeChange: onSizeChange,
      }"
    >
      <template slot="statusTitle">
        상태<a-icon style="margin: 0 4px" type="info-circle" />
      </template>
      <template slot="send" slot-scope="{text}">
        {{text ? '예' : '아니요'}}
      </template>
      <template slot="status" slot-scope="{text}">
        {{text | statusStr}}
      </template>
    </advance-table>
    <api />
  </div>
</template>

<script>
  import AdvanceTable from '@/components/table/advance/AdvanceTable'
  import { goodsList } from '@/services/mock'
  import Api from '@/pages/components/table/Api'

  export default {
    name: 'Table',
    components: {Api, AdvanceTable},
    filters: {
      statusStr(val) {
        switch (val) {
          case 1: return '주문'
          case 2: return '배송대기'
          case 3: return '진행중'
          case 4: return '배송완료'
        }
      }
    },
    data() {
      return {
        loading: false,
        page: 1,
        pageSize: 10,
        total: 0,
        columns: [
          {
            title: '상품명',
            dataIndex: 'name',
            searchAble: true
          },
          {
            title: '주문 번호',
            dataIndex: 'orderId'
          },
          {
            searchAble: true,
            dataIndex: 'status',
            dataType: 'select',
            slots: {title: 'statusTitle'},
            scopedSlots: {customRender: 'status'},
            search: {
              selectOptions: [
                {title: '주문', value: 1},
                {title: '배송대기', value: 2},
                {title: '진행중', value: 3},
                {title: '마감', value: 4}
              ]
            }
          },
          {
            title: 'ㅅㅅ',
            searchAble: true,
            dataIndex: 'send',
            dataType: 'boolean',
            scopedSlots: {customRender: 'send'},
            search: {
              switchOptions: {
                checkedText: '열림',
                uncheckedText: '닫힘'
              }
            }
          },
          {
            title: '검토 시간',
            dataIndex: 'auditTime',
            dataType: 'time',
          }
        ],
        dataSource: [],
        conditions: {}
      }
    },
    created() {
      this.getGoodList()
    },
    methods: {
      getGoodList() {
        this.loading = true
        const {page, pageSize, conditions} = this
        goodsList({page, pageSize, ...conditions}).then(result => {
          const {rows, page, records, total} = result.data
          this.dataSource = rows
          this.page = page
          this.total = total
          this.pageSize = records
          this.loading = false
        })
      },
      onSearch(conditions, searchOptions) {
        this.page = 1
        this.conditions = conditions
        this.getGoodList()
      },
      onSizeChange(current, size) {
        this.page = 1
        this.pageSize = size
        this.getGoodList()
      },
      onRefresh(conditions) {
        this.conditions = conditions
        this.getGoodList()
      },
      onReset(conditions) {
        this.conditions = conditions
        this.getGoodList()
      },
      onPageChange(page, pageSize) {
        this.page = page
        this.pageSize = pageSize
        this.getGoodList()
      }
    }
  }
</script>

<style scoped lang="less">
.table{
  background-color: @base-bg-color;
  padding: 24px;
}
</style>