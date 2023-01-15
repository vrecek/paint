
// Search for attached rubber mark and delete if present 
const removeRubberIfAttached = (): void => {
    const currentSpan: Element | null = document.querySelector('.cursor-rubber-mark') ?? null

    if (currentSpan)
        currentSpan.remove()
}

// Create rubber mark on the cursor's position
const markRubberCursor = (e: MouseEvent, thickness: number): void => {
    removeRubberIfAttached()

    const {clientX, clientY} = e

    const span = document.createElement('span')
    span.className = 'cursor-rubber-mark'

    // Assign styles
    // Multiply current thickness by 10 (2 -> 20, 10 -> 100)
    // And apply to the left/top position and width/height, just to be centered
    const thick: number = thickness * 10
    Object.assign(span.style, {
        position: 'fixed',
        left: `${clientX - thick / 2}px`,
        top: `${clientY - thick / 2}px`,
        width: `${thick}px`,
        height: `${thick}px`,
        background: '#efbfff',
        border: '1px solid #7d10a1',
        pointerEvents: 'none'

    } as CSSStyleDeclaration)


    document.body.appendChild(span)
}



export {
    markRubberCursor,
    removeRubberIfAttached
}