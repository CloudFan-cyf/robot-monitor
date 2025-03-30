// app/types.ts
export interface RobotEvent {
    robot_id: number
    robot_name: string
    timestamp: string
    message: string
}

export interface RobotStatus {
    robot_id: number
    RobotName: string
    Timestamp: string
    speed?: string
    position?: string
    battery?: string
    water_tank?: string
}
