import { useEffect, useMemo, useState } from 'react'
import { Table, Button, Input, Segmented, message, Space, Popconfirm } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

function SearchCapsule({ onSearch, onChange }: { onSearch: (kw: string) => void; onChange?: (kw: string) => void }) {
  const [val, setVal] = useState('')
  const doSearch = () => onSearch(val.trim())
  return (
    <div className="search-pill" style={{ width: 380 }}>
      <Input
        allowClear
        bordered={false}
        prefix={<SearchOutlined />}
        placeholder="Search here"
        value={val}
        onChange={(e) => { const v = e.target.value; setVal(v); onChange?.(v); if (v === '') onSearch('') }}
        onPressEnter={doSearch}
        style={{ flex: 1, height: 40 }}
      />
      <Button type="primary" className="pill-btn" onClick={doSearch}>Search</Button>
    </div>
  )
}
import PageHeader from '../components/PageHeader'
import FilterBar from '../components/FilterBar'
import SectionCard from '../components/SectionCard'
import { listActivities, deleteActivity, ActivityStatus } from '../services/activities'

const STATUS_LABEL: Record<ActivityStatus, string> = {
  draft: '草稿',
  scheduled: '计划中',
  published: '已发布',
  closed: '已结束',
  archived: '已归档',
}

export default function Activities() {
  const navigate = useNavigate()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [statusSeg, setStatusSeg] = useState<'all' | ActivityStatus>('all')
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>([])

  // Region chips and filtered data
  const displayData = useMemo<any[]>(() => {
    let arr = data
    if (statusSeg !== 'all') arr = arr.filter((d) => d.status === statusSeg)
    if (keyword) arr = arr.filter((d) => (d.title || '').toLowerCase().includes(keyword.toLowerCase()))
    return arr
  }, [data, statusSeg, keyword])

  const load = async () => {
    setLoading(true)
    try {
      const res = await listActivities()
      setData(res)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onOpenCreate = () => {
    navigate('/activities/new')
  }

  const onEdit = (record: any) => {
    navigate(`/activities/new?id=${record.id}`)
  }

  return (
    <div>
      <PageHeader title="活动管理" extra={<Button type="primary" onClick={onOpenCreate}>+ 新活动</Button>} />
      {/* 顶部筛选与搜索 */}
      <FilterBar plain style={{ marginBottom: 12 }}>
        <Segmented
          options={[
            { label: '全部', value: 'all' },
            { label: '草稿', value: 'draft' },
            { label: '计划中', value: 'scheduled' },
            { label: '已发布', value: 'published' },
            { label: '已结束', value: 'closed' },
            { label: '已归档', value: 'archived' },
          ]}
          value={statusSeg}
          onChange={(v) => setStatusSeg(v as any)}
        />
        <SearchCapsule onSearch={(kw) => setKeyword(kw)} onChange={(kw) => setKeyword(kw)} />
      </FilterBar>

      <SectionCard>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 8, gap: 12, flexWrap: 'wrap' }}>
          <Space>
            <span>已选 {selectedRowKeys.length} 项</span>
            <Popconfirm
              title="确认批量删除？"
              okText="删除"
              cancelText="取消"
              okButtonProps={{ danger: true }}
              onConfirm={async () => {
                if (!selectedRowKeys.length) return
                try {
                  for (const id of selectedRowKeys) {
                    await deleteActivity(id as number)
                  }
                  message.success(`已删除 ${selectedRowKeys.length} 项`)
                  setSelectedRowKeys([])
                  await load()
                } catch (e: any) {
                  message.error(e?.response?.data?.detail || '批量删除失败')
                }
              }}
            >
              <Button className="pill-action pill-delete" size="small" disabled={!selectedRowKeys.length}>批量删除</Button>
            </Popconfirm>
            {/* 删除“清除选择”按钮，功能重复 */}
            {/* <Button className="pill-action" size="small" onClick={() => setSelectedRowKeys([])} disabled={!selectedRowKeys.length}>清除选择</Button> */}
          </Space>
        </div>
        <Table
          rowKey="id"
          loading={loading}
          rowSelection={{ selectedRowKeys, onChange: (keys) => setSelectedRowKeys(keys as (string | number)[]) }}
          columns={[
            { title: '标题', dataIndex: 'title' },
            { title: '城市', dataIndex: 'city', width: 120 },
            {
              title: '状态',
              dataIndex: 'status',
              width: 120,
              render: (v: ActivityStatus) => <span className={`status-grad grad-${v}`}>{STATUS_LABEL[v]}</span>,
            },
            { title: '创建时间', dataIndex: 'created_at', width: 200 },
            {
              title: '操作',
              width: 200,
              render: (_: any, record: any) => (
                <Space>
                  <Button size="small" className="pill-action pill-edit" onClick={() => onEdit(record)}>编辑</Button>
                  <Popconfirm
                    title="确认删除该活动？"
                    okText="删除"
                    cancelText="取消"
                    okButtonProps={{ danger: true }}
                    onConfirm={async () => {
                      try {
                        await deleteActivity(record.id)
                        message.success('已删除')
                        setSelectedRowKeys((keys) => keys.filter((k) => k !== record.id))
                        await load()
                      } catch (e: any) {
                        message.error(e?.response?.data?.detail || '删除失败')
                      }
                    }}
                  >
                    <Button size="small" className="pill-action pill-delete">删除</Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
          dataSource={displayData}
        />
      </SectionCard>
    </div>
  )
}
