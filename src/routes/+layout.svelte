<slot />

<script>
    import { onMount } from 'svelte';

    let localStorage = globalThis.localStorage ?? {};  // Fallback for SSR
    let colorScheme = localStorage.colorScheme ?? 'light dark';  // Use saved theme or default to 'light dark'

    let root = globalThis?.document?.documentElement;

    function setAdditionalStyles(scheme) {
        if (scheme === 'dark') {
            root?.style.setProperty('background-color', '#1a1a1a');
            root?.style.setProperty('color', '#ffffff');
        } else if (scheme === 'light') {
            root?.style.setProperty('background-color', '#ffffff');
            root?.style.setProperty('color', '#000000');
        } else {
            root?.style.removeProperty('background-color');
            root?.style.removeProperty('color');
        }
    }

    onMount(() => {
        setAdditionalStyles(colorScheme);
    });

    // Reactive statements to apply color scheme and save to localStorage
    $: root?.style.setProperty('color-scheme', colorScheme);
    $: setAdditionalStyles(colorScheme);
    $: localStorage.colorScheme = colorScheme;  // Save to localStorage reactively
</script>


<label class="color-scheme">
    Theme:
    <select bind:value={colorScheme}>
        <option value="light dark">Automatic</option>
        <option value="dark">Dark</option>
        <option value="light">Light</option>
    </select>
</label>
