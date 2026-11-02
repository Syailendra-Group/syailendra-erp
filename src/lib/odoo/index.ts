/**
 * index.ts — Low-Level RPC Transport Gateway for Syailendra Group Odoo Services
 */

import { odooClient } from './client'

export * from './types'
export * from './client'

export const odoo = {
  client: odooClient
}

export default odoo
