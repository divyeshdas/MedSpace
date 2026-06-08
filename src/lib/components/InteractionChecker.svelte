<script lang="ts">
  import { flushSync } from 'svelte'
  import SearchBox from './SearchBox.svelte'
  import type { DrugEntry } from '$lib/engine/Trie'

  let { primaryDrug }: { primaryDrug: DrugEntry } = $props()

  let secondQuery = $state('')
  let selectedDrug = $state<DrugEntry | null>(null)
  let result = $state<{ severity: string; message: string } | null>(null)
  let loading = $state(false)

  async function handleSelect(drug: DrugEntry) {
    flushSync(() => {
      selectedDrug = drug
      secondQuery = drug.brand
      result = null
      loading = true
    })

    try {
      const res = await fetch('/api/interact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ drug1: primaryDrug.generic, drug2: drug.generic })
      })
      const data = await res.json()
      flushSync(() => { result = data })
    } catch {
      flushSync(() => { result = { severity: 'unknown', message: 'Could not check interaction. Please try again.' } })
    } finally {
      flushSync(() => { loading = false })
    }
  }

  function handleClear() {
    secondQuery = ''
    selectedDrug = null
    result = null
  }

  const severityConfig = {
    safe: { label: '✓ Generally safe', class: 'safe' },
    moderate: { label: '⚠ Moderate interaction', class: 'moderate' },
    danger: { label: '✕ Dangerous combination', class: 'danger' },
    unknown: { label: '? Unknown interaction', class: 'unknown' }
  } as const
</script>

<div class="checker">
  <p class="checker-label">Interaction checker</p>

  <SearchBox
    bind:value={secondQuery}
    placeholder="Add a second drug…"
    excludeId={primaryDrug.id}
    onselect={handleSelect}
    onclear={handleClear}
  />

  {#if loading}
    <div class="loading">Checking…</div>
  {/if}

  {#if result && !loading}
    {@const config = severityConfig[result.severity as keyof typeof severityConfig] ?? severityConfig.unknown}
    <div class="result result--{config.class}">
      <span class="severity-label">{config.label}</span>
      <p class="message">{result.message}</p>
      {#if selectedDrug}
        <span class="pair">{primaryDrug.brand} + {selectedDrug.brand}</span>
      {/if}
    </div>
  {/if}
</div>

<style>
  .checker {
    margin-top: 20px;
  }

  .checker-label {
    font-size: 11px;
    color: var(--ink2);
    margin-bottom: 10px;
    letter-spacing: 0.5px;
  }

  .loading {
    font-size: 12px;
    color: var(--ink3);
    padding: 10px 0;
  }

  .result {
    margin-top: 12px;
    border-radius: var(--radius-lg);
    border: 1px solid;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    animation: fadeUp 220ms ease both;
  }

  .result--safe { background: var(--hi-bg); border-color: var(--hi-line); }
  .result--moderate { background: var(--amber-bg); border-color: var(--amber-line); }
  .result--danger { background: var(--red-bg); border-color: var(--red-line); }
  .result--unknown { background: var(--bg2); border-color: var(--line2); }

  .severity-label {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.2px;
  }

  .result--safe .severity-label { color: var(--hi); }
  .result--moderate .severity-label { color: var(--amber); }
  .result--danger .severity-label { color: var(--red); }
  .result--unknown .severity-label { color: var(--ink2); }

  .message {
    font-size: 12px;
    color: var(--ink2);
    line-height: 1.65;
  }

  .pair {
    font-size: 10px;
    color: var(--ink3);
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
