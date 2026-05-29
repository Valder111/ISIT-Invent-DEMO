import { fileHandlers } from './files'
import { extraHandlers } from './extra'
import { routeHandlers } from './routes'

/** MSW: file/demo-files first; extra routes before legacy where order matters. */
export const handlers = [...fileHandlers, ...extraHandlers, ...routeHandlers]
