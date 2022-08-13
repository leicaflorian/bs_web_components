<template>
  <form :action="action" :method="submitMethod"
        @submit="onSubmit"
        v-bind="$attrs"
        ref="formEl">
    <!-- For Laravel forms -->
    <input type="hidden" name="_method" :value="method">

    <slot></slot>
  </form>
</template>

<script lang="ts">
import {
  computed,
  onMounted,
  PropType, reactive,
  Ref, watch
} from 'vue'
import { FormSubmitMethod } from '../../enums/FormSubmitMethod'
import { ref } from '@vue/reactivity'

type CustomHTMLElement = HTMLInputElement & { initialValue: string }
type ValidHTMLInputElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | CustomHTMLElement;

export default {
  name: 'BwcForm.ce',
  props: {
    method: {
      type: String as PropType<FormSubmitMethod>,
      default: 'GET'
    },
    action: String,
    ajaxSubmit: {
      type: Boolean,
      default: false
    }
  },
  setup (props, ctx) {
    /**
     * Internal HTMLFormElement
     */
    const formEl: Ref<HTMLFormElement | undefined> = ref()

    /**
     * Array of HTMLElement containing all the inputs of the form
     */
    const formInputs: Ref<ValidHTMLInputElement[]> = ref([])

    /**
     * HTMLButtonElement of the submit button
     */
    const formSubmitBtn = ref()

    /**
     * HTMLButtonElement of the reset button
     */
    const formResetBtn = ref()

    /**
     * Reactive object containing the form data.
     */
    const formData = ref({})

    /**
     * The HTTP method that must be used for the form
     */
    const submitMethod = computed(() => {
      return (props.method?.toUpperCase() !== FormSubmitMethod.GET) ? FormSubmitMethod.POST : FormSubmitMethod.GET
    })

    function onSubmit () {
      if (props.ajaxSubmit) {
        const formData = new FormData(formEl.value)

        formInputs.value.forEach(el => {
          formData.append(el.getAttribute('name'), el.value)
        })

        // TODO:: must implement
        return alert('work in progress...')
      }

      formEl.value?.submit()
    }

    function onReset () {
      formInputs.value?.forEach(el => {
        el.value = 'initialValue' in el ? el.initialValue : ''
        el.dispatchEvent(new CustomEvent('change'))
      })

      formEl.value?.reset()
    }

    function storeInputs () {
      const shadowRoot = formEl.value?.parentNode as DocumentFragment
      const slots: NodeListOf<HTMLSlotElement> = shadowRoot?.querySelectorAll('slot')
      const _inputs: Array<ValidHTMLInputElement> = []

      slots.forEach(slot => {
        const slotElements = slot.assignedElements()
        const parentNode = slotElements[0].parentNode

        _inputs.push(...parentNode.querySelectorAll('[name],[type=submit],[type=reset]'))
      })

      formSubmitBtn.value = _inputs.find(el => 'type' in el && el.type === 'submit')
      formResetBtn.value = _inputs.find(el => 'type' in el && el.type === 'reset')
      formInputs.value = _inputs.filter(el => el.hasAttribute('name'))
    }

    function createHiddenInputs () {
      if (formEl.value instanceof HTMLFormElement) {
        formEl.value.querySelectorAll('[temp-input]').forEach(el => el.remove())
      }

      formInputs.value.forEach(el => {
        const input = document.createElement('input')
        input.setAttribute('temp-input', '')
        input.name = el.name
        input.value = formData.value[el.name]
        input.type = 'hidden'

        formEl.value?.append(input)
      })
    }

    function addWatchers () {
      function addListener (el, callback) {
        if (el.listenerAdded) {
          return
        }

        callback(el)

        Object.defineProperty(el, 'listenerAdded', {
          value: true
        })
      }

      // Watch formEl and add slotchange event listener
      watch(() => formEl.value, (form: HTMLFormElement) => {
        addListener(form, (form) => {
          form.addEventListener('slotchange', function () {
            console.log('slotchange')
            storeInputs()
          })
        })
      }, {
        immediate: true
      })

      // Watch for new available inputs
      watch(() => formInputs.value, (inputs: ValidHTMLInputElement[]) => {
        inputs.forEach(el => {
          Object.defineProperty(el, 'initialValue', {
            value: el.value
          })

          formData.value[el.name] = el.value

          addListener(el, (el) => {
            el.addEventListener('keydown', function (e) {
              if (e.key.toLowerCase() === 'enter') {
                onSubmit()
              }
            })

            el.addEventListener('input', function (e) {
              formData.value[el.name] = el.value
            })

            el.addEventListener('change', function (e) {
              formData.value[el.name] = el.value
            })
          })
        })

        createHiddenInputs()
      })

      // Watch for new Submit button
      watch(() => formSubmitBtn.value, (btn: HTMLButtonElement) => {
        addListener(btn, (btn) => {
          btn.addEventListener('click', onSubmit)
        })
      })

      // Watch for new Reset button
      watch(() => formResetBtn.value, (btn: HTMLButtonElement) => {
        addListener(btn, (btn) => {
          btn.addEventListener('click', onReset)
        })
      })

      // Watch for formData changes to update  hidden fields values
      watch(() => formData.value, (el: any) => {
        Object.keys(el).forEach(key => {
          if (formEl.value && 'elements' in formEl.value) {
            const elements: HTMLFormControlsCollection | undefined = formEl.value?.elements

            if (elements && elements[key]) {
              elements[key].value = el[key]
            }
          }
        })

      }, {
        deep: true
      })

    }

    onMounted(() => {
      addWatchers()
    })

    return {
      formEl,
      submitMethod,
      onSubmit,
      formData
    }
  }
}
</script>

<style scoped>

</style>
