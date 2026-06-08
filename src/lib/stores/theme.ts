import { writable } from 'svelte/store'
import { browser } from '$app/environment'

const stored = browser ? localStorage.getItem('medspace-theme') : null
export const theme = writable<'dark' | 'light'>((stored as 'dark' | 'light') ?? 'dark')

theme.subscribe(val => {
  if (browser) {
    localStorage.setItem('medspace-theme', val)
    document.documentElement.setAttribute('data-theme', val)
  }
})
