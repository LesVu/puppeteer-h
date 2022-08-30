const date = new Date();
console.log(
  `${date.getDate()} ${new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date)}, ${
    date.getFullYear() - 2000
  }` == '30 Aug, 22'
);
console.log(
  `${date.getDate()} ${new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date)}, ${
    date.getFullYear() - 2000
  }`
);
