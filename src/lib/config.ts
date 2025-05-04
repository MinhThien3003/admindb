// Cấu hình cho API và backend
const config = {
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000',
  api: {
    baseUrl: process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    endpoints: {
      auth: {
        login: '/admins/login',
        logout: '/admins/logout',
        me: '/admins/me',
      },
      novels: '/novels',
      chapters: '/chapters',
      users: '/users',
      categories: '/categories',
      admins: '/admins',
      readerRankings: '/readerRankings',
      authorRankings: '/authorRankings',
      novelRankings: '/novelRankings',
      transactions: '/transactions',
      tasks: '/tasks',
      wallets: {
        authors: '/wallets'
      }
    }
  },
  auth: {
    tokenCookieName: 'admin_token',
    tokenExpiryDays: 7,
  },
  cloudinary: {
    name: process.env.NEXT_PUBLIC_CLOUDINARY_NAME,
    apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  },
};

export default config; 