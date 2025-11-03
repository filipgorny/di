import 'reflect-metadata'

import { Container } from "./container";
export { Container };
export { Inject } from './decorators'
export { useContainer, ContainerProvider } from './hooks'

export const createContainer = (): Container => new Container()
