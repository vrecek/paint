import App from './App'
import './css/index.css'
import './css/TopMenu.css'
import { AppState } from './interfaces/AppInterfaces';
import { ScreenInfo } from './interfaces/MainInterfaces';
import { leaveFunc, onFunc, refreshFunc, upFunc } from './util/EventFunctions';
import { initalizeTools, initializeColorChange, initializeFillToggler, initializeMenuActions, initializeThicknessChange } from './util/InitializerFunctions';
import { markRubberCursor } from './util/Tools/Tool_Rubber_Functions';

/*
    Available tools:
        mousemove: Brush, Rectangle, Line, Rubber
        click: Fill, Rubber
*/

const main = async () => {
    const canvas: HTMLCanvasElement = document.querySelector('canvas'),
          APP: App = new App(canvas)

          
    // Load images in 'images' folder to HTML
    await APP.loadImages([
        'brush.png',
        'rectangle.png',
        'line.png',
        'fill.png',
        'rubber.png'
    ])
    
    
    // Get screen size
    const screen: ScreenInfo = await APP.invoke<ScreenInfo>('screen')
    const {width, height} = screen


    // Minus top bar height 
    const canvasHeight: number = height - 85


    APP.setCanvasSize(width, canvasHeight)
    APP.setBackground(0, 0, width, canvasHeight, 'rgb(221, 221, 221)')


    // Initialize all clickable elements
    initalizeTools(APP)
    initializeMenuActions(APP)
    initializeThicknessChange(APP)
    initializeColorChange(APP)
    initializeFillToggler(APP)


    // Perform action when mouse is moved over canvas
    canvas.onmousemove = (e: MouseEvent): void => {
        const STATE: AppState = APP.getState()

        // If rubber is selected, create an indicator
        if (STATE === 'RUBBER')
            markRubberCursor(e, APP.getThickness())


        if (!APP.getIsHolded()) return

        switch (STATE) {
            case 'DRAW':
                APP.draw(e)
            break;

            case 'RECTANGLE':
                APP.rectangle(e)
            break;

            case 'LINE':
                APP.line(e)
            break;

            case 'RUBBER':
                APP.clear(e)
            break;

            default: break;
        }
    }


    // Handlers for mouse events and request frame function
    APP.eventHandler({
        leaveFunc,
        onFunc,
        refreshFunc,
        upFunc
    })
}




main()

