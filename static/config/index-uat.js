/**
 * 验收环境
 */
;(function() {
  window.SITE_CONFIG = {}

  // api接口请求地址
  window.SITE_CONFIG['baseUrl'] = 'http://192.168.32.116:31012/renren-fast'
  // window.SITE_CONFIG['baseUrl'] = 'http://localhost:8080/renren-fast'
  // gateway接口请求地址
  window.SITE_CONFIG['baseGatewayUrl'] = 'http://192.168.32.116:31004'
  // window.SITE_CONFIG['baseGatewayUrl'] = 'http://localhost:88'

  // cdn地址 = 域名 + 版本号
  window.SITE_CONFIG['domain'] = './' // 域名
  window.SITE_CONFIG['version'] = '' // 版本号(年月日时分)
  window.SITE_CONFIG['cdnUrl'] =
    window.SITE_CONFIG.domain + window.SITE_CONFIG.version
})()
