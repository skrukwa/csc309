function paginateArray(arr, pageSize, pageNumber) {
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

function average(arr) {
  // arr: an array of numbers
  // returns the average of the array
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function sort_by_ordering(arr) {
  // arr: array to be sorted
  // ordering: a function that takes two arguments and returns a boolean
  // returns the array sorted by the ordering function
  return arr.sort((a, b) => ordering(b, a));
}
