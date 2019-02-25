export default function formatTimeTommy(time) {
  const date = new Date(time);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date
    .toJSON()
    .substr(0, 19)
    .replace('T', ' ');
}
