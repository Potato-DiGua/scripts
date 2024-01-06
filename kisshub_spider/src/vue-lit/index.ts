import { TemplateResult, render } from 'lit-html'
import {
  shallowReactive,
  effect
} from '@vue/reactivity'

let currentInstance


export type factoryType = (props: any)=>()=>TemplateResult<1>;

export function defineComponent(name: string, factory: factoryType):void;
export function defineComponent(name: string, propDefs:string[], factory: factoryType):void;
export function defineComponent(name: string, propDefs: any, factory?: any) {
  if (typeof propDefs === 'function') {
    factory = propDefs
    propDefs = []
  }

  customElements.define(
    name,
    class extends HTMLElement {
      static get observedAttributes() {
        return propDefs
      }
      constructor() {
        super()
        const props = (this._props = shallowReactive({}))
        currentInstance = this
        const template = factory.call(this, props)
        currentInstance = null
        this._bm && this._bm.forEach((cb) => cb())
        const root = this.attachShadow({ mode: 'closed' })
        let isMounted = false
        effect(() => {
          if (isMounted) {
            this._bu && this._bu.forEach((cb) => cb())
          }
          console.log('beforeRender');
          render(template(), root)
          if (isMounted) {
            this._u && this._u.forEach((cb) => cb())
          } else {
            isMounted = true
          }
        })
      }
      connectedCallback() {
        this._m && this._m.forEach((cb) => cb())
      }
      disconnectedCallback() {
        this._um && this._um.forEach((cb) => cb())
      }
      attributeChangedCallback(name, oldValue, newValue) {
        this._props[name] = newValue
      }
    }
  )
}

function createLifecycleMethod(name) {
  return (cb) => {
    if (currentInstance) {
      ;(currentInstance[name] || (currentInstance[name] = [])).push(cb)
    }
  }
}

export const onBeforeMount = createLifecycleMethod('_bm')
export const onMounted = createLifecycleMethod('_m')
export const onBeforeUpdate = createLifecycleMethod('_bu')
export const onUpdated = createLifecycleMethod('_u')
export const onUnmounted = createLifecycleMethod('_um')