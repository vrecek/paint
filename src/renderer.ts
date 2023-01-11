import App from './App'
import './css/index.css'
import './css/TopMenu.css'
import { AppState } from './interfaces/AppInterfaces';
import { ScreenInfo, ToolObject } from './interfaces/MainInterfaces';
import Dropdown from './util/Client';
import initalizeInputHelper from './util/initializeInputHelper';
import menuAction from './util/OptionsFunctions';



const main = async () => {
    const canvas: HTMLCanvasElement = document.querySelector('canvas'),
          APP: App = new App(canvas)

          
    // Load images in 'images' folder to HTML
    await APP.loadImages()
          
    // Set canvas to fullscreen
    const screen: ScreenInfo = await APP.invoke<ScreenInfo>('screen')
    APP.setCanvasSize(screen.width, screen.height - 85)


    // Initialize all clickable elements
    initalizeTools(APP)
    initializeMenuActions(APP)
    initializeThicknessChange(APP)
    initializeColorChange(APP)


    canvas.onmousedown = (): void => {
        APP.setHold(true)
    }

    canvas.onmouseleave = (): void => {
        APP.setHold(false)
    }

    canvas.onmouseup = (): void => {
        APP.setHold(false)
    }


    // Perform action when mouse is moved over canvas
    canvas.onmousemove = (e: MouseEvent): void => {
        if (!APP.getIsHolded()) return


        switch (APP.getState()) {
            case 'DRAW':
                APP.draw(e)
            break;

            case 'RECTANGLE':

            break;

            default: break;
        }
    }
}


const initalizeTools = (app: App): void => {

    // Map tools to its state
    const STATES: AppState[] = [AppState.DRAW, AppState.RECTANGLE]
    const tools: ToolObject[] = [...document.querySelectorAll('.tool')].map((x, i) => {
        return { element: x, state: STATES[i] }
    })
    

    for (const {element, state} of tools) {
        const img: HTMLElement = element.children[0] as HTMLElement

        // Change the app's state and add active classname
        img.onclick = (e: MouseEvent): void => {
            const t: Element = e.currentTarget as Element

            // Remove 'active' class from current tool
            for (const img of [...document.querySelectorAll('.tool-img')])
                img.classList.remove('active')

            t.classList.add('active')

            // Change app state
            app.changeState(state)
        }
    }
}

const initializeThicknessChange = (app: App): void => {

    // Initialize thickness input
    initalizeInputHelper('thickness-change', (val: string) => {
        app.setThickness(parseInt(val))
    })
}

const initializeColorChange = (app: App): void => {

    // Initialize color input
    initalizeInputHelper('color-change', (val: string) => {
        app.setColor(val)
    })
}

const initializeMenuActions = (app: App): void => {
    const [clickable, list] = [...document.querySelector('.context-menu').children] as HTMLElement[]

    // Toggle dropdown menu
    const dd: Dropdown = new Dropdown(200)
    clickable.onclick = (): void => {
        dd.switchActive()
        dd.getActive
            ? dd.expandMenu(list)
            : dd.shrinkMenu()
    }


    const listOptions = [...list.children] as HTMLElement[]
    
    // Open save menu and save the canvas
    listOptions[0].onclick = () => menuAction(dd, () => app.clearCanvas())

    // Clear canvas
    listOptions[1].onclick = () => menuAction(dd, () => app.clearCanvas())
}


main()

