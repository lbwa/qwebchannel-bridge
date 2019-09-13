export const isQtClient = (function() {
  return navigator.userAgent.includes('QtWebEngine')
})()

export function assert(condition: any, msg: string) {
  if (!condition) throw new Error(`[ASSERT]: ${msg || condition}`)
}

export function log(msg: string) {
  /* eslint-disable-next-line */
  console.log(
    `
%c${msg}
  `,
    'font-weight: bold;'
  )
}
