interface PlainObject<T = any> {
  [key: string]: T
}

interface PlainFunction {
  (...rest: any[]): any
}

interface WebChannelTransport {
  send: (payload: string) => void
  onmessage: (payload: { [key: string]: any }) => void
}

// Map every properties in single Qt side QObject
export interface PublishedObject {
  [prop: string]: any
}

interface PublishedObjects {
  [scope: string]: PublishedObject
}

interface InitCallback {
  (channel: { objects: PublishedObjects }): void
}

interface ExecMessage {
  type: number
  id?: number
  data?: any
}

interface SignalMessage {
  object: string
  signal: number
  args: any
}

interface ResponseMessage {
  id: number
  data: any
}

interface PropertyMessage {
  data: {
    object: any
    signals: PlainObject
    signal?: PlainObject
    properties: PlainObject
  }[]
}

interface QWebChannelConstructor {
  (
    this: QWebChannelInstance,
    transport: WebChannelTransport,
    initCallback: InitCallback
  ): void
  new (
    transport: WebChannelTransport,
    initCallback: InitCallback
  ): QWebChannelInstance
}

interface QWebChannelInstance {
  transport: WebChannelTransport
  execCallbacks: { [key: string]: PlainFunction }
  execId: number
  objects: PublishedObjects
  send: (payload: any) => void
  onmessage: (payload: { data: any; [key: string]: any }) => void
  exec: (data: ExecMessage, callback?: PlainFunction) => void
  handleSignal: (message: SignalMessage) => void
  handleResponse: (message: ResponseMessage) => any
  handlePropertyUpdate: (message: PropertyMessage) => void
  debug: (message: any) => void
}

declare const QWebChannel: QWebChannelConstructor

export default QWebChannel
