/**
 * client.ts — Core JSON-RPC 2.0 Engine with Session Caching & Auto-Reconnect
 * Syailendra Group ERP
 */

import type { JsonRpcPayload, JsonRpcResponse, OdooConfig, OdooDomain, OdooFieldValue, OdooRpcArg } from './types'

export class OdooClient {
  private config: OdooConfig
  private uid: number | null = null
  private reqId = 1

  constructor(customConfig?: Partial<OdooConfig>) {
    this.config = {
      baseUrl: customConfig?.baseUrl || process.env.ODOO_BASE_URL || 'http://10.10.0.238:8069',
      db: customConfig?.db || process.env.ODOO_DB || 'odoo_dev',
      username: customConfig?.username || process.env.ODOO_USERNAME || '',
      password: customConfig?.password || process.env.ODOO_PASSWORD || '',
      apiKey: customConfig?.apiKey || process.env.ODOO_API_KEY
    }
  }

  /**
   * Execute raw JSON-RPC 2.0 POST call
   */
  async rpc<T>(service: 'common' | 'object', method: string, args: OdooRpcArg[]): Promise<T> {
    const url = `${this.config.baseUrl}/jsonrpc`
    const payload: JsonRpcPayload<OdooRpcArg[]> = {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        service,
        method,
        args
      },
      id: this.reqId++
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      cache: 'no-store'
    })

    if (!res.ok) {
      throw new Error(`Odoo HTTP Error: ${res.status} ${res.statusText}`)
    }

    const data: JsonRpcResponse<OdooFieldValue> = (await res.json()) as JsonRpcResponse<OdooFieldValue>
    if (data.error) {
      const errMsg = data.error.data?.message || data.error.message || 'Unknown Odoo RPC error'
      throw new Error(`Odoo RPC [${service}.${method}]: ${errMsg}`)
    }

    return data.result as T
  }

  /**
   * Authenticate with specific user credentials (used in Login form)
   */
  async authenticateWithCredentials(db: string, login: string, password: string): Promise<number | false> {
    const res = await this.rpc<number | false>('common', 'authenticate', [db, login, password, {}])
    return res
  }

  /**
   * Authenticate with system server credentials (cached for system services)
   */
  async authenticate(): Promise<number> {
    if (this.uid !== null) {
      return this.uid
    }

    const secret = this.config.apiKey || this.config.password
    if (!secret) {
      throw new Error('Missing Odoo password or API key for authentication')
    }

    const uid = await this.rpc<number | false>('common', 'authenticate', [this.config.db, this.config.username, secret, {}])

    if (!uid) {
      throw new Error(`Authentication failed for user '${this.config.username}' on database '${this.config.db}'`)
    }

    this.uid = uid
    return uid
  }

  /**
   * Execute ORM method via object.execute_kw
   */
  async executeKw<T>(model: string, method: string, args: OdooRpcArg[] = [], kwargs: Record<string, OdooFieldValue> = {}): Promise<T> {
    const uid = await this.authenticate()
    const secret = this.config.apiKey || this.config.password || ''

    return this.rpc<T>('object', 'execute_kw', [this.config.db, uid, secret, model, method, args, kwargs])
  }

  /**
   * Universal search_read query wrapper
   */
  async searchRead<T>(
    model: string,
    domain: OdooDomain = [],
    fields: string[] = [],
    options: { offset?: number; limit?: number; order?: string } = {}
  ): Promise<T[]> {
    return this.executeKw<T[]>(model, 'search_read', [domain], {
      fields,
      offset: options.offset || 0,
      limit: options.limit || 80,
      order: options.order || 'id desc'
    })
  }

  /**
   * Create a new record in model
   */
  async create<T = number>(model: string, values: Record<string, OdooFieldValue>): Promise<T> {
    return this.executeKw<T>(model, 'create', [values])
  }

  /**
   * Update existing record(s) in model
   */
  async write(model: string, ids: number[], values: Record<string, OdooFieldValue>): Promise<boolean> {
    return this.executeKw<boolean>(model, 'write', [ids, values])
  }

  /**
   * Delete existing record(s) in model
   */
  async unlink(model: string, ids: number[]): Promise<boolean> {
    return this.executeKw<boolean>(model, 'unlink', [ids])
  }
}

export const odooClient = new OdooClient()
