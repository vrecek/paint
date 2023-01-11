// DropDown types
namespace DD {
    export abstract class DropDown {
        public abstract expandMenu(hiddenList: HTMLElement, display?: DD.DisplayType): void 
        public abstract shrinkMenu(hiddenList?: HTMLElement, display?: DD.DisplayType): void
        public abstract rotateArrow(arrow: HTMLElement): void
        public abstract switchActive(): void
        public abstract get getActive(): boolean
    }

    export type DisplayType = 'block' | 'flex'

    export type ReturnedHeight = {
        height: number
        marginTop: number
        marginBottom: number
    }

    export type BoxProps = {
        mTop: number
        mBottom: number
    } | null
}


class Dropdown extends DD.DropDown {
    private active: boolean
    private activeList: HTMLElement | null

    private boxProps: DD.BoxProps

    private transitionMsc: number


    private returnHeight(list: HTMLElement, display?: DD.DisplayType): DD.ReturnedHeight {
        list.style.height = 'auto'
        list.style.display = display ?? 'block'

        const getValueOfProperty = (property: string) => {
            return parseFloat(window.getComputedStyle(list, null).getPropertyValue(property)
                                .split('')
                                .filter(x => /[0-9.]/ig.test(x) )
                                .join('')
                            )
        }
        
        const height: number = getValueOfProperty('height')

        if(!this.boxProps) {
            const marginTop: number = getValueOfProperty('margin-top'),
                  marginBottom: number = getValueOfProperty('margin-bottom')


            this.boxProps = {
                mTop: marginTop,
                mBottom: marginBottom
            }
        }

        return {
            height, 
            marginTop: this.boxProps.mTop, 
            marginBottom: this.boxProps.mBottom
        }
    }

    private zeroListProperties(list: HTMLElement): void {
        list.style.marginTop = '0'
        list.style.marginBottom = '0'
        list.style.height = '0'
        list.style.overflow = 'hidden'
    }

    private calculateListProperties(list: HTMLElement, values: DD.ReturnedHeight): void {
        const {marginBottom, marginTop, height} = values

        list.style.marginTop = `${ marginTop }px`
        list.style.marginBottom = `${ marginBottom }px`
        list.style.height = `${ height }px`
    }


    public constructor(transitionMsc: number) {
        super()

        this.active = false
        this.activeList = null
        this.boxProps = null
        this.transitionMsc = transitionMsc
    }


    /**
        * @info Use height: 0, display: none, overflow: hidden IF USED FIRST 
        * @param hiddenList Your list to expand
        * @param display Optional - block or flex
    */
    public expandMenu(hiddenList: HTMLElement, display?: DD.DisplayType): void {
        if(!this.active) return

        const VALUES: DD.ReturnedHeight = this.returnHeight(hiddenList, display)
        
        hiddenList.style.transition = '0'
        this.zeroListProperties(hiddenList)
        
        setTimeout(() => {
            this.activeList = hiddenList
            
            hiddenList.style.transition = `${this.transitionMsc}ms`
            this.calculateListProperties(hiddenList, VALUES)

            setTimeout(() => hiddenList.style.overflow = 'visible', this.transitionMsc)
        }, 5);
    }


    /**
        * @param hiddenList Optional - Pass list to shrink, if you want to shrink list first
        * @param display Optional - block or flex
    */
    public shrinkMenu(hiddenList?: HTMLElement, display?: DD.DisplayType): void {
        if(!this.activeList && hiddenList) {
            const VALUES: DD.ReturnedHeight = this.returnHeight(hiddenList, display)

            this.calculateListProperties(hiddenList, VALUES)

            setTimeout(() => {
                hiddenList.style.overflow = 'hidden'
                this.zeroListProperties(hiddenList)

                setTimeout(() => {
                    hiddenList.style.display = 'none'
                }, this.transitionMsc);
            }, 5);

            return
        }
        
        if(this.active || !this.activeList) return

        const item = this.activeList

        item.style.overflow = 'hidden'
        this.zeroListProperties(item)

        this.activeList = null

        setTimeout(() => {
            item.style.display = 'none'
        }, this.transitionMsc);
    }  


    /**
        * @param arrow Rotates passed element (presumably arrow icon to indicate expanded list)
    */
    public rotateArrow(arrow: HTMLElement): void {
        this.active
            ? arrow.style.transform = 'rotate(180deg)'
            : arrow.style.transform = 'rotate(0)'
    }


    /**
        * @info Default {active} variable is false 
    */
    public switchActive(): void { 
        this.active = !this.active 
    }


    public get getActive(): boolean { 
        return this.active 
    }
}


export default Dropdown