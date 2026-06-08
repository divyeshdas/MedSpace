<script lang="ts">
  import { flushSync } from 'svelte'
  import type { DrugEntry } from '$lib/engine/Trie'

  let {
    value = $bindable(''),
    placeholder = 'Search drugs…',
    excludeId = -1,
    onselect,
    onclear
  }: {
    value?: string
    placeholder?: string
    excludeId?: number
    onselect?: (drug: DrugEntry) => void
    onclear?: () => void
  } = $props()

  let focused = $state(false)
  let suggestions = $state<DrugEntry[]>([])
  let showSuggestions = $state(false)
  let blurTimer: ReturnType<typeof setTimeout>
  let debounceTimer: ReturnType<typeof setTimeout>

  async function doSearch(q: string) {
    if (!q) { suggestions = []; showSuggestions = false; return }
    try {
      const res = await fetch(`/api/suggest?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      if (q === value) {
        const results: DrugEntry[] = (data.results ?? []).filter(
          (d: DrugEntry) => d.id !== excludeId
        )
        flushSync(() => {
          suggestions = results
          showSuggestions = results.length > 0
        })
      }
    } catch {
      suggestions = []
      showSuggestions = false
    }
  }

  function handleInput(e: Event) {
    const q = (e.currentTarget as HTMLInputElement).value
    value = q
    clearTimeout(debounceTimer)
    if (!q) { suggestions = []; showSuggestions = false; return }
    debounceTimer = setTimeout(() => doSearch(q), 300)
  }

  function handleFocus() {
    focused = true
  }

  function handleBlur() {
    blurTimer = setTimeout(() => {
      focused = false
    }, 150)
  }

  function handleSelect(drug: DrugEntry) {
    clearTimeout(blurTimer)
    suggestions = []
    showSuggestions = false
    focused = false
    onselect?.(drug)
  }

  function handleClear() {
    value = ''
    suggestions = []
    showSuggestions = false
    onclear?.()
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      focused = false
      showSuggestions = false
    } else if (e.key === 'Enter' && suggestions.length > 0) {
      handleSelect(suggestions[0])
    }
  }

  function highlightPrefix(text: string, query: string): string {
    if (!query) return text
    const idx = text.toLowerCase().indexOf(query.toLowerCase())
    if (idx === -1) return text
    const before = text.slice(0, idx)
    const match = text.slice(idx, idx + query.length)
    const after = text.slice(idx + query.length)
    return `${before}<em>${match}</em>${after}`
  }

  const open = $derived(focused && showSuggestions && suggestions.length > 0)
</script>

<div class="search-wrap" class:open>
  <div class="search-box" class:focused>
    <svg class="icon-search" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" stroke-width="1.5"/>
      <path d="M10 10L14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>

    <input
      type="text"
      value={value}
      {placeholder}
      onfocus={handleFocus}
      onblur={handleBlur}
      onkeydown={handleKeydown}
      oninput={handleInput}
      autocomplete="off"
      spellcheck="false"
    />

    {#if value}
      <button class="btn-clear" onclick={handleClear} aria-label="Clear search">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
    {/if}
  </div>

  {#if open}
    <ul class="suggestions">
      {#each suggestions as drug (drug.id)}
        <li>
          <button onclick={() => handleSelect(drug)}>
            <span class="drug-name">
              <!-- eslint-disable-next-line svelte/no-at-html-tags -->
              {@html highlightPrefix(drug.brand, value)}
            </span>
            <span class="drug-cat">{drug.category.split('[')[0].trim()}</span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .search-wrap {
    position: relative;
    width: 100%;
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--bg2);
    border: 1px solid var(--line2);
    border-radius: var(--radius-lg);
    padding: 0 14px;
    height: 46px;
    transition: border-color var(--transition), border-radius var(--transition);
  }

  .search-box.focused {
    border-color: var(--hi-line);
  }

  .search-wrap.open .search-box {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  .icon-search {
    color: var(--ink3);
    flex-shrink: 0;
  }

  input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    font-family: var(--font-body);
    font-size: 14px;
    color: var(--ink);
  }

  input::placeholder {
    color: var(--ink3);
  }

  .btn-clear {
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px;
    color: var(--ink3);
    display: flex;
    align-items: center;
    flex-shrink: 0;
    transition: color var(--transition);
  }

  .btn-clear:hover {
    color: var(--ink);
  }

  .suggestions {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--bg2);
    border: 1px solid var(--hi-line);
    border-top: none;
    border-bottom-left-radius: var(--radius-lg);
    border-bottom-right-radius: var(--radius-lg);
    list-style: none;
    z-index: 100;
    overflow: hidden;
  }

  .suggestions li button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 10px 14px;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    transition: background var(--transition);
  }

  .suggestions li button:hover {
    background: var(--bg3);
  }

  .drug-name {
    font-size: 13px;
    color: var(--ink);
  }

  .drug-name :global(em) {
    color: var(--hi);
    font-style: normal;
  }

  .drug-cat {
    font-size: 11px;
    color: var(--ink3);
    white-space: nowrap;
    flex-shrink: 0;
  }
</style>
