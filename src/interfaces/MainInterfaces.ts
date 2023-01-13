import Dropdown from "../util/Client"
import { AppState } from "./AppInterfaces"

export type ScreenInfo = {
    width: number
    height: number
}

export type ToolObject = {
    state: AppState
    element: Element
}

export type OptionFunction = () => void

export type InitHelperFunc = (value: string) => void 