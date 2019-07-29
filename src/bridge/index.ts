import router from '@/router'

interface DispatchPayload {
  type: string
  [otherKey: string]: any
}

export default function dispatch(payload: string) {
  const { type, ...otherPayload }: DispatchPayload = JSON.parse(payload)
  actionMap[type] && actionMap[type](otherPayload)
}

const actionMap: { [key: string]: (payload: any) => any } = {
  sampleActionFromCpp(payload: any) {
    router.replace({
      name: 'about'
    })
  }
}
