const getAnnouncementDate = (date) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() - 3);
  d.setDate(d.getDate() - 7);
  return d;
};
console.log(getAnnouncementDate(new Date('2024-10-15T12:00:00Z')));
