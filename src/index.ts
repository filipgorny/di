import 'reflect-metadata'

import { Container } from "./container";
export { Container };
export { Inject } from './decorators'

export const createContainer = (): Container => new Container()
