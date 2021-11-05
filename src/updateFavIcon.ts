export default function updateFavIcon(): void {
  const faviconTags = document.getElementsByClassName(
    'js-site-favicon',
  ) as HTMLCollectionOf<HTMLLinkElement>;
  let lastCheck = false;

  function changeFavIcon(isDark: boolean) {
    if (lastCheck === isDark) {
      return;
    }
    lastCheck = isDark;
    const search = lastCheck ? 'favicon.' : 'favicon-dark.';
    const replace = lastCheck ? 'favicon-dark.' : 'favicon.';
    for (let i = 0; i < faviconTags.length; i++) {
      faviconTags[i].href = faviconTags[i].href.replace(search, replace);
    }
  }

  // first run
  changeFavIcon(window.matchMedia('(prefers-color-scheme: dark)').matches);

  // listen to events
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', (e) => changeFavIcon(e.matches));
}
