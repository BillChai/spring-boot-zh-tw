// Run before styles paint to avoid flashing the wrong theme.
try {const choice=localStorage.getItem('spring-docs-theme');document.documentElement.classList.toggle('dark-theme',choice?choice==='dark':matchMedia('(prefers-color-scheme: dark)').matches);}catch{document.documentElement.classList.toggle('dark-theme',matchMedia('(prefers-color-scheme: dark)').matches);}
