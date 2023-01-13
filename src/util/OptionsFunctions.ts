import { OptionFunction } from "../interfaces/MainInterfaces"
import Dropdown from "./Client"


// Hide the dropdown menu when clicked
// And call the passed function
const menuAction = (dd: Dropdown, func: OptionFunction): void => {
    dd.switchActive()
    dd.shrinkMenu()

    func()
}


export default menuAction