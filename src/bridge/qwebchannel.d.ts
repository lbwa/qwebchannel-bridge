declare class QWebChannel {
  constructor(
    transport: { send: (payload: string) => void },
    initCallback: (channel: { objects: { [key: string]: any } }) => void
  )
}

export default QWebChannel
