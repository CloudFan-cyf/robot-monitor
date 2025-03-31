// app/components/WarningItem.tsx
import React from 'react'
import styles from '@/app/ui/home/warning-itmes.module.css'
import type { RobotEvent } from '@/app/types'

interface WarningItemProps {
    event: RobotEvent
}

const WarningItem: React.FC<WarningItemProps> = ({ event }) => {
    const parseMessage = (message: string) => {
        try {
            return JSON.parse(message)
        } catch {
            return { error: '原始消息' }
        }
    }

    const parsed = parseMessage(event.message)

    return (
        <div className={styles.warningItem}>
            <span className={styles.warningIcon}>⚠️</span>
            <div className={styles.warningInfo}>
                <h3>{parsed?.location || '未知位置'}</h3>
                <p>{parsed?.error || parsed?.message || '未知错误'}</p>
                <div className={styles.robotInfo}>
                    <span>ID: {event.robot_id}</span>
                    <span>名称: {event.robot_name}</span>
                </div>
            </div>
            <span className={styles.timestamp}>
                {new Date(event.timestamp).toLocaleString()}
            </span>
        </div>
    )
}

export default WarningItem
