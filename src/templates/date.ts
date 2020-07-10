const textFormatOptions: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

export const toString = (date: Date): string => date.toISOString().split('T')[0];
export const toDisplayString = (date: Date): string => date.toLocaleDateString('en-US', textFormatOptions);

export default (date: Date, ariaLabel?: string): string => {
  const ariaLabelAttribute = ariaLabel ? ` aria-label="${ariaLabel}"` : '';
  return `<time datetime="${toString(date)}"${ariaLabelAttribute}>${toDisplayString(date)}</time>`;
};
