import { OptionFunction } from "../interfaces/MainInterfaces"
import Dropdown from "./Client"


const menuAction = (dd: Dropdown, func: OptionFunction): void => {
    dd.switchActive()
    dd.shrinkMenu()

    func()
}


export default menuAction