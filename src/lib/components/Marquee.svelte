<script lang="ts">
  import { onMount } from 'svelte'

  interface Approval {
    name: string
    date: string
    company: string
  }

  const FALLBACK: Approval[] = [
    { name: 'Leqembi', date: 'Jan 2024', company: 'Eisai' },
    { name: 'Talvey', date: 'Sep 2023', company: 'J&J' },
    { name: 'Elrexfio', date: 'Aug 2023', company: 'Pfizer' },
    { name: 'Rivfloza', date: 'Jan 2024', company: 'Novo Nordisk' },
    { name: 'Alhemo', date: 'Nov 2023', company: 'Novo Nordisk' },
    { name: 'Jaypirca', date: 'Jan 2023', company: 'Eli Lilly' },
    { name: 'Omvoh', date: 'Jul 2023', company: 'Eli Lilly' },
    { name: 'Rezdiffra', date: 'Mar 2024', company: 'Madrigal' },
    { name: 'Winrevair', date: 'Mar 2024', company: 'Merck' },
    { name: 'Hympavzi', date: 'Oct 2024', company: 'Pfizer' }
  ]

  let items = $state<Approval[]>([])
  let loading = $state(true)

  onMount(async () => {
    try {
      const res = await fetch('/api/approvals')
      if (!res.ok) throw new Error('approvals fetch failed')
      const data = await res.json()
      items = data.results?.length ? data.results : FALLBACK
    } catch {
      items = FALLBACK
    } finally {
      loading = false
    }
  })
</script>

<div class="marquee-bar">
  <div class="marquee-label">NEW APPROVALS</div>
  {#if loading}
    <div class="skeleton">
      <div class="skel-pill"></div>
      <div class="skel-pill"></div>
      <div class="skel-pill"></div>
    </div>
  {:else}
    <div class="marquee-track-wrapper">
      <div class="marquee-track">
        {#each [...items, ...items] as item, i (i)}
          <span class="marquee-item">
            <span class="dot">●</span>
            {item.name}
            {#if item.company}
              <span class="company">— {item.company}</span>
            {/if}
            <span class="date">{item.date}</span>
          </span>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .marquee-bar {
    display: flex;
    align-items: center;
    height: 34px;
    border-bottom: 1px solid var(--line);
    background: var(--bg2);
    overflow: hidden;
    gap: 0;
  }

  .marquee-label {
    font-size: 9px;
    letter-spacing: 1.8px;
    color: var(--hi);
    background: var(--hi-bg);
    border-right: 1px solid var(--hi-line);
    padding: 0 14px;
    height: 100%;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    font-family: var(--font-display);
    white-space: nowrap;
  }

  .marquee-track-wrapper {
    flex: 1;
    overflow: hidden;
    height: 100%;
    display: flex;
    align-items: center;
  }

  .marquee-track {
    display: flex;
    align-items: center;
    gap: 0;
    white-space: nowrap;
    animation: marquee-scroll 40s linear infinite;
    will-change: transform;
  }

  .marquee-track:hover {
    animation-play-state: paused;
  }

  @keyframes marquee-scroll {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  .marquee-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 0 28px;
    font-size: 11px;
    color: var(--ink2);
    border-right: 1px solid var(--line);
  }

  .dot {
    font-size: 6px;
    color: var(--hi);
    opacity: 0.6;
  }

  .company {
    color: var(--ink2);
    opacity: 0.75;
    font-size: 10px;
  }

  .date {
    font-size: 10px;
    color: var(--ink2);
    background: var(--bg3);
    padding: 1px 6px;
    border-radius: 3px;
  }

  .skeleton {
    display: flex;
    align-items: center;
    gap: 24px;
    padding-left: 20px;
  }

  .skel-pill {
    height: 16px;
    width: 120px;
    background: var(--bg3);
    border-radius: 3px;
    animation: skel-pulse 1.4s ease-in-out infinite;
  }

  @keyframes skel-pulse {
    0%, 100% { opacity: 0.4; }
    50%       { opacity: 0.8; }
  }
</style>
