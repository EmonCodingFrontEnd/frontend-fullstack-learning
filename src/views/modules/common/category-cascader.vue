<template>
  <!--
  使用说明：
  1）、引入category-cascader.vue
  2）、语法：<category-cascader :catelogPath.sync="catelogPath"></category-cascader>
      解释：
        catelogPath：指定的值是cascader初始化需要显示的值，应该和父组件的catelogPath绑定;
            由于有sync修饰符，所以cascader路径变化以后自动会修改父的catelogPath，这是结合子组件this.$emit("update:catelogPath",v);做的
        -->
  <div class='category-box'>
    <el-cascader
      filterable
      clearable
      placeholder='试试搜索：手机'
      v-model='paths'
      :options='categoryList'
      :props='setting'
      style='width: 100%'
    ></el-cascader>
  </div>
</template>

<script>
// 这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
// 例如：import 《组件名称》 from '《组件路径》';

export default {
  // import引入的组件需要注入到对象中才能使用
  components: {},
  // 接受父组件传来的值
  props: {
    categoryPath: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    // 这里存放数据
    return {
      paths: this.categoryPath,
      categoryList: [],
      setting: {
        value: 'catId',
        label: 'name',
        children: 'children'
      }
    }
  },
  watch: {
    // 对通过修改进来的方式有用
    categoryPath(v) {
      this.paths = v
    },
    paths(v) {
      // 属性分组页面使用的该方式
      this.$emit('update:categoryPath', v)
      // 还可以使用pubsub-js进行传值，商品发布页面使用的该方式
      this.PubSub.publish('catPath', v)
    }
  },
  // 方法集合
  methods: {
    getCategoryList() {
      this.$http({
        url: this.$http.adornGatewayUrl('/api/product/category/list/tree'),
        method: 'get'
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.categoryList = data.data
        }
      })
    }
  },
  // 生命周期 - 创建完成（可以访问当前this实例）
  created() {
    this.getCategoryList()
  }
}
</script>
<style>
/*如下方法是为了解决renre-fast-vue导致的样式问题*/
.el-cascader-panel .el-cascader-menu {
  width: 280px;
}

.el-cascader-panel .el-scrollbar {
  overflow: hidden;
  position: relative;
}

.el-cascader-panel .el-scrollbar__wrap {
  overflow-x: hidden;
}
</style>
<style scoped>
</style>
