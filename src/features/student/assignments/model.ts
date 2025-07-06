export interface BeginResponse {
    token: string
    timestamp: string
}

export interface CompletionResponse {
    stars: number
    timestamp: string
    signature: string
}

export type StudentChallengeResponse = {
    challengeId: string
    level: number
    title: string
    stars: number
    isLocked: boolean
    levelData: LevelData
}

export type LevelData = {
    level: number;
    facing:      'up' | 'down' | 'left' | 'right'
    start:       Array<{ col: number; row: number }>
    collectible: Array<{ col: number; row: number }>
    obstacle:    Array<{ col: number; row: number }>
    goal:        Array<{ col: number; row: number }>
    path:        Array<{ col: number; row: number }>
    maxStep:     number
    commands:    Array<'up' | 'down' | 'left' | 'right' | 'scratch' | 'loop'>
    guides:      Array<'up' | 'down' | 'left' | 'right' | 'scratch'>
}