export default function recursivelyStripNullValues(value: unknown): unknown {
  if (Array.isArray(value)) {
    // If value is array -> Check null value for every property in array
    return value.map(recursivelyStripNullValues);
  }
  if (value !== null && typeof value === 'object') {
    // return Object that cleared all null value key pair
    return Object.fromEntries(
      // Convert object to array then check if its null then stripping all null value
      Object.entries(value).map(([key, value]) => [
        key,
        recursivelyStripNullValues(value),
      ]),
    );
  }
  if (value !== null) {
    return value;
  }
}
