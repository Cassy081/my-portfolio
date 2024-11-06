<script>
  import * as d3 from 'd3';

  // Create the arc generator
  const arcGenerator = d3.arc()
    .innerRadius(0)      // Inner radius of 0 for a pie chart (change to positive number for a donut chart)
    .outerRadius(50);    // Outer radius for the pie chart

  // Colors for each slice
  let colors = d3.scaleOrdinal(d3.schemeTableau10);

  // Sample data for two slices (33% and 66%)
  let data = [
  { value: 1, label: 'apples' },
  { value: 2, label: 'oranges' },
  { value: 3, label: 'mangos' },
  { value: 4, label: 'pears' },
  { value: 5, label: 'limes' },
  { value: 5, label: 'cherries' },
];

  // Create a slice generator to automatically calculate start and end angles
  let sliceGenerator = d3.pie().value((d) => d.value);
  let arcData = sliceGenerator(data);

  // Generate the path for each arc (slice) in the pie using the slice data
  let arcs = arcData.map((d) => arcGenerator(d));
</script>

<div class="container">
  <svg viewBox="-50 -50 100 100">
    {#each arcs as arc, i}
    <path d="{arc}" fill="{colors(i)}" />
    {/each}
  </svg>
  
  <ul class="legend">
    {#each data as d, index}
    <li style="--color: { colors(index) }">
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

  /* Do not clip shapes outside the viewBox */
  overflow: visible;
}

/* Legend styling */
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
</style>