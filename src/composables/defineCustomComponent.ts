import { VueElement, VueElementConstructor } from 'vue'

export function defineCustomElement (Comp: any, hydrate?: any): VueElementConstructor {
  class VueCustomElement extends VueElement {
    static def = Comp
    
    public value
    
    constructor (initialProps?: Record<string, any>) {
      super(Comp, initialProps, hydrate)
      
      this.value = this.getAttribute("value")
      
      this.addEventListener('update:modelValue', (e) => {
        this.value = (e as CustomEvent).detail[0].value
      })
    }
  
    public get selectedOptions() {
      return this["_instance"].exposed.selectedOptions.value
    }
    
    connectedCallback() {
      super.connectedCallback()
      
      // this.initObserver()
    }
    
    initObserver () {
      /*const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          console.log(mutation)
          if (mutation.type === 'attributes') {
          }
        })
      })*/
      
      /*observer.observe(this, {
        attributes: true //configure it to listen to attribute changes
      })*/
    }
  }
  
  return VueCustomElement
}
