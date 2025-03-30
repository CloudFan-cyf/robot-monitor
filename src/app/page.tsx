// app/page.tsx 完整实现
'use client'
import { useEffect, useState } from 'react'
import ConnectionStatus from '@/app/ui/home/connection-status'
import WarningItem from '@/app/ui/home/warning-items'
import StatusCard from '@/app/ui/home/status-card'
import { RobotEvent, RobotStatus } from '@/app/types'
import styles from '@/app/ui/home.module.css'

export default function Home() {
  const [currentTime, setCurrentTime] = useState('')
  const [connectionStatus, setConnectionStatus] = useState('连接中...')
  const [events, setEvents] = useState<RobotEvent[]>([])
  const [statusData, setStatusData] = useState<Map<number, RobotStatus>>(new Map())

  // 时间更新效果
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(formatTime(new Date()))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // WebSocket连接和数据处理
  useEffect(() => {
    let ws: WebSocket | null = null
    let reconnectTimer: NodeJS.Timeout

    const handleInitialData = (initData: {
      events: RobotEvent[]
      status: Record<number, { data: never; robot_name: string; timestamp: string }>
    }) => {
      if (!initData || !initData.events || !initData.status) {
        console.warn('初始化数据为空或格式不正确:', initData)
        return
      }
      // 处理事件数据
      const latestEvents = initData.events
        .slice(-10)
        .reverse()
      setEvents(latestEvents)

      // 处理状态数据
      const newStatusMap = new Map<number, RobotStatus>()
      Object.entries(initData.status).forEach(([robotId, status]) => {
        const robotIdNum = parseInt(robotId, 10)
        newStatusMap.set(robotIdNum, {
          robot_id: robotIdNum,
          ...(typeof status.data === 'object' && status.data !== null ? status.data : {}),
          RobotName: status.robot_name,
          Timestamp: status.timestamp
        })
      })
      setStatusData(newStatusMap)
    }

    const handleNewEvent = (event: RobotEvent) => {
      setEvents(prev => {
        const newEvents = [event, ...prev]
        return newEvents.slice(0, 10) // 保持最多10条
      })
    }

    const handleNewStatus = (status: {
      robot_id: number
      data: never
      robot_name: string
      timestamp: string
    }) => {
      setStatusData(prev => {
        const newMap = new Map(prev)
        const existing = newMap.get(status.robot_id) || {}
        newMap.set(status.robot_id, {
          ...existing,
          robot_id: status.robot_id,
          ...(typeof status.data === 'object' && status.data !== null ? status.data : {}),
          RobotName: status.robot_name,
          Timestamp: status.timestamp
        })
        return newMap
      })
    }

    const connect = () => {
      ws = new WebSocket('ws://localhost:80/ws')

      ws.onopen = () => {
        setConnectionStatus('已连接')
        console.log('WebSocket连接成功')
      }

      ws.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data)

          if (data.events && data.status) {
            // 初始化数据
            handleInitialData(data)
          } else if (data.message !== undefined) {
            // 单个事件
            handleNewEvent(data)
          } else if (data.data !== undefined) {
            // 状态更新
            handleNewStatus(data)
          }
        } catch (error) {
          console.error('数据解析失败:', error)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket错误:', error)
        setConnectionStatus('连接错误')
      }

      ws.onclose = () => {
        setConnectionStatus('已断开 - 正在重连...')
        reconnectTimer = setTimeout(connect, 3000)
      }
    }

    connect()

    return () => {
      ws?.close()
      clearTimeout(reconnectTimer)
    }
  }, [])

  // 时间格式化函数
  const formatTime = (date: Date) => {
    return `${date.getFullYear()}年
      ${String(date.getMonth() + 1).padStart(2, '0')}月
      ${String(date.getDate()).padStart(2, '0')}日
      ${String(date.getHours()).padStart(2, '0')}:
      ${String(date.getMinutes()).padStart(2, '0')}:
      ${String(date.getSeconds()).padStart(2, '0')}`.replace(/\n/g, ' ')
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.timeDisplay}>{currentTime}</div>
        <ConnectionStatus status={connectionStatus} />
      </header>

      <main className={styles.content}>
        <section className={styles.alerts}>
          <h2 className={styles.sectionTitle}>📢 紧急事件</h2>
          <div className={styles.warningList}>
            {events.map((event, index) => (
              <WarningItem key={`${event.robot_id}-${event.timestamp}-${index}`} event={event} />
            ))}
          </div>
        </section>

        <section className={styles.status}>
          <h2 className={styles.sectionTitle}>实时状态</h2>
          <div className={styles.statusList}>
            {Array.from(statusData.entries()).map(([robotId, status]) => (
              <StatusCard key={robotId} robotId={robotId} status={status} />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
