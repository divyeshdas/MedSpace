<script lang="ts">
  import { flushSync } from 'svelte'
  import { theme } from '$lib/stores/theme'
  import Marquee from '$lib/components/Marquee.svelte'
  import SearchBox from '$lib/components/SearchBox.svelte'
  import DrugCard from '$lib/components/DrugCard.svelte'
  import type { DrugEntry } from '$lib/engine/Trie'

  let query = $state('')
  let selectedDrug = $state<DrugEntry | null>(null)

  const quickPills = ['Aspirin', 'Ibuprofen', 'Metformin', 'Warfarin', 'Cetirizine', 'Azithromycin']

  async function handleSelect(drug: DrugEntry) {
    query = drug.brand
    try {
      const res = await fetch(`/api/drug/${drug.id}`)
      const full = res.ok ? await res.json() : drug
      flushSync(() => { selectedDrug = full })
    } catch {
      flushSync(() => { selectedDrug = drug })
    }
  }

  function handleClear() {
    query = ''
    selectedDrug = null
  }

  async function handlePill(name: string) {
    query = name
    try {
      const res = await fetch(`/api/suggest?q=${encodeURIComponent(name)}`)
      const data = await res.json()
      const results: DrugEntry[] = data.results ?? []
      if (results.length > 0) await handleSelect(results[0])
    } catch { /* ignore */ }
  }

  function toggleTheme() {
    theme.update(t => (t === 'dark' ? 'light' : 'dark'))
  }
</script>

<svelte:window onkeydown={(e) => { if (e.key === 'Escape') { query = query } }} />

<div class="app">
  <Marquee />
  <nav>
    <div class="nav-left">
      <span class="wordmark">
        <span class="wm-med">Med</span><span class="wm-space">Space</span>
      </span>
      <span class="version-badge">v0.1</span>
    </div>
    <div class="nav-right">
      <span class="nav-label">Drug Search Engine</span>
      <button class="theme-toggle" onclick={toggleTheme} aria-label="Toggle theme">
        {#if $theme === 'dark'}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="3.5" stroke="currentColor" stroke-width="1.4"/>
            <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06"
              stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
        {:else}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13.5 9.5A6 6 0 016.5 2.5a6 6 0 100 11 6 6 0 007-4z"
              stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        {/if}
      </button>
    </div>
  </nav>

  <div class="layout">
    <div class="left-col">
      <span class="eyebrow">Drug lookup</span>
      <h1 class="title">
        Find any<br />drug<span class="dot">.</span>
      </h1>
      <p class="subtitle">Search by brand or generic name. Check dosage, interactions, and lookalike warnings.</p>

      <div class="search-area">
        <SearchBox
          bind:value={query}
          placeholder="e.g. Ibuprofen, Paracetamol…"
          onselect={handleSelect}
          onclear={handleClear}
        />
      </div>

      <div class="pills">
        {#each quickPills as pill}
          <button class="pill" onclick={() => handlePill(pill)}>{pill}</button>
        {/each}
      </div>
    </div>

    <div class="right-col">
      {#if selectedDrug}
        {#key selectedDrug.id}
          <DrugCard drug={selectedDrug} />
        {/key}
      {:else}
        <div class="empty-state">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" class="empty-icon">
            <rect x="6" y="14" width="28" height="18" rx="3" stroke="currentColor" stroke-width="1.5"/>
            <path d="M14 14V10a6 6 0 1112 0v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <circle cx="20" cy="23" r="2.5" stroke="currentColor" stroke-width="1.5"/>
          </svg>
          <p class="empty-text">Search for a drug on the left to see dosage information and check for interactions</p>
        </div>
      {/if}
    </div>
  </div>

  <footer>
    <span>Trie · Min-Heap · Edit Distance · OpenFDA</span>
    <span>SvelteKit · lru-cache · MedSpace © 2025</span>
  </footer>
</div>

<style>
  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 32px;
    height: 57px;
    border-bottom: 1px solid var(--line);
    flex-shrink: 0;
  }

  .nav-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .wordmark {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 17px;
    letter-spacing: -0.5px;
  }

  .wm-med { color: var(--ink); }
  .wm-space { color: var(--hi); }

  .version-badge {
    font-size: 10px;
    color: var(--ink3);
    border: 1px solid var(--line2);
    background: var(--bg2);
    border-radius: var(--radius-sm);
    padding: 2px 6px;
  }

  .nav-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .nav-label {
    font-size: 11px;
    color: var(--ink3);
  }

  @media (max-width: 700px) {
    .nav-label { display: none; }
  }

  .theme-toggle {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    border: 1px solid var(--line2);
    background: var(--bg2);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--ink2);
    transition: background var(--transition), color var(--transition);
  }

  .theme-toggle:hover {
    background: var(--bg3);
    color: var(--ink);
  }

  .layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: calc(100vh - 97px);
    flex: 1;
  }

  @media (max-width: 700px) {
    .layout { grid-template-columns: 1fr; }
  }

  .left-col {
    padding: 44px 32px;
    border-right: 1px solid var(--line);
  }

  .right-col {
    padding: 44px 32px;
  }

  .eyebrow {
    display: block;
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--ink3);
    margin-bottom: 14px;
  }

  .title {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 46px;
    letter-spacing: -2.5px;
    line-height: 1.0;
    color: var(--ink);
    margin-bottom: 14px;
  }

  .dot { color: var(--hi); }

  .subtitle {
    font-size: 13px;
    color: var(--ink2);
    max-width: 280px;
    line-height: 1.7;
    margin-bottom: 28px;
  }

  .search-area {
    margin-bottom: 16px;
  }

  .pills {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .pill {
    font-size: 12px;
    font-family: var(--font-body);
    color: var(--ink2);
    border: 1px solid var(--line2);
    background: var(--bg2);
    border-radius: 8px;
    padding: 5px 12px;
    cursor: pointer;
    transition: color var(--transition), border-color var(--transition), background var(--transition);
  }

  .pill:hover {
    color: var(--hi);
    border-color: var(--hi-line);
    background: var(--hi-bg);
  }

  .empty-state {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    text-align: center;
  }

  .empty-icon {
    color: var(--ink);
    opacity: 0.18;
  }

  .empty-text {
    font-size: 13px;
    color: var(--ink3);
    max-width: 200px;
    line-height: 1.6;
  }

  footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 32px;
    height: 40px;
    border-top: 1px solid var(--line);
    flex-shrink: 0;
  }

  footer span {
    font-size: 10px;
    color: var(--ink3);
  }
</style>
