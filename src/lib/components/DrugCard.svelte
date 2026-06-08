<script lang="ts">
  import InteractionChecker from './InteractionChecker.svelte'
  import type { DrugEntry } from '$lib/engine/Trie'

  let { drug }: { drug: DrugEntry } = $props()
</script>

<div class="card">
  <div class="category">{drug.category.split('[')[0].trim()}</div>

  <div class="name-row">
    <h2 class="drug-name">{drug.brand}</h2>
    {#if drug.lookalike}
      <span class="lookalike-badge">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path d="M6.5 1L7.9 4.9H12L8.6 7.3L10 11.2L6.5 8.8L3 11.2L4.4 7.3L1 4.9H5.1L6.5 1Z"
            stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
        </svg>
        Lookalike: {drug.lookalike}
      </span>
    {/if}
  </div>

  <div class="generic">{drug.generic}</div>

  {#if drug.description}
    <p class="description">{drug.description}</p>
  {/if}

  <div class="dose-row">
    <div class="dose-block">
      <span class="dose-label">Standard dose</span>
      <span class="dose-value">{drug.dose || 'See label'}</span>
    </div>
    <div class="dose-block">
      <span class="dose-label">Max per day</span>
      <span class="dose-value dose-value--max">{drug.maxDaily}</span>
    </div>
  </div>

  <div class="divider"></div>

  <InteractionChecker primaryDrug={drug} />
</div>

<style>
  .card {
    animation: fadeUp 220ms ease both;
  }

  .category {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: var(--hi);
    margin-bottom: 10px;
  }

  .name-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 4px;
  }

  .drug-name {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 28px;
    letter-spacing: -1px;
    line-height: 1.1;
    color: var(--ink);
  }

  .lookalike-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    color: var(--amber);
    background: var(--amber-bg);
    border: 1px solid var(--amber-line);
    border-radius: var(--radius-sm);
    padding: 3px 8px;
    white-space: nowrap;
    flex-shrink: 0;
    margin-top: 4px;
  }

  .generic {
    font-size: 11px;
    color: var(--ink3);
    margin-bottom: 12px;
  }

  .description {
    font-size: 12px;
    color: var(--ink2);
    line-height: 1.7;
    border-bottom: 1px solid var(--line);
    padding-bottom: 16px;
    margin-bottom: 16px;
  }

  .dose-row {
    display: flex;
    gap: 10px;
    margin-bottom: 16px;
  }

  .dose-block {
    flex: 1;
    background: var(--bg2);
    border: 1px solid var(--line);
    border-radius: var(--radius-lg);
    padding: 12px 15px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .dose-label {
    font-size: 10px;
    color: var(--ink3);
    text-transform: uppercase;
    letter-spacing: 0.8px;
  }

  .dose-value {
    font-family: var(--font-body);
    font-weight: 600;
    font-size: 14px;
    color: var(--ink);
    line-height: 1.3;
    word-break: break-word;
  }

  .dose-value--max {
    color: var(--red);
  }

  .divider {
    height: 1px;
    background: var(--line);
    margin-bottom: 0;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
