import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

export interface NobleStarData {
  name: string;
  value: number;
  desc: string;
}

export default function NobleYearlyChart({
  nobleStars = [],
  yearlySha = [],
  loading = false
}: {
  nobleStars?: NobleStarData[];
  yearlySha?: NobleStarData[];
  loading?: boolean;
}) {

  // 3. Handle Empty State
  const isEmpty = useMemo(() => {
    return !loading && (!nobleStars || nobleStars.length === 0) && (!yearlySha || yearlySha.length === 0);
  }, [loading, nobleStars, yearlySha]);

  const option = useMemo(() => {
    const allData = [...(nobleStars || []), ...(yearlySha || [])];

    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: Array<{ name: string; value: number }>) => {
          const item = params[0];
          const data = allData.find(d => d.name === item.name);
          return `${item.name}: ${item.value}<br/>${data?.desc || ''}`;
        }
      },
      grid: {
        top: '10%',
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: allData.map(d => d.name),
        axisLabel: { interval: 0, rotate: 30, fontSize: 10 }
      },
      yAxis: {
        type: 'value',
        max: 100,
        splitLine: { show: false }
      },
      series: [
        {
          name: '强度',
          type: 'bar',
          data: allData.map(d => d.value),
          itemStyle: {
            color: (params: { dataIndex: number }) => {
              // Fix: params.dataIndex is reliable, but we need to know the split point
              // The split point is exactly nobleStars.length
              return params.dataIndex < (nobleStars?.length || 0) ? '#f59e0b' : '#ef4444';
            }
          }
        }
      ]
    };
  }, [nobleStars, yearlySha]);

  if (loading) {
      return (
          <div className="flex-1 h-full min-h-[200px] animate-pulse bg-secondary/10 rounded-lg flex items-center justify-center">
              <div className="h-4 w-24 bg-secondary/20 rounded"></div>
          </div>
      );
  }

  if (isEmpty) {
    return null; // Parent handles empty state
  }

  return (
    <div className="w-full h-full min-h-[200px]">
      <ReactECharts
        option={option}
        style={{ height: '100%', width: '100%' }}
        notMerge={true}
        lazyUpdate={true}
      />
    </div>
  );
}
