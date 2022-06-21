import { defineCustomElement } from 'vue'
import BwcButton from './Button/BwcButton.ce.vue'
import BwcSelect from './Form/BwcSelect.ce.vue'

const BwcButtonCE = defineCustomElement(BwcButton)
const BwcSelectCE = defineCustomElement(BwcSelect)

customElements.define('bwc-button', BwcButtonCE)
customElements.define('bwc-select', BwcSelectCE)

declare global {
  interface HTMLElementTagNameMap {
    'bwc-button': typeof BwcButtonCE;
    'bwc-select': typeof BwcSelectCE;
  }
}
