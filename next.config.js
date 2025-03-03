/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'ui-avatars.com',
                pathname: '/api/**',
            },
            // Thêm các domain khác nếu cần
        ],
        dangerouslyAllowSVG: true,
        unoptimized: true,
    },
    // Thêm cấu hình webpack để xử lý tên file có khoảng trắng
    webpack: (config) => {
        config.module.rules.push({
            test: /\.(png|jpe?g|gif|svg)$/i,
            loader: 'file-loader',
            options: {
                name: '[path][name].[ext]',
            },
        });
        return config;
    },
    reactStrictMode: true,
    transpilePackages: ['react-day-picker'],
}

module.exports = nextConfig 