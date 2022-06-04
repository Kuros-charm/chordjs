import { computed } from 'vue'
export function useModelWrapper(props: any, emit: (name: string, value: any) => void, name = 'modelValue') {
    return computed({
        get: () => props[name],
        set: (value) => emit(`update:${name}`, value)
    })
}