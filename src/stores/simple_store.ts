import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { User } from '@/types/types.d.ts'

export const useSimlestore = defineStore('simple_store', () => {
    // sets
    const dark_theme = ref<boolean>(false)
    const user = ref<User | null>(null)
    const canvas = ref<HTMLCanvasElement | null>(null)
    // gets   
    const user_name = () => user.value ? user.value.id + '_user' : ''
    // actions
    const switchTheme = () => {
        console.log(`=> dark_theme: ${dark_theme.value}`,);
        dark_theme.value = !dark_theme.value
    }
    const getUserId = (): string => {
        return user.value?.id ?? ''
    }
    const setUser = (new_user: User) => {
        user.value = new_user;
    }
    return {
        dark_theme,
        canvas,
        user_name,
        getUserId,
        setUser,
        switchTheme
    }
});
