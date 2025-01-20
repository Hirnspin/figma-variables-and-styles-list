interface String {
  toKebabCase(): String;
}

String.prototype.toKebabCase = function (): String {
  const kebap = this.match(
    /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g,
  )!
    .map((x) => x.toLowerCase())
    .join("-");

  if (kebap) return kebap;
  return this;
};
