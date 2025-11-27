export default function getSafeDisplayValue(val: any) {
  if (val == null) return '';
  if (typeof val === 'object') {
    return (val as any).$$typeof ? val : JSON.stringify(val);
  }
  return String(val);
}
