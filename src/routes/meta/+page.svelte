<script>
  import * as d3 from 'd3';
  import { onMount } from 'svelte';

  // Define dimensions and margins
  let width = 1000;
  let height = 600;
  let margin = { top: 10, right: 10, bottom: 30, left: 40 };

  // Calculate usable chart area
  let usableArea = {
    left: margin.left,
    right: width - margin.right,
    top: margin.top,
    bottom: height - margin.bottom,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  // Data-related variables
  let data = [];
  let commits = [];
  let totalLOC = 0;
  let totalCommits = 0;
  let maxDepth = 0;
  let longestLine = 0;
  let mostWorkPeriod = '';

  // Tooltip variables
  let hoveredIndex = -1;
  let hoveredCommit = {}; // Initialize to an empty object
  let cursor = { x: 0, y: 0 }; // Position object for tooltip

  $: hoveredCommit = commits[hoveredIndex] ?? {};
  let svg;
  let brushSelection = null;

  // SVG element references
  let xAxis, yAxis, yAxisGridlines;

  // Define scales as module-level variables to make them accessible in other functions
  let xScale, yScale;

  // Variables for the selected commits and their count
  let selectedCommits = [];
  let hasSelection = false;

  onMount(async () => {
    // Load CSV data
    data = await d3.csv('loc.csv', (row) => ({
      ...row,
      line: +row.line,
      depth: +row.depth,
      length: +row.length,
      datetime: new Date(row.datetime),
      hourFrac: new Date(row.datetime).getHours() + new Date(row.datetime).getMinutes() / 60,
    }));

    // Calculate stats
    totalLOC = data.length;
    commits = d3.groups(data, d => d.commit).map(([commit, lines]) => ({
      id: commit,
      datetime: new Date(lines[0].datetime),
      hourFrac: lines[0].hourFrac,
      author: lines[0].author,
      linesEdited: lines.length,
      url: lines[0].url || '#',
    }));
    totalCommits = commits.length;
    maxDepth = d3.max(data, d => d.depth);
    longestLine = d3.max(data, d => d.length);

    // Calculate the most active period of the day
    const workByPeriod = d3.rollups(data, v => v.length, d => d.datetime.getHours());
    mostWorkPeriod = workByPeriod.reduce((a, b) => (a[1] > b[1] ? a : b))[0];

    // Draw scatterplot
    drawScatterPlot();
  });

  function drawScatterPlot() {
    // Define the scales
    xScale = d3.scaleTime()
      .domain(d3.extent(commits, d => d.datetime))
      .nice()
      .range([usableArea.left, usableArea.right]);

    yScale = d3.scaleLinear()
      .domain([0, 24])
      .range([usableArea.bottom, usableArea.top]);

    // Set up the axes
    xAxis = d3.axisBottom(xScale);
    yAxis = d3.axisLeft(yScale);

    // Set up grid lines
    yAxisGridlines = d3.axisLeft(yScale)
      .tickFormat('')
      .tickSize(-usableArea.width);

    // Select the SVG and bind data
    const svg = d3.select("#scatterplot");

    svg.selectAll("circle")
      .data(commits)
      .enter()
      .append("circle")
      .attr("class", "dots")  // Add class for easy selection
      .attr("cx", d => xScale(d.datetime))
      .attr("cy", d => yScale(d.hourFrac))
      .attr("r", 5)
      .attr("fill", "steelblue")
      .on("mouseenter", (event, d) => {
        hoveredIndex = commits.indexOf(d);
        cursor = { x: event.x, y: event.y }; // Set initial position on enter
      })
      .on("mousemove", (event) => {
        cursor = { x: event.x, y: event.y }; // Update position on move
      })
      .on("mouseleave", () => {
        hoveredIndex = -1;
      });

    // Render axes
    d3.select("#x-axis").call(xAxis);
    d3.select("#y-axis").call(yAxis);
    d3.select("#y-axis-gridlines").call(yAxisGridlines);
  }

  // Function to check if a commit is within the brush selection
  function isCommitSelected(commit) {
    if (!brushSelection) return false;  // If no selection, nothing is selected

    const [x0, y0] = brushSelection[0];
    const [x1, y1] = brushSelection[1];

    const commitX = xScale(commit.datetime);
    const commitY = yScale(commit.hourFrac);

    return commitX >= x0 && commitX <= x1 && commitY >= y0 && commitY <= y1;
  }

  // Brush functionality
  $: {
    d3.select(svg).call(d3.brush().on('start brush end', brushed));
    d3.select(svg).selectAll('.dots, .overlay ~ *').raise();
  }

  function brushed(evt) {
    console.log(evt);  // Log the brush event
    brushSelection = evt.selection; // Store the selection

    // Update selected commits and apply the "selected" class based on the brush selection
    selectedCommits = brushSelection ? commits.filter(isCommitSelected) : [];
    hasSelection = selectedCommits.length > 0;

    d3.selectAll(".dots")
      .classed("selected", d => isCommitSelected(d));
  }

  $: selectedLines = (hasSelection ? selectedCommits : commits).flatMap((d) => d.lines || []);

  $: languageBreakdown = d3.rollups(
  selectedLines,
  (v) => v.length, // Count the number of lines for each language
  (d) => d.language // Make sure the `language` field is available
);

  $: {
    console.log("selectedLines:", selectedLines); // Check the structure of selectedLines
  }
  $: {
  console.log("selectedLines:", selectedLines);
  // Check if each line has a `language` property
  selectedLines.forEach(line => {
    console.log(line.language);  // Ensure each line has a 'language' field
  });
}
  $: {
    console.log("languageBreakdown:", languageBreakdown); // Log language breakdown to see if it updates
  }

</script>

<!-- Display the summary stats -->
<section>
  <h2>Summary</h2>
  <dl>
    <dt>Total <abbr title="Lines of Code">LOC</abbr></dt>
    <dd>{totalLOC}</dd>

    <dt>Total Commits</dt>
    <dd>{totalCommits}</dd>

    <dt>Maximum Depth</dt>
    <dd>{maxDepth}</dd>

    <dt>Longest Line Length (characters)</dt>
    <dd>{longestLine}</dd>

    <dt>Time of Day with Most Work</dt>
    <dd>{mostWorkPeriod}:00</dd>
  </dl>
</section>

<!-- Scatterplot Section -->
<section>
  <h2>Commits by Time of Day</h2>
  <svg id="scatterplot" bind:this={svg} width={width} height={height}>
    <g id="y-axis-gridlines" class="gridlines" transform={`translate(${usableArea.left}, 0)`}></g>
    <g id="x-axis" transform={`translate(0, ${usableArea.bottom})`}></g>
    <g id="y-axis" transform={`translate(${usableArea.left}, 0)`}></g>
  </svg>
  <!-- Display the number of selected commits -->
  <p>{hasSelection ? selectedCommits.length : "No"} commits selected</p>
</section>

<section>
  <ul>
    {#each languageBreakdown as [language, lines]}
      <li>
        {language}: 
        {#if selectedLines.length > 0}
          {Math.round((lines / selectedLines.length) * 100)}%
        {:else}
          0%
        {/if}
      </li>
    {/each}
  </ul>
</section>

<!-- Tooltip -->
<dl id="commit-tooltip" class="info tooltip"
    style="display: {hoveredIndex !== -1 ? 'block' : 'none'};
           top: {Math.min(cursor.y + 10, window.innerHeight - 50)}px;
           left: {Math.min(cursor.x + 10, window.innerWidth - 150)}px;">
  <dt>Commit</dt>
  <dd><a href="{hoveredCommit.url}" target="_blank" rel="noopener noreferrer">{hoveredCommit.id}</a></dd>

  <dt>Date</dt>
  <dd>{hoveredCommit.datetime?.toLocaleString("en", { dateStyle: "full" })}</dd>

  <dt>Time</dt>
  <dd>{hoveredCommit.datetime?.toLocaleTimeString("en", { timeStyle: "short" })}</dd>

  <dt>Author</dt>
  <dd>{hoveredCommit.author || 'Unknown'}</dd>

  <dt>Lines Edited</dt>
  <dd>{hoveredCommit.linesEdited || '0'}</dd>
</dl>

<style>
  /* Style section for summary stats */
  section {
    margin-bottom: 30px;
  }

  dl {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  dt {
    font-weight: bold;
  }

  dd {
    margin: 0;
    padding-left: 10px;
  }

  /* Gridline styling */
  .gridlines line {
    stroke: #ccc;
    stroke-opacity: 0.2;
  }

  /* Tooltip styling */
  dl.info {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.5em;
    margin: 0;
  }

  .info dt {
    color: gray;
  }

  .tooltip {
    position: fixed;
    background-color: white;
    padding: 1em;
    border: 1px solid #ccc;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  /* SVG styling */
  svg {
    border: 1px solid #ccc;
  }

  /* Selected styling for dots */
  .dots.selected {
    fill: orange;
  }
</style>

