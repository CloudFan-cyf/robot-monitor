// app/components/StatusCard.tsx
import React from 'react'
import styles from '@/app/ui/home/status-card.module.css'
import type { RobotStatus } from '@/app/types'

interface StatusCardProps {
    robotId: number
    status: RobotStatus
}

const StatusCard: React.FC<StatusCardProps> = ({ robotId, status }) => (
    <div className={styles.statusCard}>
        <div className={styles.statusHeader}>
            <h3>{status.RobotName} (ID: {robotId})</h3>
            <span className={styles.timestamp}>
                最后更新：{new Date(status.Timestamp).toLocaleString()}
            </span>
        </div>
        <div className={styles.statusBody}>
            {status.speed && (
                <div className={styles.statusItem}>
                    <label>速度：</label>
                    <span className={styles.value}>{status.speed}m/s</span>
                </div>
            )}
            {status.position && (
                <div className={styles.statusItem}>
                    <label>位置：</label>
                    <span className={styles.value}>{status.position}</span>
                </div>
            )}
            {status.battery && (
                <div className={styles.statusItem}>
                    <label>电量：</label>
                    <span className={styles.value}>{status.battery}%</span>
                </div>
            )}
            {status.water_tank && (
                <div className={styles.statusItem}>
                    <label>水箱量：</label>
                    <span className={styles.value}>{status.water_tank}%</span>
                </div>
            )}
        </div>
    </div>
)

export default StatusCard
