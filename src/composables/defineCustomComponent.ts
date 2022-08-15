import { VueElement, VueElementConstructor } from 'vue'

export function defineCustomElement (Comp: any, hydrate?: any): VueElementConstructor {
  
  class VueCustomElement extends VueElement {
    static def = Comp
    
    public value
    private _instance: any
    
    constructor (initialProps?: Record<string, any>) {
      super(Comp, initialProps, hydrate)
      
      this.value = this.getAttribute('value')
      
      this.addEventListener('update:modelValue', (e) => {
        this.value = (e as CustomEvent).detail[0].value
      })
    }
    
    /*
    public get selectedOptions () {
      return this['_instance'].exposed.selectedOptions.value
    }*/
    
    connectedCallback () {
      super.connectedCallback()
      
      this.exposeNecessaryKeys()
    }
    
    exposeNecessaryKeys () {
      // @ts-ignore
      const toExpose = this._instance.exposed
      
      if (!toExpose) {
        return
      }
      
      const keys = Object.keys(toExpose)
      
      keys.forEach(key => {
        //TODO:: must handle function type properties
        
        if (toExpose[key] instanceof Function) {
          Object.defineProperty(this, key, {
            value: toExpose[key]
          })
        } else {
          Object.defineProperty(this, key, {
            get (): any {
              return toExpose[key].value
            }
          })
        }
      })
    }
    
  }
  
  return VueCustomElement
}
