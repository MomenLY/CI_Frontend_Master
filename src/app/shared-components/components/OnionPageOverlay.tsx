import { ReactNode } from "react"

type Props = {
    children: ReactNode
}
export default function OnionPageOverlay({children}:Props) {
  return (
    <div className="md:p-24 p-16 w-full">
      {children}
    </div>
  )
}
