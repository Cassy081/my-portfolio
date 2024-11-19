<script>
  import * as d3 from 'd3';
  import Pie from '$lib/Pie.svelte';
  import { onMount } from 'svelte';
  import { axisBottom, axisLeft } from 'd3-axis';
  import { select } from 'd3-selection';
  import { format } from 'd3-format';
  

  let hoveredIndex = -1;
  let hoveredCommit = {}; 
  $: hoveredCommit = commits[hoveredIndex] ?? {};
  let data = [];
  let commits = [];
  let width = 1000, height = 600;
  let margin = { top: 10, right: 10, bottom: 30, left: 20 };
  let usableArea = {
     top: margin.top,
     right: width - margin.right,
     bottom: height - margin.bottom,
     left: margin.left,
     width: width - margin.left - margin.right,
     height: height - margin.top - margin.bottom
  };

  let xAxis, yAxis, yAxisGridlines;
  let xScale = d3.scaleTime().range([usableArea.left, usableArea.right]);
  let yScale = d3.scaleLinear().domain([0, 24]).range([usableArea.bottom, usableArea.top]);
  let tooltipPosition = { x: 0, y: 0 };
  let commitTooltip;
  let svg;
  let brushSelection = null;
  $: brushSelection;
  //let minRadius= 2;
  //let maxRadius = 30;
  //let rScale;

  //let xScale = d3.scaleTime()
     //.range([0, width]);
  //let yScale = d3.scaleLinear()
     //.domain([0, 24])
     //.range([height, 0]);
  
  async function dotInteraction(index, evt) {
     let hoveredDot = evt.target;

     if (evt.type === 'mouseenter' || evt.type === 'focus') {
        hoveredIndex = index;
        tooltipPosition = await computePosition(hoveredDot, commitTooltip, {
           strategy: 'fixed',
           middleware: [
              offset(5),
              autoPlacement(),
           ],
        });
     } else if (evt.type === 'mouseleave' || evt.type === 'blur') {
        hoveredIndex = -1;
     }
  }

  onMount(async () => {
     data = await d3.csv('loc.csv', (row) => ({
        ...row,
        line: Number(row.line),
        depth: Number(row.depth),
        length: Number(row.length),
        date: new Date(row.date + 'T00:00' + row.timezone),
        datetime: new Date(row.datetime),
        language: row.type,
    }));
    commits = d3
        .groups(data, (d) => d.commit)
        .map(([commit, lines]) => {
           let first = lines[0];
           let { author, date, time, timezone, datetime } = first;
           let ret = {
              id: commit,
              url: 'https://github.com/vis-society/lab-7/commit/' + commit,
              author,
              date,
              time,
              timezone,
              datetime,
              hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
              totalLines: lines.length,
           };
           Object.defineProperty(ret, 'lines', {
              value: lines,
              configurable: true,
              writable: true,
              enumerable: false,
           });

           return ret;
        });
        //commits = d3.sort(commits, d => -d.totalLines);
        xScale.domain(d3.extent(commits, d => d.datetime));
        yScale.domain([0, 24]);

        //const xScale = scaleTime()
           //.domain(extent(commits, d => d.datetime))
           //.range([usableArea.left, usableArea.right])
           //.nice();

        //const yScale = scaleLinear()
           //.domain([0, 24])
           //.range([usableArea.bottom, usableArea.top]);

        //let [minLines, maxLines] = d3.extent(commits, d => d.totalLines);
        //let rScale = d3.scaleSqrt()
           //.domain([minLines, maxLines])
           //.range([minRadius, maxRadius]);


        select(xAxis).call(axisBottom(xScale));
        select(yAxis).call(axisLeft(yScale)
           .tickFormat(d => String(d % 24).padStart(2, '0') + ':00'));

        select(yAxisGridlines).call(
           axisLeft(yScale)
              .tickFormat('')
              .tickSize(-usableArea.width)
        );
  });
function brushed(evt) {
 brushSelection = evt.selection;
}

function isCommitSelected(commit) {
 if (!brushSelection) {
   return false;
 }
 let min = { x: brushSelection[0][0], y: brushSelection[0][1] };
 let max = { x: brushSelection[1][0], y: brushSelection[1][1] };
 let x = xScale(commit.datetime);
 let y = yScale(commit.hourFrac);
 return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
}

$: numFiles = d3.group(data, d => d.file).size;
$: maxFileLength = d3.max(data, d => d.line);
$: avgLineLength = d3.mean(data, d => d.length);
$: {
  d3.select(svg).call(d3.brush().on('start brush end', brushed));
  d3.select(svg).selectAll('.dots, .overlay ~ *').raise();
}
$: selectedCommits = brushSelection ? commits.filter(isCommitSelected) : [];
$: hasSelection = brushSelection && selectedCommits.length > 0;

$: selectedLines = (hasSelection ? selectedCommits : commits).flatMap(
 (d) => d.lines
);

$: languageBreakdown = d3.rollups(
 selectedLines,
 (v) => v.length,
 (d) => d.language
//).sort((a, b) => b[1] - a[1]);
).map(([language, lines]) => ({
 language,
 lines,
 proportion: lines / selectedLines.length
})).sort((a, b) => b.lines - a.lines);

const formatPercent = format('.1~%');

//$: pieChartData = Array.from(languageBreakdown).map(([language, lines]) => ({
   //label: language,
   //value: lines
 //}));
$: pieChartData = languageBreakdown.map(({ language, lines }) => ({
  label: language,
  value: lines
}));

</script>
<svelte:head>
  <title>Meta Page</title>
</svelte:head>

<h1>Meta</h1>

<dl class="stats">
  <dt>Total <abbr title="Lines of code">LOC</abbr></dt>
  <dd>{data.length}</dd>
  <dt>Total Commits</dt>
  <dd>{commits.length}</dd>
  <dt>Number of Files</dt>
  <dd>{numFiles}</dd>
  <dt>Maximum File Length</dt>
  <dd>{maxFileLength} lines</dd>
  <dt>Average Line Length</dt>
  <dd>{avgLineLength ? avgLineLength.toFixed(2) : 'N/A'} characters</dd>
</dl>

<h2>Commits by time of day</h2>
<svg bind:this={svg} viewBox="0 0 {width} {height}">
  <g class="gridlines" transform="translate({usableArea.left}, 0)" bind:this={yAxisGridlines} />
  <g transform="translate(0, {usableArea.bottom})" bind:this={xAxis} />
  <g transform="translate({usableArea.left}, 0)" bind:this={yAxis} />
  <g class="dots">
   {#each commits as commit, index}
     <circle
        cx={xScale(commit.datetime)}
        cy={yScale(commit.hourFrac)}
        r="5"
        fill="steelblue"
        role="button"
        tabindex="0"
        aria-describedby="commit-tooltip"
        aria-haspopup="true"
        on:mouseenter={evt => dotInteraction(index, evt)}
        on:mouseleave={evt => dotInteraction(index, evt)}
        on:focus={evt => dotInteraction(index, evt)}
        on:blur={evt => dotInteraction(index, evt)}
        class:selected={isCommitSelected(commit)}
     />
   {/each}
 </g>
</svg>

<p>{hasSelection ? selectedCommits.length : "No"} commits selected</p>


<div>
  <h3>Language Breakdown</h3>
  <Pie data={pieChartData} />
</div>



<dl id="commit-tooltip" class="info tooltip" hidden={hoveredIndex === -1} bind:this="{commitTooltip}" style="top: {tooltipPosition.y}px; left: {tooltipPosition.x}px">
  <dt>Commit</dt>
  <dd>
    <a href="{ hoveredCommit.url }" target="_blank">{ hoveredCommit.id }</a>
  </dd>

  <dt>Date</dt>
  <dd>{hoveredCommit.datetime?.toLocaleString("en", {dateStyle: "full"}) }</dd>
  
  <dt>Time</dt>
  <dd>{hoveredCommit.datetime?.toLocaleTimeString()}</dd>
  
  <dt>Author</dt>
  <dd>{hoveredCommit.author}</dd>
  
  <dt>Lines Edited</dt>
  <dd>{hoveredCommit.totalLines}</dd>
  
</dl>


<style>
  dl.info {
     display: grid;
     grid-template-columns: auto 1fr;
     gap: 0.5em;
     color: #333;
     font-size: 0.9rem;
     transition-duration: 500ms;
     transition-property: opacity, visibility;
     background-color: rgba(255, 255, 255, 0.9); 
     border-radius: 8px;
     box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
     backdrop-filter: blur(8px);
  } 

  dl.info[hidden]:not(:hover, :focus-within) {
     opacity: 0;
     visibility: hidden;
  }

  .tooltip {  
     position: fixed;
     top: 1em;
     left: 1em;
     z-index: 10;
     padding: 0.2rem;
  }

  circle {
     transition: transform 200ms;
     transform-origin: center;
     transform-box: fill-box;
  }

  circle:hover {
     transform: scale(1.5);
  }

  circle.selected {
     fill: #ff6b6b;
     stroke: #c44d58;
     stroke-width: 2px;
  }

  .stats {
     display: grid;
     gap: 1rem;
     padding: 1rem;
     background-color: #f5f5f5;
     border-radius: 8px;
     box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .stats dt {
     font-weight: bold;
     color: #333;
     margin-bottom: 0.25rem;
  }

  .stats dd {
     margin: 0;
     font-size: 1.2rem;
     color: #666;
  }

  svg {
     overflow: visible;
  }

  .gridlines {
     stroke-opacity: 0.2;
  }
</style>
