import App from "../App"


export enum AppState {
    DRAW = 'DRAW',
    RECTANGLE = 'RECTANGLE',
    RUBBER = 'RUBBER'
}

export const AppStateArray: AppState[] = [
    AppState.DRAW,
    AppState.RECTANGLE,
    AppState.RUBBER
]

export type DrawPos = {
    x: number
    y: number
}

export type DialogResult = {
    canceled: boolean
    filePath: string
}

export type AppEvent = (app: App, e: MouseEvent) => void
export type RefreshEvent = (app: App) => void

export type Handlers = {
    refreshFunc: RefreshEvent
    upFunc: AppEvent
    onFunc: AppEvent
    leaveFunc: AppEvent
}

export type XY = [number, number]

export type RectangleValues = {
    startPos: XY | null
    lastPos: XY
    w: number
    h: number
}