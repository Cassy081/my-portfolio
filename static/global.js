console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let pages = [
    { url: '.', title: 'Home' },
    { url: 'projects', title: 'Projects' },
    { url: 'cv', title: 'Resume' },
    { url: 'https://github.com/Cassy081/portfolio', title: 'GitHub' },
    { url: 'meta', title: 'Meta'},
    { url: 'contact', title: 'Contact' }
  ];


let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
    let url = p.url;

    let a = document.createElement('a');
    a.href = url;
    a.textContent = p.title;

    if (a.host === location.host && a.pathname === location.pathname) {
        a.classList.add('current');
    }

    if (!a.href.startsWith(location.origin)) {
        a.target = "_blank"; 
    }

    nav.append(a);
};


document.body.insertAdjacentHTML(
  'afterbegin',
  `
	<label class="color-scheme">
		Theme:
		<select id="theme-selector">
			<option value="light dark">Automatic</option>
			<option value="dark">Dark</option>
			<option value="light">Light</option>
		</select>
	</label>`
);