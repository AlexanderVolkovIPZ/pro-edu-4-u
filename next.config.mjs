/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    dirs: ['app', 'components', 'lib', 'pages', 'server', 'tests'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'avatars.githubusercontent.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '**',
      },
      {
        protocol: 'http',
        hostname: 'lh3.googleusercontent.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '**',
      },
      {
        protocol: 'http',
        hostname: 'res.cloudinary.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '**',
      },
      {
        protocol: 'http',
        hostname: 'www.google.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'www.google.com',
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;
