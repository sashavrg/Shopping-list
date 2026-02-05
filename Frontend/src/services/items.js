import axios from 'axios'
const baseUrl = '/api/items'

const getAll = (list = 'shopping') => {
  const request = axios.get(baseUrl, { params: { list } })
  return request.then(response => response.data)
}

const create = (newObject, list = 'shopping') => {
  const request = axios.post(baseUrl, { ...newObject, list })
  return request.then(response => response.data)
}

const update = (id, newObject) => {
  const request = axios.put(`${baseUrl}/${id}`, newObject)
  return request.then(response => response.data)
}

const remove = (id) => {
  const request = axios.delete(`${baseUrl}/${id}`)
  return request.then(response => response.data)
}

export default { getAll, create, update, remove }