<script>
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import * as d3 from 'd3';
    import csvData from './data.csv'; // Assuming CSV is in the same folder
  
    // State for filter selections
    const workModel = writable('remote');
    const selectedRoles = writable([]);
    const selectedIndustries = writable([]);
    const selectedSeniority = writable([]);
  
    let data = []; // Store the dataset after loading
  
    // Load CSV data
    onMount(async () => {
      data = await d3.csv(csvData);
      updateVisualization(); // Initial update with all data
    });
  
    // Function to filter data based on the selected filters
    function filterData() {
      let filteredData = data;
  
      $workModel && (filteredData = filteredData.filter(d => d.work_model === $workModel));
      if ($selectedRoles.length > 0) {
        filteredData = filteredData.filter(d => $selectedRoles.includes(d.role));
      }
      if ($selectedIndustries.length > 0) {
        filteredData = filteredData.filter(d => $selectedIndustries.includes(d.industry));
      }
      if ($selectedSeniority.length > 0) {
        filteredData = filteredData.filter(d => $selectedSeniority.includes(d.seniority));
      }
  
      return filteredData;
    }
  
    // Function to update the stacked bar chart visualization
    function updateVisualization() {
      const filteredData = filterData();
      const margin = { top: 40, right: 30, bottom: 40, left: 40 };
      const width = 800 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;
  
      const svg = d3.select('#chart')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
  
      // Prepare the data for stacked bar chart
      const stressLevels = ['low', 'medium', 'high'];
      const stackedData = d3.stack()
        .keys(stressLevels)
        .value((d, key) => d[key])
        (d3.nest()
          .key(d => d.role)
          .rollup(leaves => {
            return {
              low: leaves.filter(d => d.stress_level === 'low').length,
              medium: leaves.filter(d => d.stress_level === 'medium').length,
              high: leaves.filter(d => d.stress_level === 'high').length,
            };
          })
          .entries(filteredData)
          .map(d => ({ role: d.key, ...d.value }))
        );
  
      // Set up scales
      const x = d3.scaleBand()
        .domain(stackedData.map(d => d.role))
        .range([0, width])
        .padding(0.1);
  
      const y = d3.scaleLinear()
        .domain([0, d3.max(stackedData, d => d3.sum(d, key => key[1]))])
        .nice()
        .range([height, 0]);
  
      const color = d3.scaleOrdinal()
        .domain(stressLevels)
        .range(['#1f77b4', '#ff7f0e', '#2ca02c']);
  
      // Draw the bars
      svg.selectAll('.bar')
        .data(stackedData)
        .enter().append('g')
        .attr('class', 'bar')
        .attr('transform', d => `translate(${x(d.role)},0)`)
        .selectAll('rect')
        .data(d => d)
        .enter().append('rect')
        .attr('y', d => y(d[1]))
        .attr('height', d => y(d[0]) - y(d[1]))
        .attr('width', x.bandwidth())
        .attr('fill', d => color(d.key))
        .on('mouseover', function (event, d) {
          const tooltip = d3.select('#tooltip');
          tooltip.style('visibility', 'visible')
            .html(`${d.key}: ${Math.round((d[1] - d[0]) / filteredData.length * 100)}%`)
            .style('top', `${event.pageY - 28}px`)
            .style('left', `${event.pageX + 10}px`);
        })
        .on('mouseout', function () {
          d3.select('#tooltip').style('visibility', 'hidden');
        });
  
      // Axis
      svg.append('g')
        .selectAll('.x-axis')
        .data(stackedData)
        .enter().append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x));
  
      svg.append('g')
        .call(d3.axisLeft(y));
    }
  </script>
  
  <style>
    .chart-container {
      margin-top: 20px;
    }
  
    .filter-container {
      margin: 20px;
    }
  
    #tooltip {
      position: absolute;
      visibility: hidden;
      background-color: white;
      border: 1px solid #ddd;
      padding: 5px;
      border-radius: 3px;
      pointer-events: none;
    }
  </style>
  
  <div class="filter-container">
    <div>
      <label for="work-model">Work Model: </label>
      <select id="work-model" bind:value={$workModel} on:change={updateVisualization}>
        <option value="remote">Remote</option>
        <option value="onsite">On-site</option>
        <option value="hybrid">Hybrid</option>
      </select>
    </div>
  
    <div>
      <label for="roles">Roles: </label>
      <select multiple bind:value={$selectedRoles} on:change={updateVisualization}>
        <option value="manager">Manager</option>
        <option value="developer">Developer</option>
        <option value="engineer">Engineer</option>
        <!-- Add other roles as needed -->
      </select>
    </div>
  
    <div>
      <label for="industries">Industries: </label>
      <select multiple bind:value={$selectedIndustries} on:change={updateVisualization}>
        <option value="tech">Tech</option>
        <option value="healthcare">Healthcare</option>
        <option value="finance">Finance</option>
        <!-- Add other industries as needed -->
      </select>
    </div>
  
    <div>
      <label for="seniority">Seniority Level: </label>
      <select multiple bind:value={$selectedSeniority} on:change={updateVisualization}>
        <option value="junior">Junior</option>
        <option value="mid">Mid</option>
        <option value="senior">Senior</option>
      </select>
    </div>
  </div>
  
  <div class="chart-container">
    <svg id="chart"></svg>
  </div>
  
  <div id="tooltip"></div>
  