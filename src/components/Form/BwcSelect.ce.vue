<template>
  <div>
    <!-- Form Label if not floating -->
    <label :for="controlId" class="form-label"
           v-if="label && !floatingLabel">
      {{ label }}
    </label>

    <div class="dropdown" :class="{'form-floating': floatingLabel}">
      <!-- Visible part where the user will click to open -->
      <button class="form-select"
              :class="controlClasses"
              type="button"
              :id="controlId"
              aria-expanded="false"
              :placeholder="label"
              @click="show = !show">
        <div class="content-wrapper">
          <div class="selection-text">
            {{ selectionAsText }}
          </div>

          <!-- Button for clearing the selection -->
          <button class="btn-close" @click.stop="clearSelection" v-if="clearable"></button>
        </div>
      </button>

      <!-- Invalid feedback text -->
      <div class="invalid-feedback" role="alert" v-if="errorMessage">
        {{ errorMessage }}
      </div>

      <!-- Form Label if floating -->
      <label :for="controlId" v-if="label && floatingLabel">
        {{ label }}
      </label>

      <!-- Dropdown list -->
      <ul class="dropdown-menu" :class="{show: show}" :aria-labelledby="controlId">
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
                   :checked="optionIsActive(option)"
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
    showControlEl: Boolean,
    clearable: Boolean
  },
  setup (props, context) {
    const show = ref(false)

    /**
     * Returns necessary classes for the control element
     */
    const controlClasses = computed(() => {
      const toReturn: any = {}

      // Add is-invalid in case of an error message
      if (props.errorMessage) {
        toReturn['is-invalid'] = true
      }

      // Set the size of the element
      if (props.size) {
        toReturn['form-select-' + props.size] = true
      }

      return toReturn
    })

    /**
     * Generate the id for the control element
     */
    const controlId = computed(() => {
      let name = props.name

      if (!name) {
        name = 'form'
      }

      return [name, 'Select']
    })

    /**
     * Generate the options list.
     */
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

    /**
     * Return a list of selected options.
     */
    const selectedOptions = computed(() => {
      const options = []
      const valueList: any[] = props.value instanceof Array ? props.value : [props.value]

      optionsList.value.forEach((el) => {
        if (valueList.includes(el[props.optionValueKey])) {
          options.push(el)
        }
      })

      return options
    })

    /**
     * Return the text representation of the selected options.
     */
    const selectionAsText = computed(() => {
      return selectedOptions.value.reduce((acc, curr) => {
        acc.push(curr[props.optionValueKey])

        return acc
      }, []).join(', ')
    })

    /**
     * Indicate if the option must be active
     * @param option
     */
    function optionIsActive (option) {
      if (props.value instanceof Array) {
        return props.value.includes(option[props.optionValueKey])
      } else {
        return option[props.optionValueKey] === props.value
      }
    }

    /**
     * Return the name of dropdown checkbox.
     */
    function getOptionName () {
      return props.multiple ? props.name + '[]' : props.name
    }

    /**
     * Return the id of an option.
     */
    function getOptionId (option) {
      return getOptionName() + `_${option[props.optionValueKey]}_option`
    }

    /**
     * Handle the change of an option.
     * @param option
     */
    function onOptionChange (option) {
      if (!props.multiple) {
        show.value = false
      }

      const changedOption = option[props.optionValueKey]
      const newSelection: any[] = selectedOptions.value

      /*
        * If the option is already selected, remove it from the selection.
        * otherwise add it to the selection
        *
        * Cycle through the selection and push in the newSelection array only the right option,
        * handling the case where the option is already selected, then remove it from the selection.
       */

      context.emit('update:modelValue', {
        value: changedOption,
        options: option
      })

      context.emit('change', changedOption)
    }

    /**
     * Clear the selection of the dropdown.
     */
    function clearSelection () {
      onOptionChange({})
    }

    context.expose({
      selectedOptions
    })

    return {
      show,
      controlClasses,
      controlId,
      optionsList,
      selectionAsText,
      getOptionName,
      getOptionId,
      optionIsActive,
      clearSelection,
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
@import "bootstrap/scss/close";

* {
  box-sizing: border-box;
}

.dropdown-menu {
  min-width: 100%;
  z-index: 99;
}

.hidden-control {
  padding-left: 0;
}

.form-select {
  position: relative;

  .content-wrapper {
    display: flex;
    align-items: center;

    .selection-text {
      flex: 1;
    }

    .btn-close {

    }
  }
}
</style>

