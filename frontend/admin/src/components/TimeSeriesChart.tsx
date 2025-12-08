import ReactECharts from 'echarts-for-react'

export default function TimeSeriesChart({ data }: { data: Array<any> }) {
  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: data.map((d) => d.date) },
    yAxis: { type: 'value' },
    legend: { data: ['报名', '通过', '签到'] },
    series: [
      { name: '报名', type: 'line', smooth: true, data: data.map((d) => d.signups) },
      { name: '通过', type: 'line', smooth: true, data: data.map((d) => d.approvals) },
      { name: '签到', type: 'line', smooth: true, data: data.map((d) => d.checkins) },
    ],
  }
  return <ReactECharts option={option} style={{ height: 280 }} />
}

