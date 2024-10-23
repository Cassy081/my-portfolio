<script>
    import projects from '$lib/projects.json'; // Import your project data
    import Project from '$lib/Project.svelte'; // Import your Project component
</script>

<h1>Rongrong Xu</h1>
<p>I'm a data science major student passionate about using data to solve real-world problems.</p>
<!-- svelte-ignore a11y_img_redundant_alt -->
<img src="/images/WechatIMG7.jpg" alt="A photo of me, a data science major student" width="300" height="300">

<h2>Latest Projects</h2>
<div class="projects highlights">
    {#each projects.slice(0, 3) as project}
        <Project data={project} />
    {/each}
</div>

<style>
    .projects {
        display: flex; /* Or use grid if desired */
        flex-direction: column; /* Align items vertically */
        gap: 20px; /* Space between projects */
    }

    .projects.highlights {
        background-color: #f9f9f9; /* Example background color for highlights */
        padding: 20px;
        border-radius: 8px;
    }
</style>
