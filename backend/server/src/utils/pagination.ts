export const parsePagination = (query: any) => {
  const page = Math.max(parseInt(query.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(query.limit || "12", 10), 1), 100);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};
