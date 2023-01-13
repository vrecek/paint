import { AppState, DialogResult, Handlers, RectangleValues } from "./interfaces/AppInterfaces";

const invoke = window.require('electron').ipcRenderer.invoke;



export default class App {
    private isHolded: boolean
    private state: AppState

    private thickness: number
    private color: string
    private fillMode: boolean

    private CTX: CanvasRenderingContext2D
    private canvas: HTMLCanvasElement

    private rectValues: RectangleValues

    private background: string



    public constructor(canvas: HTMLCanvasElement) {
        this.isHolded = false
        this.state = AppState.DRAW

        this.thickness = 3
        this.color = '#000000'
        this.fillMode = false

        this.canvas = canvas
        this.CTX = canvas.getContext('2d')

        this.rectValues = {
            lastPos: [0, 0],
            w: 0,
            h: 0,
            startPos: null
        }

        this.background = 'rgb(221, 221, 221)'
    }




    private clearRectValues(): void {
        this.rectValues = {
            lastPos: [0, 0],
            w: 0,
            h: 0,
            startPos: null
        }
    }

    private setClearedBgColor(x: number, y: number, w: number, h: number): void {
        this.CTX.beginPath()
        this.CTX.rect(x, y, w, h)
        this.CTX.fillStyle = this.background
        this.CTX.fill()
    }



    // Brush tool
    public draw(e: MouseEvent): void {
        const {offsetX, offsetY} = e

        // Draw a line of circles
        // Set to the current color value
        // More thickness === bigger line will be drawn
        this.CTX.beginPath()
        this.CTX.fillStyle = this.color
        this.CTX.arc(offsetX, offsetY, this.thickness, 0, 2 * Math.PI)
        this.CTX.fill()
    }

    // Rectangle tool
    public rectangle(e: MouseEvent): void {
        const {offsetX, offsetY} = e


        // Get starting position
        // If it is null get current mouse position and save to startPos
        if (!this.rectValues?.startPos)
            this.rectValues.startPos = [offsetX, offsetY]


        // Destructure starting position, last position and width + height
        const [startX, startY] = this.rectValues.startPos
        const [lastX, lastY] = this.rectValues.lastPos
        const {w, h} = this.rectValues



        // Variables for clearing rect 
        let cX: number, cY: number, cW: number, cH: number

        // Multiply thickness by 2 to clear rectangle as well as borders by getting total width/height

        if (h > 0) {

            // If height is more than 0, start clearing from bottom
            cY = startY - this.thickness
            cH = h + this.thickness * 2

        } else {

            // Otherwise start clearing from top
            cY = startY + this.thickness
            cH = h - this.thickness * 2
        }

        if (w > 0) {

            // If width is more than 0, start clearing from right
            cX = startX - this.thickness
            cW = w + this.thickness * 2

        } else {

            // Otherwise start clearing from left
            cX = startX + this.thickness
            cW = w - this.thickness * 2
        }

        // Clear previously drawed rectangle
        this.CTX.clearRect(cX, cY, cW, cH)

        // Remove the transparent BG
        this.setClearedBgColor(cX, cY, cW, cH)



        // Start drawing a new rectangle
        // Start at starting position, set actual width and height
        this.CTX.beginPath()
        this.CTX.rect(startX, startY, w, h)


        if (this.fillMode) {

            // If fillMode is ON, fill with current color

            this.CTX.fillStyle = this.color
            this.CTX.fill()

        } else {

            // If fillMode is OFF, set border thickness and its color
            
            this.CTX.lineWidth = this.thickness
            this.CTX.strokeStyle = this.color
            this.CTX.stroke()
        }

        

        // Determine new rectangle width
        // If cursor's X position is greater than last X position === mouse is moved to right
        // If cursor's X position is smaller than last X position === mouse is moved to left
        if (offsetX > lastX) 
            this.rectValues.w++
        else if (offsetX < lastX)
            this.rectValues.w--
        
            
        // Determine new rectangle height
        // If cursor's Y position is greater than last Y position === mouse is moved to bottom
        // If cursor's Y position is smaller than last Y position === mouse is moved to top
        if (offsetY > lastY) 
            this.rectValues.h++
        else if (offsetY < lastY)
            this.rectValues.h--
        

        // Save last (actual) position
        this.rectValues.lastPos = [offsetX, offsetY]
    }

    // Rubber tool
    public clear(e: MouseEvent): void {
        const {offsetX, offsetY} = e

        // Set to fill style to the canvas current BG
        this.CTX.beginPath()
        this.CTX.fillStyle = this.background

        // More thickness is, more space will be cleared
        const thick: number = this.thickness * 10

        // Center clearing field to the cursor's tip
        this.CTX.rect(
            offsetX - thick / 2, 
            offsetY - thick / 2, 
            thick, 
            thick
        )

        this.CTX.fill()
    }



    // Handle various events
    public eventHandler({leaveFunc, onFunc, upFunc, refreshFunc}: Handlers): void {

        // When mouse is pressed down
        this.canvas.onmousedown = (e: MouseEvent): void => {
            this.isHolded = true

            onFunc(this, e)
        }
    
        // When mouse leave the canvas 
        this.canvas.onmouseleave = (e: MouseEvent): void => {
            this.isHolded = false

            this.clearRectValues()

            leaveFunc(this, e)
        }
    
        // When mouse button is released
        this.canvas.onmouseup = (e: MouseEvent): void => {
            this.isHolded = false

            this.clearRectValues()

            upFunc(this, e)
        }


        // Every frame
        const refreshHandler = (): void => {
            window.requestAnimationFrame(() => {
                refreshFunc(this)

                refreshHandler()
            })
        }
        refreshHandler()
    }



    // Invoke any action from the main process
    public async invoke<T = any>(event: string, ...args: any): Promise<T> {
        try {
            const result = await invoke(event, ...args)

            return result

        }catch (err) {
            throw `Event -${event}- does not exist in the Main process`
        }
    }

    // Load images to the HTML
    public async loadImages(imgFiles: string[]): Promise<void> {
        // Get all <img> tags
        // Get the image data in base64
        const images: HTMLImageElement[] = [...document.querySelectorAll('img')],
              base64: string[] = await this.invoke<string[]>('images', imgFiles)


        // Set image source
        for (let i = 0; i < base64.length; i++) 
            images[i].src = `data:image/png;base64,${base64[i]}`
    }



    // Save canvas as PNG
    public async saveCanvas(): Promise<void> {
        // Get canvas data in base64
        const data = this.canvas.toDataURL('image/png')
                                .replace('data:image/png;base64,', '')

                               
        // Open save dialog from the main process and get path
        const {canceled, filePath}: DialogResult = await this.invoke('saveDialog')

        if (canceled) return

        // Invoke save action from the main process
        await this.invoke('save', filePath, data)
    }

    // Clear whole canvas
    public clearCanvas(): void {
        const {width, height} = this.canvas

        this.CTX.clearRect(
            0, 
            0,
            width,
            height
        )

        // Remove the transparent BG
        this.setClearedBgColor(0, 0, width, height)
    }




    public toggleFillMode(): void {
        this.fillMode = !this.fillMode
    }




    public getState(): AppState {
        return this.state
    }


    public getIsHolded(): boolean {
        return this.isHolded
    }


    public getFillMode(): boolean {
        return this.fillMode
    }


    public getThickness(): number {
        return this.thickness
    }




    public setCanvasSize(w: number, h: number): void {
        this.CTX.canvas.width = w
        this.CTX.canvas.height = h

        // Remove the transparent BG
        this.setClearedBgColor(0, 0, w, h)
    }


    public setState(state: AppState): void {
        this.state = state
    }


    public setBackground(x1: number, y1: number, x2: number, y2: number, bg: string): void {
        this.CTX.fillStyle = bg
        this.CTX.fillRect(x1, y1, x2, y2)
    }


    public setThickness(num: number): void {
        this.thickness = num
    }


    public setColor(color: string): void {
        this.color = color
    }


    public setHold(value?: boolean): void {
        this.isHolded = value ?? !this.isHolded
    }

}