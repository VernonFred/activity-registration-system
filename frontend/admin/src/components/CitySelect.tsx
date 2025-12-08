import { Select } from 'antd'

const HOT_CITIES = [
  '北京','上海','广州','深圳','杭州','南京','苏州','成都','重庆','天津',
  '武汉','西安','郑州','长沙','合肥','厦门','青岛','大连','宁波','福州',
  '济南','沈阳','东莞','佛山','无锡','昆明','南昌','南宁','石家庄','太原',
]

export default function CitySelect({ value, onChange, style }: { value?: string; onChange?: (v?: string) => void; style?: React.CSSProperties }) {
  const options = HOT_CITIES.map((c) => ({ label: c, value: c }))
  return (
    <Select
      showSearch
      allowClear
      placeholder="选择城市或输入"
      options={options}
      value={value}
      onChange={onChange}
      filterOption={(input, option) => (option?.label as string).toLowerCase().includes(input.toLowerCase())}
      style={style}
    />
  )
}

