import { AutoComplete } from 'antd'

const PRESET = [
  '国际会展中心','万达文华酒店','香格里拉大酒店','万豪酒店','希尔顿酒店','洲际酒店','大学讲堂','创意园路演厅','科技园会议中心','市政府会议中心',
]

const POPULAR_BY_CITY: Record<string, string[]> = {
  '北京': ['国家会议中心','北京饭店·会议中心','国贸大酒店','人民大会堂','雁栖湖国际会展中心'],
  '上海': ['上海世博中心','上海国际会议中心','浦东香格里拉','外滩华尔道夫','国家会展中心'],
  '广州': ['白云国际会议中心','广州琶洲展馆','四季酒店','花城汇会议中心'],
  '深圳': ['会展中心','华侨城洲际','深圳湾万象城会议中心','南山科技园会议中心'],
  '杭州': ['杭州国际博览中心','西湖国宾馆','黄龙饭店','未来科技城会议中心'],
  '南京': ['南京国际博览中心','金陵饭店会议中心','玄武湖国际会议中心'],
  '成都': ['世纪城新国际会展中心','环球中心','香格里拉大酒店','太古里附近会议中心'],
  '武汉': ['武汉国际博览中心','洲际酒店','东湖宾馆'],
  '西安': ['曲江国际会展中心','索菲特人民大厦','高新会议中心'],
  '长沙': ['梅溪湖国际文化艺术中心','北辰三角洲会议中心','国金中心会议中心'],
}

export default function LocationSelect({ value, onChange, style, placeholder, regionPath }: { value?: string; onChange?: (v?: string) => void; style?: React.CSSProperties; placeholder?: string; regionPath?: string[] }) {
  const city = regionPath?.[1] || regionPath?.[0]
  const list = (city && POPULAR_BY_CITY[city]) || PRESET
  const options = list.map((x) => ({ value: x }))
  return (
    <AutoComplete
      allowClear
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder || '选择或输入地点'}
      style={style}
      filterOption={(inputValue, option) => (option?.value || '').toLowerCase().includes(inputValue.toLowerCase())}
    />
  )
}
