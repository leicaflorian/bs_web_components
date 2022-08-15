<template>
  <div :class="{'form-floating': floatingLabel}" ref="elContainer">
    <label :for="id" class="form-label" v-if="!floatingLabel">{{ label }}</label>
    <input :type="type"
           :class="inputClasses"
           :id="id"
           :placeholder="placeholder || label"
           :name="name"
           :readonly="readonly"
           :disabled="disabled"
           @change.stop="onChange"
           @input.stop="onInput">

    <label :for="id" v-if="floatingLabel">{{ label }}</label>

    <div class="valid-feedback" v-if="dirty && showValidFeedback && validFeedback" v-html="validFeedback"></div>
    <div class="invalid-feedback" v-html="validationFeedback"></div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, PropType, Ref, watch } from 'vue'
import { ref } from '@vue/reactivity'
import BwcFormCe, { ValidationError } from './BwcForm.ce.vue'

export default defineComponent({
  props: {
    name: { required: true, type: String },
    value: [String, Number],
    label: String,
    placeholder: String,
    spaceBottom: {
      default: 'mb-3'
    },
    type: { type: String as PropType<'text' | 'email'>, default: 'text' },
    size: String as PropType<'lg' | 'sm'>,
    disabled: Boolean,
    readonly: Boolean,
    plaintext: Boolean,
    floatingLabel: Boolean,
    showValidFeedback: {
      type: Boolean,
      default: false
    },
    validFeedback: String,
    invalidFeedback: String,
    validationRules: String
  },
  setup (props, context) {
    const elContainer = ref()

    let form: Ref<HTMLFormElement | undefined> = ref()
    let bwcForm: Ref<BwcFormCe | undefined> = ref()
    const dirty = ref(false)
    const validationInitiated = ref(false)

    const validationErrors: Ref<ValidationError[]> = ref([])

    /**
     *
     */
    const id = computed(() => {
      return props.name + '_bwc_component'
    })

    /**
     *
     */
    const inputClasses = computed(() => {
      const classes = []

      if (props.size) {
        classes.push('form-control-' + props.size)
      }

      if (props.plaintext) {
        classes.push('form-control-plaintext')
      } else {
        classes.push('form-control')
      }

      if (isValid.value && props.showValidFeedback && dirty.value) {
        classes.push('is-valid')
      }

      if (isInvalid.value) {
        classes.push('is-invalid')
      }

      return classes
    })

    const isValid = computed(() => {
      return validationErrors.value.length === 0
    })

    const isInvalid = computed(() => {
      return validationErrors.value.length > 0
    })

    const validationFeedback = computed(() => {
      if (!isInvalid.value) {
        return
      }

      if (props.invalidFeedback) {
        return props.invalidFeedback
      }

      return validationErrors.value[0].message
    })

    function emitChange (e: Event | InputEvent, event: 'input' | 'change') {
      e.stopPropagation()
      const currentTarget: HTMLInputElement = e.currentTarget as HTMLInputElement

      context.emit('update:modelValue', {
        value: currentTarget.value
      })

      context.emit(e.type, {
        originalEvent: e
      })
    }

    /**
     *
     */
    function onChange (e) {
      emitChange(e, 'change')
    }

    /**
     *
     */
    function onInput (e) {
      emitChange(e, 'input')
    }

    watch(() => bwcForm.value?.validationErrors, (errors: ValidationError[]) => {
      validationErrors.value = errors.filter(el => el.field === props.name)

      if (!validationInitiated.value) {
        validationInitiated.value = true
      } else {
        dirty.value = true
      }
    }, {
      deep: true
    })

    onMounted(() => {
      elContainer.value.parentNode.host.addEventListener('bindsFormEl', function (e) {
        form.value = e.detail.form
        bwcForm.value = e.detail.bwcForm
      })
    })

    return {
      elContainer,
      id,
      dirty,
      inputClasses,
      validationFeedback,
      onChange,
      onInput
    }
  }
})
</script>


<style lang="scss">
// Configuration
@import "bootstrap/scss/functions";
@import "bootstrap/scss/variables";
@import "bootstrap/scss/maps";
@import "bootstrap/scss/mixins";
@import "bootstrap/scss/utilities";
@import "bootstrap/scss/reboot";

// Component styles
@import "bootstrap/scss/forms";
</style>

