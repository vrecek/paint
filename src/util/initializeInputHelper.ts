const initalizeInputHelper = (cname: string, func: (value: string) => void): void => {
    const [input, label] = [...document.querySelector(`.${cname}`).children] as [HTMLInputElement, Element]

    input.onchange = (): void => {
        const {value} = input

        func(value)

        label.children[0].textContent = value
    }
}

export default initalizeInputHelper