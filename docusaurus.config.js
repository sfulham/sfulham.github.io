/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: 'sfulham',
  tagline: 'A React-based static github website template.',
  url: 'https://sfulham.github.io',
  baseUrl: '/',
  organizationName: 'sfulham', // Usually your GitHub org/user name.
  projectName: 'sfulham.github.io', // Usually your repo name.
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  themeConfig: {
    navbar: {
      title: 'Home',
      items: [
        /*{
          type: 'doc',
          docId: 'about',
          position: 'left',
          label: 'More Info',
        },*/
        { to: 'blog', label: 'Blog', position: 'left' },
        {
          href: 'https://github.com/sfulham',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'sfulham',
          items: [
            {
              label: 'Home',
              to: '/',
            },
            {
              label: 'Riverland Technology Services',
              to: 'https://riverlandtech.au',
            },
            {
              label: 'GitHub',
              to: 'https://github.com/sfulham',
            },
          ],
        },
        {
          title: 'Other',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
          ],
        },
      ],
      // copyright: `Copyright © ${new Date().getFullYear()} MyPortfolio. Built with Docusaurus.`,
    },
  },

  themes: ['docusaurus-portfolio-theme'],
  plugins: [
    [
      'docusaurus-portfolio-plugin',
      {
        username: 'sfulham',
        path: '/',
        pageTitle: 'My Site',
        pageDescription: 'About me.',
        userOptions: {

        },
        repoOptions: {
          type: 'all',
          sort: 'updated',
          direction: 'desc',
          numRepos: 10,
        },
      },
    ],
  ],

  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://github.com/facebook/docusaurus/edit/master/website/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/facebook/docusaurus/edit/master/website/blog/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
