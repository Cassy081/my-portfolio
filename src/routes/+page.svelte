<script>
    import projects from '$lib/projects.json'; // Import your project data
    import Project from '$lib/Project.svelte'; // Import your Project component

        // Mock profile data to avoid API rate limits while testing CSS
        let profileData = {
      followers: 1,
      following: 0,
      public_repos: 2,
      public_gists: 0,
    };

    // Set up data variable directly with mock data
    let data = profileData;

</script>

<h1>Rongrong Xu</h1>
<p>I'm a data science major student passionate about using data to solve real-world problems.</p>
<!-- svelte-ignore a11y_img_redundant_alt -->
<img src="/images/WechatIMG7.jpg" alt="A photo of me, a data science major student" width="300" height="300">


{#await fetch("https://api.github.com/users/Cassy081") }
<p>Loading...</p>
{:then response} {#await response.json()}
<p>Decoding...</p>
{:then data}
{:catch error}
<p class="error">Something went wrong: {error.message}</p>
{/await} {:catch error}
<p class="error">Something went wrong: {error.message}</p>
{/await}

<section>
    <h2>My GitHub Stats</h2>
    <dl>
      <dt>Public Repositories:</dt>
      <dd>{data.public_repos}</dd>
      <dt>Followers:</dt>
      <dd>{data.followers}</dd>
      <dt>Following:</dt>
      <dd>{data.following}</dd>
      <dt>Public Gists:</dt>
      <dd>{data.public_gists}</dd>
    </dl>
</section>



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

    /* Apply grid to the dl element */
    dl {
        display: grid;
        grid-template-columns: repeat(4, 1fr); /* Four equal columns */
        gap: 10px; /* Optional: spacing between items */
    }

    /* Ensure dt and dd are in their specific rows */
    dt {
        grid-row: 1; /* Place all dt elements in the first row */
        font-weight: bold;
    }

    dd {
        grid-row: 2; /* Place all dd elements in the second row */
        margin: 0; /* Optional: remove default margin for cleaner alignment */
    }
</style>