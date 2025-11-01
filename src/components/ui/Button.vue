<template>
  <button
    :class="cn(
      'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      {
        'bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2': variant === 'default',
        'bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2': variant === 'destructive',
        'border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2': variant === 'outline',
        'hover:bg-accentimage.png hover:text-accent-foreground h-10 px-4 py-2': variant === 'ghost',
        'h-10 w-10': variant === 'icon',
      },
      size === 'sm' && 'h-9 px-3',
      size === 'lg' && 'h-11 px-8',
      size === 'icon' && 'h-10 w-10'
    )"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Props {
  variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'icon'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'default',
  disabled: false,
})

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

