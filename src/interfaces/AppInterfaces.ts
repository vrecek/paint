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

export type SaveDialogResult = {
    canceled: boolean
    filePath: string
}

export interface OpenDialogResult extends Omit<SaveDialogResult, 'filePath'> {
    filePaths: string[]
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

export type Positions = {
    startPos: XY | null
    lastPos: XY
}

export type RectangleValues = Positions & {
    w: number
    h: number
}

export type RectsT = Positions & {
    w: number,
    h: number
}
export type DrawValues = number[][]