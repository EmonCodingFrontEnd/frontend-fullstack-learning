<template>
  <el-table
    :data='tableData'
    style='width: 100%'
    row-key='id'
    @expand-change='expandChange'>
    <el-table-column type='expand'>
      <template slot-scope='props'>
        <el-form label-position='left' inline class='demo-table-expand'>
          <el-form-item label='商品名称'>
            <span>{{ props.row.list.name }}</span>
          </el-form-item>
        </el-form>
      </template>
    </el-table-column>
    <el-table-column
      label='商品 ID'
      prop='id'>
    </el-table-column>
    <el-table-column
      label='商品名称'
      prop='name'>
    </el-table-column>
    <el-table-column
      label='描述'
      prop='desc'>
    </el-table-column>
  </el-table>
</template>

<style>
.demo-table-expand {
  font-size: 0;
}

.demo-table-expand label {
  width: 90px;
  color: #99a9bf;
}

.demo-table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 50%;
}
</style>

<script>
export default {
  data() {
    return {
      tableData: [{
        id: '12987122',
        name: '好滋好味鸡蛋仔',
        category: '江浙小吃、小吃零食',
        desc: '荷兰优质淡奶，奶香浓而不腻',
        address: '上海市普陀区真北路',
        shop: '王小虎夫妻店',
        shopId: '10333',
        list: [],
        children: []
      }, {
        id: '12987123',
        name: '好滋好味鸡蛋仔',
        category: '江浙小吃、小吃零食',
        desc: '荷兰优质淡奶，奶香浓而不腻',
        address: '上海市普陀区真北路',
        shop: '王小虎夫妻店',
        shopId: '10333',
        list: [],
        children: []
      }, {
        id: '12987125',
        name: '好滋好味鸡蛋仔',
        category: '江浙小吃、小吃零食',
        desc: '荷兰优质淡奶，奶香浓而不腻',
        address: '上海市普陀区真北路',
        shop: '王小虎夫妻店',
        shopId: '10333',
        list: [],
        children: []
      }, {
        id: '12987126',
        name: '好滋好味鸡蛋仔',
        category: '江浙小吃、小吃零食',
        desc: '荷兰优质淡奶，奶香浓而不腻',
        address: '上海市普陀区真北路',
        shop: '王小虎夫妻店',
        shopId: '10333',
        list: [],
        children: []
      }]
    }
  },
  methods: {
    expandChange(row, expandedRows) {
      console.log(row, expandedRows)
      // // 检测是否展开
      console.log(expandedRows.includes(row) ? '展开' : '收起')
      row.list = {
        name: row.name + row.id
      }
    }
  }
}
</script>
