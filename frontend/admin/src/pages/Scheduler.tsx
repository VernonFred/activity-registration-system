import { Button, Table, message } from 'antd'
import { useEffect, useState } from 'react'
import { listTasks, runDue } from '../services/scheduler'

export default function Scheduler() {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await listTasks()
      setTasks(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const onRun = async () => {
    await runDue()
    message.success('已触发到期任务')
    load()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 18, fontWeight: 600 }}>任务调度</div>
        <Button type="primary" onClick={onRun}>立即运行到期任务</Button>
      </div>
      <Table
        rowKey="task"
        loading={loading}
        dataSource={tasks}
        columns={[
          { title: '任务', dataIndex: 'task' },
          { title: '启用', dataIndex: 'enabled', render: (v) => (v ? '是' : '否') },
          { title: '间隔(秒)', dataIndex: 'interval_seconds' },
          { title: '上次执行', dataIndex: 'last_run_at' },
          { title: '下次执行', dataIndex: 'next_run_at' },
        ]}
      />
    </div>
  )
}

