import { AppState } from "./interfaces/AppInterfaces";

const invoke = window.require('electron').ipcRenderer.invoke;



export default class App {
    private isHolded: boolean
    private state: AppState

    private thickenss: number

    private CTX: CanvasRenderingContext2D
    private canvas: HTMLCanvasElement



    public constructor(canvas: HTMLCanvasElement) {
        this.isHolded = false
        this.state = AppState.DRAW

        this.thickenss = 3

        this.canvas = canvas
        this.CTX = canvas.getContext('2d')
    }



    public draw(e: MouseEvent): void {
        const {offsetX, offsetY} = e

        this.CTX.beginPath()
        this.CTX.fillStyle = '#000000'
        this.CTX.arc(offsetX, offsetY, this.thickenss, 0, 2 * Math.PI)
        this.CTX.fill()
    }


    public async invoke<T = any>(event: string, ...args: any): Promise<T> {
        try {
            const result = await invoke(event, ...args)

            return result

        }catch (err) {
            throw `Event -${event}- does not exist in the Main process`
        }
    }


    public async loadImages(): Promise<void> {
        const imgFiles: string[] = [
            'brush.png',
            'rectangle.png'
        ]

        const images: HTMLImageElement[] = [...document.querySelectorAll('img')],
              base64: string[] = await this.invoke<string[]>('images', imgFiles)


        for (let i = 0; i < base64.length; i++) 
            images[i].src = `data:image/png;base64,${base64[i]}`
    }


    public setCanvasSize(w: number, h: number): void {
        this.CTX.canvas.width = w
        this.CTX.canvas.height = h
    }


    public getIsHolded(): boolean {
        return this.isHolded
    }


    public changeState(state: AppState): void {
        this.state = state
    }


    public getState(): AppState {
        return this.state
    }


    public setThickness(num: number): void {
        this.thickenss = num
    }


    public setHold(value?: boolean): void {
        this.isHolded = value ?? !this.isHolded
    }

}