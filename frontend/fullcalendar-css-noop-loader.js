// Webpack loader that no-ops FullCalendar's CSS injection.
// We load FullCalendar CSS statically via fullcalendar.css, so the JS-based
// injection (which crashes in Next.js SSR/production) is unnecessary.
module.exports = function (source) {
  return source.replace(
    "function injectStyles(styleText) {",
    "function injectStyles(styleText) { return;"
  );
};
