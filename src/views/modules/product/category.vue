<template>
  <div>
    <el-switch v-model='draggable' active-text='开启拖拽' inactive-text='关闭拖拽'></el-switch>
    <el-button v-if='draggable' type='primary' @click='batchSave'>批量保存</el-button>
    <el-button type='danger' @click='batchDelete'>批量删除</el-button>
    <el-tree
      ref='menuTree'
      :data='menus'
      :props='defaultProps'
      :draggable='draggable'
      show-checkbox
      node-key='catId'
      :default-expanded-keys='expandedKey'
      @node-click='handleNodeClick'
      :expand-on-click-node='false'
      :allow-drop='checkAllowDrop'
      @node-drag-end='handleDragEnd'
      @node-drop='handleDrop'
    >
      <span class='custom-tree-node' slot-scope='{ node, data }'>
        <span>{{ node.label }}</span>
        <span>
          <el-button
            v-if='node.level <= 2'
            type='text'
            size='mini'
            @click='() => toAppend(node, data)'
          >
            添加子菜单
          </el-button>
          <el-button
            type='text'
            size='mini'
            @click='toUpdate(node, data)'
          >
            编辑
          </el-button>
          <el-button
            v-if='node.childNodes.length === 0'
            type='text'
            size='mini'
            @click='() => doDelete(node, data)'
          >
            删除
          </el-button>
        </span>
      </span>
    </el-tree>
    <el-dialog :title='dialogFormTitle' :visible.sync='dialogFormVisible' width='500px' :close-on-click-modal='false'>
      <el-form ref='categoryForm' :model='categoryForm' :rules='categoryFormRule' label-width='100px'>
        <el-form-item label='分类名称：' prop='name'>
          <el-input v-model='categoryForm.name' autocomplete='off'></el-input>
        </el-form-item>
        <el-form-item label='图表：'>
          <el-input v-model='categoryForm.icon' autocomplete='off'></el-input>
        </el-form-item>
        <el-form-item label='计量单位：'>
          <el-input v-model='categoryForm.productUnit' autocomplete='off'></el-input>
        </el-form-item>
      </el-form>
      <div slot='footer' class='dialog-footer'>
        <el-button @click='dialogFormVisible = false'>取 消</el-button>
        <el-button type='primary' @click='addOrUpdateCategory'>确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import pick from 'lodash/pick'

export default {
  name: 'Category',
  data() {
    return {
      menus: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      draggable: false,
      expandedKey: [], // 默认展开节点
      maxNodeLevel: 0, // 拖拽时用于计算最大层数，临时保存，每次拖拽结束（无论是否成功）清空
      dragUpdateMenus: [], // 拖拽后需要更新的元素，临时保存，提交成功后清空
      tmpExpandedKey: [], // 新增/修改/拖拽后需要展开的元素，临时保存，提交成功后清空
      dialogFormVisible: false,
      dialogFormTitle: '', // 弹窗标题
      categoryForm: {
        catId: undefined,
        name: '',
        parentCid: 0,
        catLevel: 0,
        showStatus: 1,
        sort: 0,
        icon: '',
        productUnit: ''
      },
      categoryFormRule: {
        name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 2, message: '请输入2个字符以上', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    getMenus() {
      this.$http({
        url: this.$http.adornGatewayUrl('/api/product/category/list/tree'),
        method: 'get'
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.menus = data.data
        }
      })
    },
    // 递归计算节点的最大层数
    countNodeLevel(draggingNode) {
      this.maxNodeLevel = Math.max(this.maxNodeLevel, draggingNode.level)
      if (draggingNode.childNodes && draggingNode.childNodes.length > 0) {
        draggingNode.childNodes.forEach(item => {
          if (item.level > this.maxNodeLevel) {
            this.maxNodeLevel = item.level
          }
          this.countNodeLevel(item)
        })
      }
    },
    /*
    拖拽时判断是否允许拖拽到某个节点
    注意：每次拖放后，node上的属性，除却data属性外，其他属性都是随着变化的！！！
     */
    checkAllowDrop(draggingNode, dropNode, dropType) {
      // console.log('tree check drop: ', draggingNode.label + '--level--' + draggingNode.level + '--data-level--' + draggingNode.data.catLevel, dropNode.label + '--level--' + dropNode.level, dropType)
      // 被拖动的当前节点以及所在的父节点总层数不能大于3
      this.countNodeLevel(draggingNode)
      // 当前正在拖动的节点+父节点所在的深度不大于3即可
      const draggingLevel = (this.maxNodeLevel - draggingNode.level) + 1
      let targetLevel = 0
      switch (dropType) {
        case 'prev':
          targetLevel = draggingLevel + dropNode.parent.level
          break
        case 'next':
          targetLevel = draggingLevel + dropNode.parent.level
          break
        case 'inner':
          targetLevel = draggingLevel + dropNode.level
          break
      }
      return targetLevel <= 3
    },
    // 拖拽结束，可能拖拽失败或成功
    handleDragEnd(draggingNode, dropNode, dropType, ev) {
      // 拖拽结束后重置一下，避免影响下一次的拖拽！！！
      this.maxNodeLevel = 0
    },
    // 计算并存储子节点的层级
    calcChildNodeLevel(node) {
      if (node.childNodes && node.childNodes.length > 0) {
        node.childNodes.forEach((subNode, index) => {
          this.dragUpdateMenus.push({
            catId: subNode.data.catId,
            sort: index,
            parentCid: subNode.parent.data.catId,
            catLevel: subNode.level
          })
          this.calcChildNodeLevel(subNode)
        })
      }
    },
    // 拖拽后处理被拖拽节点及其子节点的层级、排序、父节点
    handleDrop(draggingNode, dropNode, dropType, ev) {
      // console.log('tree drop: ', draggingNode.label + '--level--' + draggingNode.level + '--data-level--' + draggingNode.data.catLevel, dropNode.label + '--level--' + dropNode.level, dropType)
      // 1、当前节点最新的父节点id
      const parentCid = dropType === 'inner' ? dropNode.data.catId : dropNode.parent.data.catId
      // 2、当前拖拽节点的最新顺序和层级
      const siblings = dropType === 'inner' ? dropNode.childNodes : dropNode.parent.childNodes
      siblings.forEach((node, index) => {
        // 3、若是自身节点，当前拖拽节点的最新层级
        if (node.data.catId === draggingNode.data.catId) {
          // 如果拖动前后层级发生变化，则需要计算子节点的层级
          if (node.level !== draggingNode.level) {
            this.calcChildNodeLevel(node)
          }
          this.dragUpdateMenus.push({ catId: node.data.catId, sort: index, parentCid, catLevel: node.level })
        } else { // 若不是自身节点
          this.dragUpdateMenus.push({
            catId: node.data.catId,
            sort: index,
            parentCid: node.parent.data.catId,
            catLevel: node.level
          })
        }
      })

      // 4、展开当前拖拽节点的最新父节点id
      this.tmpExpandedKey.push(parentCid)
    },
    batchSave() {
      // 入库
      this.$http({
        url: this.$http.adornGatewayUrl('/api/product/category/update/sort'),
        method: 'post',
        data: this.$http.adornData(this.dragUpdateMenus, false)
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.$message.success('菜单顺序调整成功！')
          this.expandedKey = [...this.tmpExpandedKey]
          this.getMenus()

          // 拖拽成功后重置一下，避免影响下一次的拖拽！！！
          this.dragUpdateMenus = []
          this.tmpExpandedKey = []
        }
      })
    },
    handleNodeClick(data, node) {
      console.log(node, data)
    },
    // 跳转到添加分类
    toAppend(node, data) {
      this.dialogFormVisible = true
      this.dialogFormTitle = '添加分类'

      Object.assign(this.categoryForm, this.$options.data().categoryForm)
      this.categoryForm.parentCid = data.catId
      this.categoryForm.catLevel = +node.level + 1
      this.$refs.categoryForm && this.$refs.categoryForm.clearValidate()
      this.tmpExpandedKey.push(node.data.catId)
    },
    // 跳转到编辑分类
    toUpdate(node, data) {
      this.dialogFormVisible = true
      this.dialogFormTitle = '修改分类'

      // 发送请求获取当前节点最新的数据
      this.$http({
        url: this.$http.adornGatewayUrl(`/api/product/category/info/${data.catId}`),
        method: 'get'
      }).then(({ data }) => {
        if (data && data.code === 0) {
          Object.assign(this.categoryForm, pick(data.data, ...Object.keys(this.$options.data().categoryForm)))
          this.$refs.categoryForm.clearValidate()
          this.tmpExpandedKey.push(node.data.catId)
        }
      })
    },
    // 执行新增/更新分类信息
    addOrUpdateCategory() {
      this.$refs.categoryForm.validate((valid) => {
        if (!valid) {
          this.$message.error('请填写正确的信息！')
          return false
        }

        let url = this.$http.adornGatewayUrl('/api/product/category/save')
        if (this.categoryForm.catId) {
          url = this.$http.adornGatewayUrl('/api/product/category/update')
        }

        this.$http({
          url: url,
          method: 'post',
          data: this.$http.adornData(this.categoryForm, false)
        }).then(({ data }) => {
          if (data && data.code === 0) {
            this.$message.success(`${this.categoryForm.catId ? '修改' : '添加'}成功！`)
            this.dialogFormVisible = false
            this.expandedKey = [...this.tmpExpandedKey]
            this.tmpExpandedKey = []
            this.getMenus()
          } else {
            this.$message.error(data.msg)
          }
        })
      })
    },
    // 执行删除分类信息
    doDelete(node, data) {
      this.tmpExpandedKey.push(node.data.catId)
      this.$confirm(`是否删除【${data.name}】菜单?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          const ids = [data.catId]
          this.$http({
            url: this.$http.adornGatewayUrl('/api/product/category/delete'),
            method: 'post',
            data: this.$http.adornData(ids, false)
          }).then(({ data }) => {
            if (data && data.code === 0) {
              this.$message.success('删除成功！')
              this.expandedKey = [...this.tmpExpandedKey]
              this.tmpExpandedKey = []
              this.getMenus()
            } else {
              this.$message.error(data.msg)
            }
          })
        })
        .catch(() => {
        })
    },
    // 执行批量删除
    batchDelete() {
      const checkedKeys = this.$refs.menuTree.getCheckedKeys()
      if (!checkedKeys.length) {
        this.$message.error('请选择需要删除的菜单！')
        return
      }

      this.$confirm(`是否批量删除菜单！`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$http({
            url: this.$http.adornGatewayUrl('/api/product/category/delete'),
            method: 'post',
            data: this.$http.adornData(checkedKeys, false)
          }).then(({ data }) => {
            if (data && data.code === 0) {
              this.$message.success('批量删除成功！')
              this.getMenus()
            } else {
              this.$message.error(data.msg)
            }
          })
        })
        .catch(() => {
        })
    }
  },
  activated() {
    this.getMenus()
  }
}
</script>

<style lang='scss' scoped>
// .custom-tree-node {
//   flex: 1;
//   display: flex;
//   align-items: center;
//   justify-content: space-between;
//   font-size: 14px;
//   padding-right: 8px;
// }
</style>
