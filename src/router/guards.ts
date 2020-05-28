import { switchRouterLoaded } from '@/bridge/helper'

function ensureRouterLoaded() {
  switchRouterLoaded()
}

export const afterEach = [ensureRouterLoaded]
