<script>
  import * as d3 from 'd3';

  let colors = d3.scaleOrdinal(d3.schemeTableau10);
  export let data = [];
  export let selectedIndex = -1;  // Initialize selectedIndex to -1, meaning no wedge is selected

  function toggleWedge(index, event) {
    // Allow selection on Enter key or any mouse event
    if (!event.key || event.key === 'Enter') {
      selectedIndex = index;
    }
  }

  const arcGenerator = d3.arc()
    .innerRadius(0)
    .outerRadius(50);

  let sliceGenerator = d3.pie().value((d) => d.value);
  let arcData = [];
  let arcs = [];

  $: {
    arcData = sliceGenerator(data);
    arcs = arcData.map((d) => arcGenerator(d));
  }

  let hoveredIndex = null;

  function handleMouseEnter(index) {
    hoveredIndex = index;
  }

  function handleMouseLeave() {
    hoveredIndex = null;
  }
</script>

<div class="container">
  <svg viewBox="-50 -50 100 100" aria-label="Project Year Distribution Pie Chart">
    {#each arcs as arc, i}
      <path
        d="{arc}"
        fill="{colors(i)}"
        class:dimmed="{hoveredIndex !== null && hoveredIndex !== i}"
        class:hovered="{hoveredIndex === i}"
        class:selected="{selectedIndex === i}"
        on:mouseenter={() => handleMouseEnter(i)}
        on:mouseleave={handleMouseLeave}
        on:click={(e) => toggleWedge(i, e)}
        on:keyup={(e) => toggleWedge(i, e)}
        tabindex="0"
        role="button"
        aria-label="Year {data[i].label} with {data[i].value} projects"
      />
    {/each}
  </svg>

  <ul class="legend">
    {#each data as d, index}
      <li 
        style="--color: {colors(index)}"
        class:selected="{selectedIndex === index}"
      >
        <span class="swatch"></span>
        {d.label} <em>({d.value})</em>
      </li>
    {/each}
  </ul>
</div>

<style>
  svg {
    max-width: 20em;
    margin-block: 2em;
    overflow: visible;
  }

  path {
    transition: 300ms;
    outline: none;
    cursor: pointer;
  }

  /* Apply opacity to all non-hovered wedges */
  .dimmed {
    opacity: 0.5;
  }

  /* Ensure hovered wedge stands out */
  .hovered {
    opacity: 1;
  }

  /* Styling for selected wedge and legend item */
  .selected {
    --color: oklch(60% 45% 0) !important; /* Distinct color for selected items */

    &:is(path) {
      fill: var(--color);
    }
  }

  .legend {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(9em, 1fr));
    gap: 1em;
    padding: 1em;
    border: 1px solid #ddd;
    border-radius: 8px;
    margin: 1em 0;
    background-color: #f9f9f9;
    color: black;
  }

  .legend li {
    display: flex;
    align-items: center;
    gap: 0.5em;
    font-size: 0.9em;
  }

  .swatch {
    width: 1em;
    height: 1em;
    background-color: var(--color);
    margin-right: 0.5em;
    border-radius: 0.2em;
  }

  .legend em {
    font-style: normal;
    color: #666;
  }

  .container {
    display: flex;
    align-items: center;
    gap: 1em;
  }

  @media (prefers-color-scheme: dark) {
    .legend {
      color: white;
      background-color: #333;
      border-color: #555;
    }

    .legend em {
      color: #bbb;
    }
  }
</style>
