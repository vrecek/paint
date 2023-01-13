import { AppState } from "..//interfaces/AppInterfaces"
import App from "../App"
import { removeRubberIfAttached } from "./Tools/Tool_Rubber_Functions"



// Function that will be called when cursor leave the canvas
const leaveFunc = (app: App, e: MouseEvent): void => {

    // Remove rubber mark if present
    removeRubberIfAttached()
}

// Function that will be called when user click
const onFunc = (app: App, e: MouseEvent): void => {
    const state: AppState = app.getState()

    // Use rubber tool
    if (state === 'RUBBER')
        app.clear(e)
}

// Function that will be called when the user release left mouse button
const upFunc = (app: App, e: MouseEvent): void => {


}

// Function that will be called every frame
const refreshFunc = (app: App): void => {

}



export {
    leaveFunc,
    onFunc,
    upFunc,
    refreshFunc
}
