<script type="module" src="/global.js"></script>

<h1>Contact Me</h1>

<svelte:head>
  <title>Contact me</title>
</svelte:head>

<form action="mailto:rox002@ucsd.edu" method="POST" enctype="text/plain">
    <label>
        Your Email:
        <input type="email" name="email" required>
    </label>
    <br>
    <label>
        Subject:
        <input type="text" name="subject" required>
    </label>
    <br>
    <label>
        Message:
        <textarea name="body" required></textarea>
    </label>
    <br>
    <button>Send Message</button>
</form>