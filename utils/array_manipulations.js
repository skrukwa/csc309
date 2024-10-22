export function paginateArray(arr, pageSize, pageNumber) {
  // arr: array to be paginated
  // pageSize: number of items per page
  // pageNumber: page number to be returned
  let returnee = [];
  let start_page = pageSize * (pageNumber - 1);
  for (let i = start_page; i < start_page + pageSize; i++) {
    if (i < arr.length) {
      returnee.push(arr[i]);
    } else {
      return returnee;
    }
  }
  return returnee;
}

export function average(arr) {
  // arr: an array of numbers
  // returns the average of the array
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function sum(arr) {
    // arr: an array of numbers
    // returns the sum of the array
    return arr.reduce((a, b) => a + b, 0);
}

export function sort_by_ordering(arr, ordering) {
  // arr: array to be sorted
  // ordering: a function that takes two arguments and returns a boolean
  // returns the array sorted by the ordering function
    if (arr.length <= 1) return arr;

    let pivot = arr[0];
    let left = [];
    let right = [];

    for (let i = 1; i < arr.length; i++) {
        if (ordering(arr[i], pivot)) {
            left.push(arr[i]);
        } else {
            right.push(arr[i]);
        }
    }

    return [...sort_by_ordering(left, ordering), pivot, ...sort_by_ordering(right, ordering)];
}
