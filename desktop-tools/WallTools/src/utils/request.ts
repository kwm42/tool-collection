export const fetchData = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    ...options,
    mode: 'no-cors'
  });
  return response.json();
};
