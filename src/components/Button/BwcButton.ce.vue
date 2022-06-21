<template>
  <component
      :is="tag"
      class="btn"
      :class="classes"
      v-bind="attrs"
      v-on="{click: toggle ? onClick :null}"
  >
    <slot></slot>
  </component>
</template>

<script lang="ts">
import { computed, ref } from '@vue/reactivity'
import { defineComponent, PropType } from 'vue'

type BtnVariants =
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'info'
    | 'light'
    | 'dark';

export default defineComponent({
  name: 'BwcButton',
  props: {
    variant: { type: String as PropType<BtnVariants>, default: 'primary' },
    outline: Boolean,
    disabled: Boolean,
    toggle: Boolean,
    type: { type: String, default: 'button' },
    href: String,
    target: String,
    size: { type: String as PropType<'lg' | 'sm'> }
  },
  setup (props, { expose }) {
    const status = ref(false)
    const tag = computed(() => (props.href ? 'a' : 'button'))
    const classes = computed(() => {
      const variant = `btn-${props.outline ? 'outline-' : ''}${props.variant}`
      const toReturn = {
        [variant]: true,
        [`btn-${props.size}`]: props.size,
        disabled: props.disabled && tag.value === 'a',
        active: props.toggle && status.value
      }

      return toReturn
    })
    const attrs = computed(() => {
      const toReturn: any = {}

      if (props.href) {
        toReturn.href = props.href
      }

      if (props.target) {
        toReturn.target = props.target
      }

      if (props.type) {
        toReturn.type = props.type
      }

      if (props.disabled) {
        toReturn.disabled = true
      }

      return toReturn
    })

    function onClick () {
      status.value = !status.value
    }

    function cssProperties () {

    }

    expose({
      cssProperties,
      status
    })
    return {
      tag, classes, attrs, onClick,
      cssProperties
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

@import "bootstrap/scss/buttons";
</style>
