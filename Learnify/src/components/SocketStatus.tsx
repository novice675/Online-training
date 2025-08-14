import React from 'react';
import { useSocket } from '../composables/useSocket';

interface SocketStatusProps {
  showDetails?: boolean;
}

export default function SocketStatus({ showDetails = false }: SocketStatusProps) {
  const { connected, connect, disconnect } = useSocket({
    autoConnect: false,
    onConnect: () => {
      console.log('Socket连接成功');
    },
    onDisconnect: () => {
      console.log('Socket连接断开');
    }
  });

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('连接失败:', error);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      zIndex: 1000,
      padding: '8px 12px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: connected ? '#52c41a' : '#ff4d4f'
      }} />
      <span style={{ color: connected ? '#52c41a' : '#ff4d4f' }}>
        {connected ? '已连接' : '未连接'}
      </span>
      
      {showDetails && (
        <div style={{ display: 'flex', gap: '4px' }}>
          {!connected ? (
            <button
              onClick={handleConnect}
              style={{
                padding: '2px 6px',
                fontSize: '10px',
                border: '1px solid #d9d9d9',
                borderRadius: '2px',
                backgroundColor: '#fff',
                cursor: 'pointer'
              }}
            >
              连接
            </button>
          ) : (
            <button
              onClick={handleDisconnect}
              style={{
                padding: '2px 6px',
                fontSize: '10px',
                border: '1px solid #d9d9d9',
                borderRadius: '2px',
                backgroundColor: '#fff',
                cursor: 'pointer'
              }}
            >
              断开
            </button>
          )}
        </div>
      )}
    </div>
  );
} 