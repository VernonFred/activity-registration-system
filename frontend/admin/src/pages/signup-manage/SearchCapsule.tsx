import { Button, Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

export default function SearchCapsule({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="search-pill" style={{ width: 200 }}>
      <Input
        allowClear
        bordered={false}
        prefix={<SearchOutlined />}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{ flex: 1, height: 36 }}
      />
      <Button type="primary" className="pill-btn" onClick={() => {}}>
        搜索
      </Button>
    </div>
  )
}
