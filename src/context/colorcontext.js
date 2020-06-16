import { createContext } from 'react'

export const ColorContext = createContext({
    didRedirect: false, 
    playerDidRedirect: () => {}, 
    playerDidNotRedirect: () => {}
})