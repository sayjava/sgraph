import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

import GraphiQL from 'graphiql';
import { createGraphiQLFetcher } from '@graphiql/toolkit';

export default function PlaygroundPage() {
    const { siteConfig } = useDocusaurusContext();

    const fetcher = createGraphiQLFetcher({
        url: siteConfig.customFields.graphqlEndpoint,
    });

    const initialQuery = `{ 
    find_customers(limit: 2) {
        count
        customers {
            ContactName 
        }
    } 
}
    `

    return (
        <Layout
            title={`${siteConfig.title}`}
            description="Northwind API Graphql">
            <main style={{ height: '100vh', marginTop: '20px' }}>
                <div className='container' style={{ height: "80%" }}>
                    <GraphiQL fetcher={fetcher} editorTheme={'solarized light'} query={initialQuery}>
                        <GraphiQL.Footer>
                            <span>Nuclear war</span>
                        </GraphiQL.Footer>
                    </GraphiQL>
                </div>
            </main>
        </Layout>
    );
}
