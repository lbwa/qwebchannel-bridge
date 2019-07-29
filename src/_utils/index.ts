export const isQtClient = (function() {
  return navigator.userAgent.includes('QtWebEngine')
})()

export function assert(condition: any, msg: string) {
  if (!condition) throw new Error(`[ASSERT]: ${msg || condition}`)
}
