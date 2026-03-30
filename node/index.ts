import { Service, ServiceContext, RecorderState } from '@vtex/api'

import { Clients } from './clients'
import { faleConosco } from './middlewares/faleConosco'

declare global {
  type Context = ServiceContext<Clients, RecorderState>
}

export default new Service<Clients, RecorderState, Context>({
  clients: {
    implementation: Clients,
    options: {},
  },
  routes: {
    faleConosco,
  },
})
