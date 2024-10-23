<script>
  export let data;
  export let hLevel = 2; // Default heading level is 2
</script>

<div class="project-container">

<article>
  <svelte:element this={'h' + hLevel}>{data.title}</svelte:element>
  <p>{data.description}</p>
</article>
</div>

<style>
.project-container {
  display: flex;
  flex-wrap: wrap;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px; /* Adjust the gap between items */
  margin-top: 20px; /* Optional: add some space above the grid */
}

article {
    border: 1px solid #ddd; /* Example border style */
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;
    transition: box-shadow 0.3s;
}

article:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Example hover effect */
}
</style>
