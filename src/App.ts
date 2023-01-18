import { AppState, SaveDialogResult, Handlers, RectangleValues, OpenDialogResult, DrawValues, LineValues, ClearEnum, FillCondition } from "./interfaces/AppInterfaces";

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
    private lineValues: LineValues

    private data: ImageData[]

    private background: string



    public constructor(canvas: HTMLCanvasElement) {
        this.isHolded = false
        this.state = AppState.DRAW

        this.thickness = 3
        this.color = '#000000'
        this.fillMode = false

        this.canvas = canvas
        this.CTX = canvas.getContext('2d', {willReadFrequently: true})

        this.drawValues = []
        this.rectValues = {
            startPos: null,
            w: 0,
            h: 0
        }
        this.lineValues = null

        this.data = []

        this.background = 'rgb(221, 221, 221)'
    }




    private clearValues(type: ClearEnum): void {
        if (type === 'rect')
            this.rectValues = {
                startPos: null,
                w: 0,
                h: 0
            }

        else if (type === 'draw')
            this.drawValues = []

        else if (type === 'line')
            this.lineValues = null
    }

    private setClearedBgColor(x: number, y: number, w: number, h: number): void {
        this.CTX.beginPath()
        this.CTX.rect(x, y, w, h)
        this.CTX.fillStyle = this.background
        this.CTX.fill()
    }

    private mouseFinishAction(): void {
        this.clearValues('rect')
        this.clearValues('draw')
        this.clearValues('line')
    }

    private rgbToHex([r, g, b]: Uint8ClampedArray): string {
        return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}000000`.slice(0, 7)
    }

    private fillLoops(loopVar: number, cursorX: number, currentColor: string, type: 'inc' | 'dec'): void {
        // Determine main loop condition
        // If type is 'dec' decrement value and loop till it isn't 0 (move to top)
        // If type is 'inc' increment value and loop till it isn't more than canvas height (move to bottom)
        let fillCondition: FillCondition = type === 'dec'
            ? () => { loopVar--; return loopVar > 0 }
            : () => { loopVar++; return loopVar < this.CTX.canvas.height }


        // Start from clicked X position and move vertically. 
        // Loop through left and right pixels and determine which should be colored
        while ( fillCondition() ) {
            let left: number = cursorX,
                right: number = cursorX


            // Get pixel's color and break if its different than clicked color
            const clr = this.rgbToHex(this.CTX.getImageData(cursorX, loopVar, 1, 1).data)
            if (clr !== currentColor) break


            // Get left pixel and break if its color is different than clicked color
            while (left--) {
                const clr = this.rgbToHex(this.CTX.getImageData(left, loopVar, 1, 1).data)
                if (clr !== currentColor) break
            }

            // Get right pixel and break if its color is different than clicked color
            while (right++) {
                const clr = this.rgbToHex(this.CTX.getImageData(right, loopVar, 1, 1).data)
                if (clr !== currentColor) break
            }


            // Color the determined line of pixels
            this.CTX.fillStyle = this.color
            this.CTX.beginPath()
            this.CTX.rect(
                left,
                loopVar,
                Math.abs(right - left),
                1
            )
            this.CTX.fill()
        }
    }

    private addCanvasSnapshot(): void {
        // Save current canvas data. Maximum snapshots: 5
        this.data.unshift(this.CTX.getImageData(0, 0, this.canvas.width, this.canvas.height))

        if (this.data.length > 5)
            this.data.pop()
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


        // Load previous canvas data
        this.CTX.putImageData(this.data[0], 0, 0)


        // Start drawing a new rectangle
        // Start at starting position, then set an actual width and height
        this.CTX.beginPath()
        this.CTX.rect(
            this.rectValues.startPos[0], 
            this.rectValues.startPos[1], 
            this.rectValues.w, 
            this.rectValues.h
        )


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
        this.rectValues.w = offsetX - startX
        this.rectValues.h = offsetY - startY
    }

    // Line tool
    public line(e: MouseEvent): void {
        const {offsetX, offsetY} = e
        
        // Set starting position
        if (!this.lineValues)
            this.lineValues = [offsetX, offsetY]


        // Load previous canvas state
        this.CTX.putImageData(this.data[0], 0, 0)


        // Set color and thickness
        this.CTX.strokeStyle = this.color
        this.CTX.lineWidth = this.thickness


        // Draw current line
        this.CTX.beginPath()
        this.CTX.moveTo(...this.lineValues)
        this.CTX.lineTo(offsetX, offsetY)
        this.CTX.stroke()
    }

    // Rubber tool
    public clear(e: MouseEvent): void {
        const {offsetX, offsetY} = e

        // More thickness is, more space will be cleared
        const thick: number = this.thickness * 10

        // Center the clearing field to the cursor's tip
        this.setClearedBgColor(
            offsetX - thick / 2, 
            offsetY - thick / 2, 
            thick, 
            thick
        )
    }

    // Fill tool
    public fill(e: MouseEvent): void {
        const {offsetX, offsetY} = e

        // Get clicked pixel's color
        const currentColor = this.rgbToHex(this.CTX.getImageData(offsetX, offsetY, 1, 1).data)

        let top: number = offsetY + 1
        let bottom: number = offsetY

        // Start the loops: fill from middle to top, and fill from middle to bottom
        this.fillLoops(top, offsetX, currentColor, 'dec')
        this.fillLoops(bottom, offsetX, currentColor, 'inc')
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

            this.mouseFinishAction()

            leaveFunc(this, e)
        }
    
        // When mouse button is released
        this.canvas.onmouseup = (e: MouseEvent): void => {
            this.isHolded = false

            this.mouseFinishAction()

            this.addCanvasSnapshot()

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



    // Save canvas as JPEG
    public async saveCanvas(): Promise<void> {
        // Get canvas data in base64
        const data = this.canvas.toDataURL('image/jpeg')
                                .replace('data:image/jpeg;base64,', '')

                               
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

        this.setClearedBgColor(0, 0, width, height)
        this.addCanvasSnapshot()
    }



    // Reverse changes
    public reverseChanges(): void {
        if (!this.data?.[1]) return

        this.CTX.putImageData(this.data[1], 0, 0)
        this.data.shift()
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

        // Save initial canvas data
        this.data.unshift(this.CTX.getImageData(0, 0, w, h))
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