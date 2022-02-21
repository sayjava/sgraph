// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'sGraph',
  tagline: 'Instant graphql server, batteries included',
  url: 'https://sayjava.github.io/sgraph',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'sayjava', // Usually your GitHub org/user name.
  projectName: 'sgraph', // Usually your repo name.
  customFields: {
    graphqlEndpoint: 'http://localhost:8080/graphql',
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          remarkPlugins: [require('mdx-mermaid')],
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/sayjava/sgraph/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/sayjava/sgraph/tree/main/packages/create-docusaurus/templates/shared/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'sGraph',
        logo: {
          alt: 'sGraph Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'doc',
            docId: 'start',
            position: 'left',
            label: 'Start',
          },
          {
            type: 'doc',
            docId: 'guide/schema',
            position: 'left',
            label: 'Guide',
          },
          {
            to: 'playground', label: 'Playground', position: 'left'
          },
          {
            href: 'https://github.com/sayjava/github',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Start',
                to: '/docs/start',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/sgraph',
              },
              {
                label: 'Discord',
                href: 'https://discordapp.com/invite/sgraph',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/sayjava',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} sGraph, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
