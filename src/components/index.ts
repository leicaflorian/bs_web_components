import BwcButton from './Button/BwcButton.ce.vue'
import BwcSelect from './Form/BwcSelect.ce.vue'
import BwcForm from './Form/BwcForm.ce.vue'
import BwcInput from './Form/BwcInput.ce.vue'

// import { defineCustomElement } from 'vue'
import { defineCustomElement } from '../composables/defineCustomComponent'

const BwcButtonCE = defineCustomElement(BwcButton)
const BwcFormCE = defineCustomElement(BwcForm)
const BwcSelectCE = defineCustomElement(BwcSelect)
const BwcInputCE = defineCustomElement(BwcInput)

// export individual elements
export { BwcButtonCE, BwcSelectCE, BwcFormCE, BwcInputCE }

export function register () {
  customElements.define('bwc-button', BwcButtonCE)
  customElements.define('bwc-form', BwcFormCE)
  customElements.define('bwc-input', BwcInputCE)
  customElements.define('bwc-select', BwcSelectCE)
}

register()

declare global {
  interface HTMLElementTagNameMap {
    'bwc-button': typeof BwcButtonCE;
    'bwc-form': typeof BwcFormCE;
    'bwc-input': typeof BwcInputCE;
    'bwc-select': typeof BwcSelectCE;
  }
}
