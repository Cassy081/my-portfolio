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
  
    // SVG element references
    let xAxis, yAxis, yAxisGridlines;
  
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
      const xScale = d3.scaleTime()
        .domain(d3.extent(commits, d => d.datetime))
        .nice()
        .range([usableArea.left, usableArea.right]);
  
      const yScale = d3.scaleLinear()
        .domain([0, 24])
        .range([usableArea.bottom, usableArea.top]);
  
      // Set up the axes
      xAxis = d3.axisBottom(xScale);
      yAxis = d3.axisLeft(yScale);
  
      // Set up grid lines
      yAxisGridlines = d3.axisLeft(yScale)
        .tickFormat('') // Remove labels
        .tickSize(-usableArea.width); // Make tick lines extend across chart
  
      // Select the SVG and bind data
      const svg = d3.select("#scatterplot");
  
      svg.selectAll("circle")
        .data(commits)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.datetime))
        .attr("cy", d => yScale(d.hourFrac))
        .attr("r", 5)
        .attr("fill", "steelblue");
  
      // Render axes
      d3.select("#x-axis").call(xAxis);
      d3.select("#y-axis").call(yAxis);
      d3.select("#y-axis-gridlines").call(yAxisGridlines);
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
    <svg id="scatterplot" width={width} height={height}>
      <g id="y-axis-gridlines" class="gridlines" transform={`translate(${usableArea.left}, 0)`}></g>
      <g id="x-axis" transform={`translate(0, ${usableArea.bottom})`}></g>
      <g id="y-axis" transform={`translate(${usableArea.left}, 0)`}></g>
      <!-- Scatterplot circles are rendered here -->
    </svg>
  </section>
  
  <style>
    /* Style section for summary stats */
    section {
      margin-bottom: 30px;
    }
  
    /* Style for summary stats */
    dl {
      display: grid;
      grid-template-columns: 1fr 1fr; /* Label and value columns */
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
  
    /* SVG styling */
    svg {
      overflow: visible;
    }
  
    /* Dark theme styling */
    @media (prefers-color-scheme: dark) {
      section {
        background-color: #2f2f2f;
        color: #ddd;
      }
  
      dt, dd {
        color: #ddd;
      }
      .gridlines line {
        stroke: #777;
        stroke-opacity: 0.2;
      }
    }
  </style>
  