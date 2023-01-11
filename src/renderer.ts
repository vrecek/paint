import App from './App'
import './css/index.css'
import './css/TopMenu.css'
import { AppState } from './interfaces/AppInterfaces';
import { ScreenInfo, ToolObject } from './interfaces/MainInterfaces';



const main = async () => {
    const canvas: HTMLCanvasElement = document.querySelector('canvas'),
          APP: App = new App(canvas)

          
    await APP.loadImages()
          
    const screen: ScreenInfo = await APP.invoke<ScreenInfo>('screen')
    APP.setCanvasSize(screen.width, screen.height - 85)


    initalizeTools(APP)


    canvas.onmousedown = (e: MouseEvent): void => {
        APP.setHold(true)
    }

    canvas.onmouseleave = (): void => {
        APP.setHold(false)
    }

    canvas.onmouseup = (e: MouseEvent): void => {
        APP.setHold(false)
    }


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
    const STATES: AppState[] = [AppState.DRAW, AppState.RECTANGLE]
    const tools: ToolObject[] = [...document.querySelectorAll('.tool')].map((x, i) => {
        return { element: x, state: STATES[i] }
    })
    

    for (const {element, state} of tools) {
        const img: HTMLElement = element.children[0].children[0] as HTMLElement,
              thickOptions: HTMLElement[] = [...element.children[1].children as HTMLCollectionOf<HTMLElement>]


        // Change the app's state and add active classname
        img.onclick = (e: MouseEvent): void => {
            const t: Element = e.currentTarget as Element

            for (const img of [...document.querySelectorAll('.tool-img')])
                img.classList.remove('active')

            t.classList.add('active')


            app.changeState(state)
        }


        // Change tool thickness
        for (const option of thickOptions) 
            option.onclick = (): void => {
                const thickness: number = parseInt(option.getAttribute('data-thick') ?? '3')

                app.setThickness(thickness)
            }
    }
}


main()

