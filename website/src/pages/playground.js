import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

import GraphiQL from 'graphiql';
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
                <div className='container' style={{ height: "80%" }}>
                    <GraphiQL fetcher={fetcher} editorTheme={'solarized light'} />
                </div>
            </main>
        </Layout>
    );
}
