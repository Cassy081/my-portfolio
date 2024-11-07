<script>
import projects from '$lib/projects.json';
import Project from '$lib/Project.svelte';
import Pie from '$lib/Pie.svelte';
import * as d3 from 'd3';

let query = '';

// Reactive filteredProjects
let filteredProjects;
  $: filteredProjects = projects.filter((project) => {
    if (query) {
      // Case-insensitive filtering across all project properties
      let projectData = Object.values(project).join(' ').toLowerCase();
      return projectData.includes(query.toLowerCase());
    }
    return true;
  });

// Create pieData based on filteredProjects
let pieData;
$: {
  let rolledData = d3.rollups(
    filteredProjects,
    (v) => v.length,
    (d) => d.year // Assuming each project has a year property
  );
  pieData = rolledData.map(([year, count]) => {
    return { value: count, label: year };
  });
  }
</script>

<h1>{filteredProjects.length} Projects</h1>
<Pie data={pieData} />


<div class="search-container">
  <input
    type="search"
    bind:value={query}
    aria-label="Search projects"
    placeholder="🔍 Search projects…"
    class="search-bar"
  />
</div>

<svelte:head>
<title>My Projects</title>
</svelte:head>


<!-- Project List -->
{#each filteredProjects as project}
  <Project data={project} />
{/each}


<style>
  /* Search Bar Styles */
  .search-container {
    display: flex;
    justify-content: center;
    margin: 2em 0;
  }

  .search-bar {
    width: 100%;
    max-width: 400px;
    padding: 0.8em 1.2em;
    font-size: 1.1em;
    border: 2px solid #ddd;
    border-radius: 25px;
    outline: none;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
    background-color: #f8f8f8;
  }

  .search-bar:focus {
    border-color: #3f51b5; /* Focused blue color */
    box-shadow: 0 0 5px rgba(63, 81, 181, 0.5); /* Light shadow on focus */
  }

  .search-bar::placeholder {
    color: #aaa;
    font-style: italic;
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .search-bar {
      background-color: #333;
      color: white;
      border: 2px solid #555;
    }

    .search-bar:focus {
      border-color: #66a3ff; /* Lighter blue for dark mode */
    }

    .search-bar::placeholder {
      color: #bbb;
    }
  }
</style>