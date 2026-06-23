export type WalkAction =
  | 'forward'
  | 'backward'
  | 'left'
  | 'right'
  | 'lookUp'
  | 'lookDown'
  | 'lookLeft'
  | 'lookRight'
  | 'sprint'

export const walkControls: Record<WalkAction, boolean> & { enabled: boolean } = {
  enabled: false,
  forward: false,
  backward: false,
  left: false,
  right: false,
  lookUp: false,
  lookDown: false,
  lookLeft: false,
  lookRight: false,
  sprint: false,
}

export function setWalkAction(action: WalkAction, pressed: boolean) {
  walkControls[action] = pressed
}

export function setTouchWalkEnabled(enabled: boolean) {
  walkControls.enabled = enabled
  if (!enabled) resetWalkControls()
}

export function resetWalkControls() {
  for (const action of Object.keys(walkControls) as Array<keyof typeof walkControls>) {
    if (action !== 'enabled') walkControls[action] = false
  }
}
