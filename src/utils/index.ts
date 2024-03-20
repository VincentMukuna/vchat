export function compareUpdatedAt(a: any, b: any) {
  const dateA = new Date(a.$updatedAt);
  const dateB = new Date(b.$updatedAt);

  if (dateA < dateB) {
    return 1; // Sort b before a
  } else if (dateA > dateB) {
    return -1; // Sort a before b
  } else {
    return 0; // Dates are equal
  }
}

export function compareCreatedAt(a: any, b: any) {
  const dateA = new Date(a.$createdAt);
  const dateB = new Date(b.$createdAt);

  if (dateA < dateB) {
    return 1;
  } else if (dateA > dateB) {
    return -1;
  } else {
    return 0;
  }
}

//function to pluck properties from an object given a comma-separated string
export function pluck(obj: any, keys: string) {
  return keys.split(",").reduce((acc, key) => {
    acc[key.trim()] = obj[key.trim()];
    return acc;
  }, {} as any);
}
