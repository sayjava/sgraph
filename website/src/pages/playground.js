import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

import { createGraphiQLFetcher } from '@graphiql/toolkit';

const fetcher = createGraphiQLFetcher({
    url: 'http://localhost:8080/graphql',
});


export default function PlaygroundPage() {
    const { siteConfig } = useDocusaurusContext();
    return (
        <Layout
            title={`${siteConfig.title}`}
            description="Northwind API Graphql">
            <main style={{ height: '100vh', marginTop: '20px' }}>
            </main>
        </Layout>
    );
}
