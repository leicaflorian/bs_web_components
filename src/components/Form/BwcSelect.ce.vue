<template>
  <div>
    <label :for="elName" class="form-label"
           v-if="label && !floatingLabel">
      {{ label }}
    </label>

    <div class="dropdown" :class="{'form-floating': floatingLabel}">
      <button class="form-select"
              :class="btnClasses"
              type="button"
              :id="elName"
              aria-expanded="false"
              :placeholder="label"
              @click="show = !show">
        {{ selectionAsText }}
      </button>

      <div class="invalid-feedback" role="alert" v-if="errorMessage">
        <strong>{{ errorMessage }}</strong>
      </div>

      <label :for="elName" v-if="label && floatingLabel">
        {{ label }}
      </label>

      <ul class="dropdown-menu" :class="{show: show}" :aria-labelledby="elName">
        <template v-if="multiple">
          <li>
            <button class="dropdown-item" type="button" data-dd-action="none">Nessuna</button>
          </li>
          <li>
            <button class="dropdown-item" type="button" data-dd-action="all">Tutte</button>
          </li>
          <li>
            <hr class="dropdown-divider">
          </li>
        </template>

        <li class="dropdown-item"
            :class="{active: option[optionValueKey] === value}"
            v-for="(option, i) in optionsList" :key="`${name}-option-${i}`">
          <label class="form-check" :class="{'hidden-control': !showControlEl}">
            <input class="form-check-input"
                   :style="!showControlEl ? 'display:none' : ''"
                   :type="multiple ? 'checkbox' : 'radio'"
                   :id="getOptionId(option)"
                   :name="getOptionName()"
                   :value="option[optionValueKey]"
                   :checked="isActive(option)"
                   @change="onOptionChange(option)"
            >
            <label class="form-check-label" :for="`${getOptionName()}_${option[optionValueKey]}_option`">
              {{ option[optionLabelKey] }}
            </label>
          </label>
        </li>

      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, onBeforeMount, onMounted, PropType, Ref, watch } from 'vue'
import { ref } from '@vue/reactivity'

export default defineComponent({
  name: 'BwcSelect',
  props: {
    name: String,
    label: String,
    floatingLabel: Boolean,
    errorMessage: String,
    multiple: Boolean,
    value: String,
    size: String as PropType<'sm' | 'lg'>,
    options: [String, Array],
    optionLabelKey: { type: String, default: 'text' },
    optionValueKey: { type: String, default: 'value' },
    showControlEl: Boolean
  },
  setup (props, context) {
    const show = ref(false)
    const selectedOptions = computed(() => {
      const options = []

      optionsList.value.forEach((el) => {
        if (el[props.optionValueKey] === props.value) {
          options.push(el)
        }
      })

      return options
    })
    const optionsList: ComputedRef<any[]> = computed(() => {
      let toReturn: any

      if (props.options instanceof Array) {
        return props.options
      }

      try {
        toReturn = JSON.parse(<string>props.options ?? '')
      } catch (e) {
        console.warn('Provided options for BwcSelect is not a valid JSON')
      }

      return toReturn ?? []
    })
    const btnClasses = computed(() => {
      const toReturn: any = {
        'is-invalid': props.errorMessage
      }

      if (props.size) {
        toReturn['form-select-' + props.size] = true
      }

      return toReturn
    })
    const elName = computed(() => {
      let name = props.name

      if (!name) {
        name = 'form'
      }

      return [name, 'Select']
    })
    const selectionAsText = computed(() => {
      return selectedOptions.value.reduce((acc, curr) => {
        acc.push(curr[props.optionValueKey])

        return acc
      }, []).join(' ')
    })

    function isActive (option) {
      if (props.value instanceof Array) {
        return props.value.includes(option[props.optionValueKey])
      } else {
        return option[props.optionValueKey] === props.value
      }
    }

    function getOptionName () {
      return props.multiple ? props.name + '[]' : props.name
    }

    function getOptionId (option) {
      return getOptionName() + `_${option[props.optionValueKey]}_option`
    }

    function onOptionChange (option) {
      if (!props.multiple) {
        show.value = false
      }

      context.emit('update:modelValue', {
        value: option[props.optionValueKey],
        options: option
      })

      context.emit('change', option[props.optionValueKey])
    }

    context.expose({
      getOptionName,
      selectedOptions
    })

    return {
      optionsList,
      show,
      btnClasses,
      elName,
      isActive,
      selectionAsText,
      getOptionId,
      getOptionName,
      onOptionChange
    }
  }
})
</script>

<style lang="scss">
@import "bootstrap/scss/functions";
@import "bootstrap/scss/variables";
@import "bootstrap/scss/maps";
@import "bootstrap/scss/mixins";
@import "bootstrap/scss/utilities";

@import "bootstrap/scss/forms/form-select";
@import "bootstrap/scss/forms/form-check";
@import "bootstrap/scss/forms/labels";
@import "bootstrap/scss/forms/floating-labels";
@import "bootstrap/scss/forms/validation";
@import "bootstrap/scss/dropdown";

* {
  box-sizing: border-box;
}

.dropdown-menu {
  min-width: 100%;
  z-index: 99;
}

.hidden-control{
  padding-left: 0;
}
</style>

