<script>
  import projects from '$lib/projects.json';
  import Project from '$lib/Project.svelte';
  import Pie from '$lib/Pie.svelte';
</script>

<h1>{ projects.length } Projects</h1>
<Pie />

<svelte:head>
<title>My Projects</title>
</svelte:head>


{#each projects as project}
  <Project data={project} />
{/each}