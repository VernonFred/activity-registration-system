import http from './http'

export async function listTasks() {
  const resp = await http.get('/scheduler/tasks')
  return resp.data
}

export async function runDue() {
  const resp = await http.post('/scheduler/run')
  return resp.data
}

