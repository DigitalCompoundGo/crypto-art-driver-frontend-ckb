import React, { useEffect, useMemo, useState } from 'react'
import CommonPageTitle from '../../components/CommonPageTitle'
import Unipass from '../../store/unipass'
import serverWalletAPI, { NftData } from '../../apis/ServerWalletAPI'
import CommonModal, { CommonModalProps } from '../../components/CommonModal'
import message from '../../components/CommonMessage'
import './style.scss'

interface NftFixModalProps extends CommonModalProps {
  data: NftData | null
  onOk: (data: NftData) => void
}

const NftFixModal: React.FC<NftFixModalProps> = ({ data, onOk, ...rest }) => {
  if (!data) {
    return <></>
  }

  const { tid } = data

  const handleOk = (): void => {
    if (!data) return
    onOk(data)
  }

  return (
    <CommonModal {...rest} title={`Fix #${tid}`} className="nft-fix-modal">
      <div className="content">
        <div className="desc">Are you sure to fix this nft?</div>
        <div className="opts">
          <button onClick={handleOk}>Yes</button>
          <button className="cancel" onClick={rest.onClose}>
            Cancel
          </button>
        </div>
      </div>
    </CommonModal>
  )
}

interface NftCardProps {
  data: NftData
  onFix: (data: NftData) => void
}

const NftCard: React.FC<NftCardProps> = ({ data, onFix }) => {
  const [loading, setLoading] = useState(true)
  const url = useMemo(() => serverWalletAPI.getImageUrl(data), [data])

  const handleLoad = (): void => {
    setLoading(false)
  }

  return (
    <div className="nft-card" onClick={() => onFix(data)}>
      <div className="img">
        <img src={url} alt="" onLoad={handleLoad} />
        {loading && <div className="loading">Loading...</div>}
      </div>
      <div className="tid">#{data.tid}</div>
    </div>
  )
}

export const Home: React.FC = () => {
  const [modalVisible, showModal] = useState(false)
  const [nfts, setNfts] = useState<NftData[]>([])
  const { address, sign } = Unipass.useContainer()
  const [data, setData] = useState<NftData | null>(null)
  const { waitingSign, setWaitingSign } = Unipass.useContainer()

  useEffect(() => {
    if (!address) return
    serverWalletAPI
      // .getNfts(
      //   'ckb1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqggv83tqz8vpu43u6zklw9zgxvzytsz7xgnzqksz'
      // )
      .getNfts(address)
      .then((data) => {
        setNfts(data)
        return data
      })
      .then(() => {
        if (waitingSign) {
          return serverWalletAPI
            .fixNft(
              waitingSign.args[0],
              waitingSign.args[1],
              waitingSign.data.sig
            )
            .then(() => {
              message.success('fix success')
              setWaitingSign(null)
            })
        }
      })
      .catch((e) => console.log(e))
  }, [address])

  const handleFix = (data: NftData): void => {
    setData(data)
    showModal(true)
  }

  const handleFixOk = (data: NftData): void => {
    const message = 'TEST'
    sign(message, [
      data.characteristic.rarity.toString(),
      data.tid.toString(),
    ]).catch((e) => console.log(e))
  }

  return (
    <>
      <div id="home">
        <div className="container">
          <CommonPageTitle lines={['My Nfts']} />
          <div className="cards">
            {nfts.map((nft, i) => (
              <NftCard data={nft} key={i} onFix={handleFix} />
            ))}
          </div>
          {nfts.length === 0 && (
            <div className="empty">
              {address ? 'You have no nft yet' : 'Please connect wallet'}
            </div>
          )}
        </div>
      </div>
      <NftFixModal
        data={data}
        visible={modalVisible && !!data}
        onClose={() => showModal(false)}
        onOk={handleFixOk}
      />
    </>
  )
}
