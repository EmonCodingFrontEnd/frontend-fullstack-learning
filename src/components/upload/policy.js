import httpRequest from '@/utils/httpRequest'

export function policy() {
  return new Promise((resolve, reject) => {
    httpRequest({
      url: httpRequest.adornGatewayUrl('/api/thirdparty/oss/policy'),
      method: 'get',
      params: httpRequest.adornParams({})
    }).then(({ data }) => {
      resolve(data)
    }).catch(error => reject(error))
  })
}
