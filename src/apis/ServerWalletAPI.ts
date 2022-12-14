/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { SERVER_URL } from '../constants'
import axios, { AxiosInstance } from 'axios'

export type NftDataRarity = 'common' | 'rare' | 'epic'

export type NftWordDataPosition = 'noun' | 'verb' | 'adjective'

export interface NftWordData {
  position: NftWordDataPosition
  content: {
    en: string
    zh: string
  }
}

export interface NftData {
  tokenClassId: number
  tid: number
  holder: string
  fixed: boolean
  fixedAt?: string
  fixedAtBlock?: number
  class: {
    color: string
    id: number
    rarity: NftDataRarity
    typeArgs: string
  }
  sentence: NftWordData
  exercised: boolean
  exercisedAt?: string
  exercisedAtBlock?: number
  refreshedAt?: string
  refreshedAtBlock?: number
}

export interface RecnetFixData {
  tid: number
  sentence: {
    en: string
    zh: string
  }
}

export class ServerWalletAPI {
  private readonly axios: AxiosInstance

  constructor() {
    this.axios = axios.create({ baseURL: SERVER_URL })
  }

  async getNfts(address: string): Promise<NftData[]> {
    const url = `/nfts/${address}`
    return await this.axios.get<NftData[]>(url).then((resp) => resp.data)
  }

  getImageUrl(nft: NftData, size: 'normal' | 'small' = 'normal'): string {
    const { tid, refreshedAtBlock } = nft
    // prettier-ignore
    const url = `${SERVER_URL.endsWith('/') ? SERVER_URL.slice(0, -1) : SERVER_URL}/renderer/${nft.class.rarity
      }.png?tid=${tid}&size=${size}&_=${String(refreshedAtBlock)}`

    return url
  }

  async fixNft(
    rarity: string | number,
    tid: string | number,
    tx: object
  ): Promise<any> {
    const url = `/v2/fix/${rarity}/${tid}`
    return await this.axios.post<any>(url, { tx }).then((resp) => resp.data)
  }

  async addWords(
    rarity: string | number,
    tid: string | number,
    words: NftWordData[],
    tx: object
  ): Promise<any> {
    const url = `/v2/add/${rarity}/${tid}`
    return await this.axios
      .post<any>(url, { words, tx })
      .then((resp) => resp.data)
  }

  async getRecnetFix(): Promise<RecnetFixData[]> {
    const url = '/fix/recent'
    return await this.axios.get(url).then((resp) => resp.data)
  }

  async refreshNft(
    rarity: string | number,
    tid: string | number,
    tx: object
  ): Promise<any> {
    const url = `/v2/refresh/${rarity}/${tid}`
    return await this.axios.post<any>(url, { tx }).then((resp) => resp.data)
  }

  async getRefreshGen(
    rarity: string | number,
    tid: string | number
  ): Promise<any> {
    const url = `/gen/refresh/${rarity}/${tid}`
    return await this.axios.post<any>(url).then((resp) => resp.data)
  }

  async getFixGen(rarity: string | number, tid: string | number): Promise<any> {
    const url = `/gen/fix/${rarity}/${tid}`
    return await this.axios.post<any>(url).then((resp) => resp.data)
  }

  async getAddWordsGen(
    rarity: string | number,
    tid: string | number,
    words: NftWordData[]
  ): Promise<any> {
    const url = `/gen/add/${rarity}/${tid}`
    return await this.axios.post<any>(url, { words }).then((resp) => resp.data)
  }
}

const serverWalletAPI = new ServerWalletAPI()

export default serverWalletAPI
