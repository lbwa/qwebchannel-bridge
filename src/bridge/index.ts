import router from '@/router'

interface DispatchPayload {
  type: string
  [otherKey: string]: any
}

export default function dispatch(payload: string) {
  const { type, ...otherPayload }: DispatchPayload = JSON.parse(payload)

  /**
   * @description Respect any non-root url like AliPay redirect uri
   * This 'if' expression is used to prevent any unexpected redirect uri
   * override from any external web site.
   * Because JS will always communicate with Cpp server in 'init.ts' when page
   * loaded, and Cpp will always will invoke initCallback, means 'dispatch'
   * function will always be invoked.
   */
  if (/.+\/#\/$/.test(location.href)) {
    actionMap[type] && actionMap[type](otherPayload)
  }
}

const actionMap: { [key: string]: (payload: any) => any } = {
  sampleActionFromCpp(payload: any) {
    router.replace({
      name: 'about'
    })
  }
}
