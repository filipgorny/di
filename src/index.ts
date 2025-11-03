import 'reflect-metadata'

import { Container } from "./container";
export { Container };
export { Inject } from './decorators'
export { useContainer } from './hooks'

export const createContainer = (): Container => new Container()
