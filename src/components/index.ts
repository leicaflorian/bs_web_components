import BwcButton from './Button/BwcButton.ce.vue'
import BwcSelect from './Form/BwcSelect.ce.vue'
import BwcForm from './Form/BwcForm.ce.vue'
// import { defineCustomElement } from 'vue'
import { defineCustomElement } from '../composables/defineCustomComponent'

const BwcButtonCE = defineCustomElement(BwcButton)
const BwcSelectCE = defineCustomElement(BwcSelect)
const BwcFormCE = defineCustomElement(BwcForm)

// export individual elements
export { BwcButtonCE, BwcSelectCE }

export function register () {
  customElements.define('bwc-button', BwcButtonCE)
  customElements.define('bwc-select', BwcSelectCE)
  customElements.define('bwc-form', BwcFormCE)
}

register()

declare global {
  interface HTMLElementTagNameMap {
    'bwc-button': typeof BwcButtonCE;
    'bwc-select': typeof BwcSelectCE;
  }
}
