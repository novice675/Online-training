import React from 'react';
import { NavBar } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';

export default function EnergyPage() {
  const summary = {
    totalKWh: '117686.04',
    totalFee: '42459.42'
  };
const navigate=useNavigate()
  const details = [
    ['07.20', '321.42'], ['07.19', '5423.98'], ['07.18', '3462.45'], ['07.17', '1236.3'], ['07.16', '742.34'],
    ['07.15', '324.53'], ['07.14', '4359.7'], ['07.13', '742.4'], ['07.12', '1654.21'], ['07.11', '42459.42'],
    ['07.10', '4351.34'], ['07.09', '2123.1'], ['07.08', '4539.42'], ['07.07', '22359'], ['07.06', '2459.35'],
    ['07.05', '3459.14'], ['07.04', '2859.23'], ['07.03', '459.43'], ['07.02', '2459.4'], ['07.01', '429.34']
  ];

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <NavBar onBack={()=>{navigate(-1)}}>能耗查询</NavBar>

      <div style={{ padding: '12px 16px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 'bold', fontSize: 16, display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 4, height: 16, background: '#2764ff', marginRight: 6, borderRadius: 2 }} />
          能耗总览
        </div>
        <div style={{ fontSize: 14, border: '1px solid #2764ff', borderRadius: 4, padding: '4px 8px', color: '#2764ff' }}>
          2021年7月 ▾
        </div>
      </div>

      <div style={{ background: '#fff', padding: '0 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: 6, padding: 10, marginTop: 12 }}>
          <img src="/1.png" style={{ width: 18, height: 18, marginRight: 8 }} />
          <div style={{ fontSize: 14, flex: 1 }}>A1常青楼 401室</div>
          <div style={{ fontSize: 14 }}>▾</div>
        </div>

        <div style={{ display: 'flex', marginTop: 12, background: '#e3edff', borderRadius: 6, overflow: 'hidden' }}>
          <div style={{ flex: 1, textAlign: 'center', padding: 12, fontSize: 12, color: '#555' }}>总电量（KWh）</div>
          <div style={{ flex: 1, textAlign: 'center', padding: 12, fontSize: 12, color: '#555' }}>总费用（元）</div>
        </div>
        <div style={{ display: 'flex', borderBottom: '1px solid #ccc', borderLeft: '1px solid #ccc', borderRight: '1px solid #ccc' }}>
          <div style={{ flex: 1, textAlign: 'center', padding: 12, fontWeight: 500 }}>{summary.totalKWh}</div>
          <div style={{ flex: 1, textAlign: 'center', padding: 12, fontWeight: 500 }}>{summary.totalFee}</div>
        </div>
      </div>

      <div style={{ padding: '12px 16px 0 16px', background: '#fff', marginTop: 8 }}>
        <div style={{ fontWeight: 'bold', fontSize: 16, display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 4, height: 16, background: '#2764ff', marginRight: 6, borderRadius: 2 }} />
          能耗明细
        </div>
        <div style={{ marginTop: 12, borderRadius: 6, overflow: 'hidden' }}>
          <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#e3edff' }}>
                <th style={{ padding: 8, textAlign: 'left' }}>日期</th>
                <th style={{ padding: 8, textAlign: 'left' }}>总电量（KWh）</th>
              </tr>
            </thead>
            <tbody>
              {details.map(([date, kwh], i) => (
                <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: 8 }}>{date}</td>
                  <td style={{ padding: 8 }}>{kwh}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}