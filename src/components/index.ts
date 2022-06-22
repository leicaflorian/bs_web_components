import BwcButton from './Button/BwcButton.ce.vue'
import BwcSelect from './Form/BwcSelect.ce.vue'
// import { defineCustomElement } from 'vue'
import { defineCustomElement } from '../composables/defineCustomComponent'

const BwcButtonCE = defineCustomElement(BwcButton)
const BwcSelectCE = defineCustomElement(BwcSelect)

// export individual elements
export { BwcButtonCE, BwcSelectCE }

export function register () {
  customElements.define('bwc-button', BwcButtonCE)
  customElements.define('bwc-select', BwcSelectCE)
}

register()

declare global {
  interface HTMLElementTagNameMap {
    'bwc-button': typeof BwcButtonCE;
    'bwc-select': typeof BwcSelectCE;
  }
}
