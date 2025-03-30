import React from 'react'
import styles from '@/app/ui/home/connection-status.module.css'

interface ConnectionStatusProps {
  status: string
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ status }) => {
  return (
    <div className={`${styles.connectStatus} ${status === '已连接' ? styles.connected : styles.disconnected
      }`}>
      {status}
    </div>
  )
}

export default ConnectionStatus
