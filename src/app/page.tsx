// app/page.tsx 完整实现
'use client'
import { useEffect, useState } from 'react'

// 完善数据类型定义
interface RobotEvent {
  robot_id: number
  robot_name: string
  timestamp: string
  message: string
}

interface ParsedMessage {
  location?: string
  error?: string
  [key: string]: unknown
}

interface RobotStatus {
  RobotName: string
  Timestamp: string
  speed?: string
  position?: string
  battery?: string
  water_tank?: string
}

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
      status: { robot_id: number; data: never; robot_name: string; timestamp: string }[]
    }) => {
      if (!initData) return
      // 处理事件数据
      const latestEvents = initData.events
        .slice(-10)
        .reverse()
      setEvents(latestEvents)

      // 处理状态数据
      const newStatusMap = new Map<number, RobotStatus>()
      initData.status.forEach(status => {
        newStatusMap.set(status.robot_id, {
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
          ...(typeof status.data === 'object' && status.data !== null ? status.data : {}),
          RobotName: status.robot_name,
          Timestamp: status.timestamp
        })
        return newMap
      })
    }

    const connect = () => {
      ws = new WebSocket('ws://localhost:8081/ws')

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

  // 解析事件消息
  const parseEventMessage = (message: string): ParsedMessage => {
    try {
      return JSON.parse(message)
    } catch {
      return { error: '原始消息' }
    }
  }

  // 状态卡片组件
  const StatusCard = ({ robotId, status }: { robotId: number; status: RobotStatus }) => (
    <div className="statusCard">
      <div className="statusHeader">
        <h3>{status.RobotName} (ID: {robotId})</h3>
        <span className="timestamp">
          最后更新：{new Date(status.Timestamp).toLocaleString()}
        </span>
      </div>
      <div className="statusBody">
        {status.speed && (
          <div className="statusItem">
            <label>速度：</label>
            <span className="value">{status.speed}m/s</span>
          </div>
        )}
        {status.position && (
          <div className="statusItem">
            <label>位置：</label>
            <span className="value">{status.position}</span>
          </div>
        )}
        {status.battery && (
          <div className="statusItem">
            <label>电量：</label>
            <span className="value">{status.battery}%</span>
          </div>
        )}
        {status.water_tank && (
          <div className="statusItem">
            <label>水箱量：</label>
            <span className="value">{status.water_tank}%</span>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="container">
      <header className="header">
        <div className="timeDisplay">{currentTime}</div>
        <div className={`connectStatus ${connectionStatus === '已连接' ? 'connected' : 'disconnected'}`}>
          {connectionStatus}
        </div>
      </header>

      <main className="content">
        <section className="alerts">
          <h2 className="sectionTitle">📢 紧急事件</h2>
          <div className="warningList">
            {events.map((event, index) => {
              const parsed = parseEventMessage(event.message)
              return (
                <div key={`${event.robot_id}-${event.timestamp}-${index}`} className="warningItem">
                  <span className="warningIcon">⚠️</span>
                  <div className="warningInfo">
                    <h3>{parsed.location || '未知位置'}</h3>
                    <p>{parsed.error || (typeof parsed.message === 'string' ? parsed.message : '未知错误')}</p>
                    <div className="robotInfo">
                      <span>ID: {event.robot_id}</span>
                      <span>名称: {event.robot_name}</span>
                    </div>
                  </div>
                  <span className="timestamp">
                    {new Date(event.timestamp).toLocaleString()}
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        <section className="status">
          <h2 className="sectionTitle">实时状态</h2>
          <div className="statusList">
            {Array.from(statusData.entries()).map(([robotId, status]) => (
              <StatusCard key={robotId} robotId={robotId} status={status} />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
