const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    endpoints: {
      users: '/users',
      categories: '/categories'
    }
  }
};

export default config; 