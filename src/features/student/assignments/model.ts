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
    id: string
    week: number
    level: number
    title: string
    stars: number
    isLocked: boolean
}

