<template>
  <form :action="action" :method="submitMethod"
        @submit="onSubmit"
        v-bind="$attrs"
        ref="formEl">
    <!-- For Laravel forms -->
    <input type="hidden" name="_method" :value="method"
           v-if="showMethodInput">

    <slot></slot>
  </form>
</template>

<script lang="ts">
import {
  computed, ComputedRef,
  onMounted,
  PropType, reactive,
  Ref, toRaw, watch
} from 'vue'
import { FormSubmitMethod } from '../../enums/FormSubmitMethod'
import { ref } from '@vue/reactivity'
import { validateAll as indicatorValidate } from 'indicative/validator'

type CustomHTMLElement = HTMLInputElement & { initialValue: string, validationRules: string, formEl: HTMLFormElement }
type ValidHTMLInputElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | CustomHTMLElement;

export interface ValidationError {
  field: string;
  message: string;
  validation: string;
}

export default {
  name: 'BwcForm',
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
    const formSubmitBtn: Ref<HTMLButtonElement | undefined> = ref()

    /**
     * HTMLButtonElement of the reset button
     */
    const formResetBtn: Ref<HTMLButtonElement | undefined> = ref()

    /**
     * Reactive object containing the form data.
     */
    const formData: Ref<any> = ref({})

    const validationErrors: Ref<ValidationError[]> = ref([])

    /**
     * The HTTP method that must be used for the form
     */
    const submitMethod: ComputedRef<FormSubmitMethod.GET | FormSubmitMethod.POST> = computed(() => {
      return (props.method?.toUpperCase() !== FormSubmitMethod.GET) ? FormSubmitMethod.POST : FormSubmitMethod.GET
    })

    const showMethodInput = computed(() => {
      if (!props.method) {
        return
      }

      return ![FormSubmitMethod.GET, FormSubmitMethod.POST].includes(props.method as any)
    })

    const validationRules = computed(() => {
      const rules = {}

      formInputs.value?.forEach(el => {
        if ('validationRules' in el && el.validationRules) {
          rules[el.name] = el.validationRules
        }
      })

      return rules
    })

    /**
     * Function triggered by the form submit
     *
     * @return Promise<void>
     */
    async function onSubmit () {
      const validatedData = await validate()

      if (!validatedData) {
        return
      }

      return

      if (props.ajaxSubmit) {
        const formDataI = new FormData(formData.value)

        formInputs.value.forEach(el => {
          formDataI.append(el.getAttribute('name'), el.value)
        })

        // TODO:: must implement
        return alert('work in progress...')
      }

      formEl.value?.submit()
    }

    /**
     * Function triggered when clicking a reset button, if any
     *
     * @return void
     */
    function onReset (): void {
      formInputs.value?.forEach(el => {
        el.value = 'initialValue' in el ? el.initialValue : ''
        el.dispatchEvent(new CustomEvent('change'))
      })

      formEl.value?.reset()
    }

    async function validate (): Promise<any> {
      let hasErrors = false
      let data

      validationErrors.value = []

      try {
        data = await indicatorValidate(formData.value, validationRules.value)
      } catch (er: ValidationError[]) {
        validationErrors.value.push(...er)

        hasErrors = true
      }

      ctx.emit('formValidated', {
        errors: toRaw(validationErrors.value),
        hasErrors
      })

      return data
    }

    /**
     *  Get all form elements provided by the slot tag and stores them inside different variables
     *  - formSubmitBtn
     *  - formResetBtn
     *  - formInputs
     *
     * @return void
     */
    function storeInputs (): void {
      const shadowRoot = formEl.value?.parentNode as DocumentFragment
      const slots: NodeListOf<HTMLSlotElement> = shadowRoot?.querySelectorAll('slot')
      const _inputs: Array<ValidHTMLInputElement> = []

      slots.forEach(slot => {
        const slotElements = slot.assignedElements()
        const parentNode = slotElements[0].parentNode

        _inputs.push(...parentNode.querySelectorAll('[name],[type=submit],[type=reset]'))
      })

      // is done just for allowing inputs to access the form they belong to
      _inputs.forEach(input => {
        input.formEl = formEl.value
        input.bwcForm = shadowRoot.host

        input.dispatchEvent(new CustomEvent('bindsFormEl', {
          detail: {
            form: input.formEl,
            bwcForm: input.bwcForm
          }
        }))
      })

      formSubmitBtn.value = _inputs.find(el => 'type' in el && el.type === 'submit')
      formResetBtn.value = _inputs.find(el => 'type' in el && el.type === 'reset')
      formInputs.value = _inputs.filter(el => el.hasAttribute('name'))
    }

    /**
     * All the inputs provided by the user in the default slot must be cloned as "hidden" inside the form
     * otherwise the form won't be able to submit and read all its data as it would work by default.
     *
     * This is non the case when the form is submitted by Ajax.
     *
     * @returns void
     */
    function createHiddenInputs (): void {
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

    /**
     * Adds all necessary watchers for handling the form and its elements
     *
     * @returns void
     */
    function addWatchers (): void {
      function addListener (el, callback) {
        if (el.listenerAdded) {
          return
        }

        callback(el)

        Object.defineProperty(el, 'listenerAdded', {
          value: true
        })
      }

      // Watch formEl and add "slotchange" event listener
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
          if (!('initialValue' in el)) {
            Object.defineProperty(el, 'initialValue', {
              value: el.value
            })
          }

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

    // Expose necessary props or methods
    ctx.expose({
      validationErrors,
      validationRules,
      validate
    })

    onMounted(() => {
      addWatchers()
    })

    return {
      formEl,
      submitMethod,
      onSubmit,
      formData,
      FormSubmitMethod,
      showMethodInput
    }
  }
}
</script>

<style scoped>

</style>
