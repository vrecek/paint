import { AppStateArray } from "../interfaces/AppInterfaces"
import { ToolObject } from "../interfaces/MainInterfaces"
import { InitHelperFunc } from "../interfaces/MainInterfaces"
import App from "../App"
import Dropdown from "./Client"
import menuAction from "./OptionsFunctions"


// Function to help input -> label-span HTML functionality
const initalizeInputHelper = (cname: string, func: InitHelperFunc): void => {
    const [input, label] = [...document.querySelector(`.${cname}`).children] as [HTMLInputElement, Element]

    // Helper function to reduce the boilerplate
    input.onchange = (): void => {
        const {value} = input

        func(value)

        label.children[0].textContent = value
    }
}


// Initialize tool functions
const initalizeTools = (app: App): void => {

    // Map tools to its state
    const tools: ToolObject[] = [...document.querySelectorAll('.tool')].map((x, i) => {
        return { element: x, state: AppStateArray[i] }
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
            app.setState(state)
        }
    }
}

// Possibility of changing thickness
const initializeThicknessChange = (app: App): void => {

    // Initialize thickness input
    initalizeInputHelper('thickness-change', (val: string) => {
        app.setThickness(parseInt(val))
    })
}

// Possibility of changing colors
const initializeColorChange = (app: App): void => {

    // Initialize color input
    initalizeInputHelper('color-change', (val: string) => {
        app.setColor(val)
    })
}

// Possibility of using dropdown menu
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
    listOptions[0].onclick = () => menuAction(dd, () => app.saveCanvas())

    // Load image to canvas
    listOptions[1].onclick = () => menuAction(dd, () => app.loadCanvas())

    // Clear canvas
    listOptions[2].onclick = () => menuAction(dd, () => app.clearCanvas())
}

// Possibility of toggling fill mode
const initializeFillToggler = (app: App): void => {
    const [div, label] = [...document.querySelector(`.toggle-fill`).children] as [HTMLElement, Element]

    div.onclick = (): void => {
        // When clicked, reverse the app's 'fill' value 
        app.toggleFillMode()

        const isFillModeOn: boolean = app.getFillMode()

        // Set the classname to CSS styles ...
        div.children[0].className = isFillModeOn.toString()

        // ... and change the label text
        label.children[0].textContent = isFillModeOn
            ? 'ON'
            : 'OFF'
    }
}



export {
    initalizeTools,
    initializeThicknessChange,
    initializeColorChange,
    initializeMenuActions,
    initializeFillToggler
}