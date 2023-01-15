import { AppState, SaveDialogResult, Handlers, RectangleValues, OpenDialogResult, DrawValues, RectCoords } from "./interfaces/AppInterfaces";

const invoke = window.require('electron').ipcRenderer.invoke;



export default class App {
    private isHolded: boolean
    private state: AppState

    private thickness: number
    private color: string
    private fillMode: boolean

    private CTX: CanvasRenderingContext2D
    private canvas: HTMLCanvasElement

    private drawValues: DrawValues
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

        this.drawValues = []
        this.rectValues = {
            startPos: null,
            w: 0,
            h: 0,
            maxH: 0,
            maxW: 0
        }

        this.background = 'rgb(221, 221, 221)'
    }




    private clearValues(type: 'rect' | 'draw'): void {
        if (type === 'rect')
            this.rectValues = {
                startPos: null,
                w: 0,
                h: 0,
                maxH: 0,
                maxW: 0
            }

        else if (type === 'draw')
            this.drawValues = []
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

        // Push coordinates in to the array
        this.drawValues.push([offsetX, offsetY])

        // Return if there are not exactly 2 values in the array
        if (this.drawValues.length !== 2) return


        const [last, current] = this.drawValues
        
        // Draw a line using beginning and current coordinates
        this.CTX.beginPath()
        this.CTX.moveTo(last[0], last[1])
        this.CTX.lineTo(current[0], current[1])

        // Set color and thickness
        this.CTX.strokeStyle = this.color
        this.CTX.lineWidth = this.thickness

        this.CTX.stroke()

        // Remove last coordinates from the array
        this.drawValues.shift()
    }

    // Rectangle tool 
    public rectangle(e: MouseEvent): void {
        const {offsetX, offsetY} = e

        // Get starting position
        // If it is null get current mouse position and save to startPos
        if (!this.rectValues?.startPos)
            this.rectValues.startPos = [offsetX, offsetY]


        // Destructure starting position, biggest size and width + height
        const [startX, startY] = this.rectValues.startPos
        const {w, h} = this.rectValues
        const [maxW, maxH] = [this.rectValues.maxW, this.rectValues.maxH]


        // Variables for clearing rect 
        let cX: number, cY: number, cW: number, cH: number

        // Multiply thickness by 2 to clear rectangle as well as borders by getting total width/height

        if (h > 0) {

            // If height is more than 0, start clearing from bottom
            cY = startY - this.thickness
            cH = maxH + this.thickness * 2

        } else {

            // Otherwise start clearing from top
            cY = startY + this.thickness
            cH = maxH - this.thickness * 2
        }

        if (w > 0) {

            // If width is more than 0, start clearing from right
            cX = startX - this.thickness
            cW = maxW + this.thickness * 2

        } else {

            // Otherwise start clearing from left
            cX = startX + this.thickness
            cW = maxW - this.thickness * 2
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

        
        // Determine new rectangle size
        const newW: number = offsetX - startX
        const newH: number = offsetY - startY

        this.rectValues.w = newW
        this.rectValues.h = newH


        // Update biggest width and height
        if ((w > 0 && newW > w) || (w < 0 && newW < w)) 
            this.rectValues.maxW = newW

        if ((h > 0 && newH > h) || (h < 0 && newH < h))
            this.rectValues.maxH = newH
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

            this.clearValues('rect')
            this.clearValues('draw')

            leaveFunc(this, e)
        }
    
        // When mouse button is released
        this.canvas.onmouseup = (e: MouseEvent): void => {
            this.isHolded = false

            this.clearValues('rect')
            this.clearValues('draw')

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
        const {canceled, filePath}: SaveDialogResult = await this.invoke('saveDialog')

        if (canceled) return

        // Invoke save action from the main process
        await this.invoke('save', filePath, data)
    }

    // Load image to canvas
    public async loadCanvas(): Promise<void> {

        // Open dialog from the main process and get the file path
        const {canceled, filePaths}: OpenDialogResult = await this.invoke('openDialog'),
               fullPath: string = filePaths[0]


        if (canceled) return

        // If file is not an image, return
        const ext: string = fullPath.slice(fullPath.lastIndexOf('.') + 1)
        if (['png', 'jpg', 'jpeg'].every(x => x !== ext)) return


        // Read image data as base64
        const imageData: string = await this.invoke('open', fullPath)


        // Convert base64 to image element and draw it on canvas
        const img: HTMLImageElement = new Image()
        img.onload = (): void => this.CTX.drawImage(img, 0, 0)
        img.src = `data:image/${ext};base64,${imageData}`
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