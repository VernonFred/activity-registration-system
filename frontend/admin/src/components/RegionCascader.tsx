import { Cascader, Spin } from 'antd'
import { useEffect, useState } from 'react'

type Node = { name: string; code?: string; children?: Node[] }

export default function RegionCascader({ value, onChange, style }: { value?: string[]; onChange?: (v?: string[]) => void; style?: React.CSSProperties }) {
  const [options, setOptions] = useState<Node[] | null>(null)
  useEffect(() => {
    let mounted = true
    fetch('/china-pcas.json')
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return
        // data may be an object (pcas.json) or an array (pca.json/pcas array form)
        let normalized: Node[] = []
        if (Array.isArray(data)) {
          normalized = data.map((p: any) => ({
            name: p.name || p.label || p.text,
            children: (p.children || p.city || []).map((c: any) => ({
              name: c.name || c.label || c.text,
              children: (c.children || c.area || []).map((a: any) => ({ name: a.name || a.label || a.text })),
            })),
          }))
        } else if (data && typeof data === 'object') {
          normalized = Object.entries<any>(data).map(([pname, cities]) => ({
            name: pname,
            children: Object.entries<any>(cities || {}).map(([cname, dists]) => ({
              name: cname,
              children: Object.keys(dists || {}).map((d) => ({ name: d })),
            })),
          }))
        }
        setOptions(normalized)
      })
      .catch(() => setOptions([]))
    return () => {
      mounted = false
    }
  }, [])

  if (!options) return <Spin />

  return (
    <Cascader
      allowClear
      showSearch
      changeOnSelect={false}
      placeholder="选择省/市/区"
      fieldNames={{ label: 'name', value: 'name', children: 'children' }}
      options={options}
      value={value}
      onChange={onChange as any}
      style={style}
    />
  )
}
