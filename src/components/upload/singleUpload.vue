<template>
  <div>
    <el-upload
      action='https://backend-fullstack-learning.oss-cn-hangzhou.aliyuncs.com'
      :data='ossParams'
      list-type='picture'
      :multiple='false'
      :show-file-list='showFileList'
      :file-list='fileList'
      :before-upload='beforeUpload'
      :on-remove='handleRemove'
      :on-success='handleUploadSuccess'
      :on-preview='handlePreview'>
      <el-button size='small' type='primary'>点击上传</el-button>
      <div slot='tip' class='el-upload__tip'>只能上传jpg/png文件，且不超过10MB</div>
    </el-upload>
    <el-dialog :visible.sync='dialogVisible'>
      <img width='100%' :src='fileList[0].url' alt=''>
    </el-dialog>
  </div>
</template>
<script>
import { policy } from './policy'
import { getUUID } from '@/utils'

export default {
  name: 'singleUpload',
  props: {
    value: String
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
      dialogVisible: false
    }
  },
  computed: {
    imageUrl() {
      return this.value
    },
    imageName() {
      if (this.value !== null && this.value !== '') {
        return this.value.substring(this.value.lastIndexOf('/') + 1)
      } else {
        return null
      }
    },
    fileList() {
      return [{
        name: this.imageName,
        url: this.imageUrl
      }]
    },
    showFileList: {
      get: function() {
        return this.value !== null && this.value !== '' && this.value !== undefined
      },
      set: function(newValue) {
        // 虽然这里不需要实现任何逻辑，但set方法是必须的
      }
    }
  },
  methods: {
    emitInput(val) {
      this.$emit('input', val)
    },
    handleRemove(file, fileList) {
      this.emitInput('')
    },
    handlePreview(file) {
      this.dialogVisible = true
    },
    beforeUpload(file) {
      let _self = this
      return new Promise((resolve, reject) => {
        policy().then(response => {
          _self.ossParams.key = response.data.dir + '/' + getUUID() + `_\${filename}`
          _self.ossParams.OSSAccessKeyId = response.data.accessId
          _self.ossParams.policy = response.data.policy
          _self.ossParams.signature = response.data.signature
          _self.dir = response.data.dir
          _self.host = response.data.host
          _self.expire = response.data.expire
          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    },
    handleUploadSuccess(res, file) {
      this.showFileList = true
      this.fileList.pop()
      this.fileList.push({
        name: file.name,
        url: this.host + '/' + this.ossParams.key.replace(`\${filename}`, file.name)
      })
      this.emitInput(this.fileList[0].url)
    }
  }
}
</script>
<style>

</style>


