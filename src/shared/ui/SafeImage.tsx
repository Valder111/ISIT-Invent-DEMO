import { useEffect, useMemo, useState } from 'react'
import tmpInventory from '../../assets/images/tmp_inventory.png'
import { staticAssetUrl } from '../lib/staticAssetUrl'

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src?: string | null
}

export function SafeImage({ src, onError, ...rest }: Props) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  const finalSrc = useMemo(() => {
    if (!src) return tmpInventory
    return failed ? tmpInventory : staticAssetUrl(src)
  }, [failed, src])

  return (
    <img
      {...rest}
      src={finalSrc}
      onError={(e) => {
        setFailed(true)
        onError?.(e)
      }}
    />
  )
}

