<template>
  <div>
    <el-upload
      action='https://backend-fullstack-learning.oss-cn-hangzhou.aliyuncs.com'
      :data='ossParams'
      list-type='picture-card'
      :multiple='true'
      :file-list='fileList'
      :before-upload='beforeUpload'
      :on-remove='handleRemove'
      :on-success='handleUploadSuccess'
      :on-preview='handlePreview'
      :limit='maxCount'
      :on-exceed='handleExceed'
    >
      <i class='el-icon-plus'></i>
    </el-upload>
    <el-dialog :visible.sync='dialogVisible'>
      <img width='100%' :src='dialogImageUrl' alt />
    </el-dialog>
  </div>
</template>
<script>
import { policy } from './policy'
import { getUUID } from '@/utils'

export default {
  name: 'multiUpload',
  props: {
    // 图片属性数组
    value: Array,
    // 最大上传图片数量
    maxCount: {
      type: Number,
      default: 30
    }
  },
  data() {
    return {
      ossParams: {
        key: '',
        policy: '',
        OSSAccessKeyId: '',
        signature: '',
        // 设置服务端返回状态码为200，不设置则默认返回状态码204。
        'success_action_status': '200'
      },
      dir: '',
      host: '',
      expire: '',
      dialogVisible: false,
      dialogImageUrl: null,
      fileList: []
    }
  },
  mounted() {
    this.fileList = this.value.map(item => {
      return { url: item }
    })
  },
  methods: {
    emitInput(fileList) {
      let value = []
      for (let i = 0; i < fileList.length; i++) {
        value.push(fileList[i].url)
      }
      this.$emit('input', value)
    },
    // fileList ： 删除后剩余的数量
    handleRemove(file, fileList) {
      this.emitInput(fileList)
    },
    handlePreview(file) {
      this.dialogVisible = true
      this.dialogImageUrl = file.url
    },
    beforeUpload(file) {
      let _self = this
      return new Promise((resolve, reject) => {
        policy()
          .then(response => {
            _self.ossParams.key = response.data.dir + '/' + getUUID() + `_\${filename}`
            _self.ossParams.OSSAccessKeyId = response.data.accessId
            _self.ossParams.policy = response.data.policy
            _self.ossParams.signature = response.data.signature
            _self.dir = response.data.dir
            _self.host = response.data.host
            _self.expire = response.data.expire

            // 这里的file，在上传成功后是file.raw
            file.url = _self.host + '/' + _self.ossParams.key.replace(`\${filename}`, file.name)
            resolve(true)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    handleUploadSuccess(res, file, fileList) {
      const fileUrlList = fileList.map(item => {
        return item.raw ? { name: item.name, url: item.raw.url } : item
      })
      this.emitInput(fileUrlList)
    },
    handleExceed(files, fileList) {
      this.$message({
        message: '最多只能上传' + this.maxCount + '张图片',
        type: 'warning',
        duration: 1000
      })
    }
  }
}
</script>
<style>
</style>


