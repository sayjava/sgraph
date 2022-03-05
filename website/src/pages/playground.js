import React from 'react'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Layout from '@theme/Layout'
import CodeView from '@theme/CodeBlock'
import BrowserWindow from '../components/BrowserWindow'
import clsx from 'clsx'
import GraphiQL from 'graphiql'
import { createGraphiQLFetcher } from '@graphiql/toolkit'
import './playground.css'

const findQuery = `
{
    find_customer_by_pk(id: "ALFKI") {
        Orders(order: { OrderDate: DESC }, limit: 1) {
            OrderDate
            Listings_aggregate {
                total_Quantity
                avg_UnitPrice
            }
        }
    }
}
`

const createQuery = `
mutation { 
   create_employee(employee: {
    FirstName: "Jane",
    LastName: "Doe",
    Country: "United Kingdom",
    Manages: [
      {
        FirstName: "John",
        LastName: "Doe",
        Country: "United States"
      }
    ]
  }) {
    Manages_aggregate {
      count
    }
  }
}
`

const updateQuery = `
mutation { 
   update_order_by_pk(
    id: 10252, 
    data: { 
      ShipName: "Our New Shipper",
    }) {
    ShipName
    ShipCountry
  }
}
`

const deleteQuery = `
mutation {
  delete_categories(
      where: {
          CategoryName: {
              like: "%Unsupported"
            }
        }, 
        limit: 1) {
  	affected
  }
}
`

const LeftFeature = ({ query, title, children }) => {
    const { siteConfig } = useDocusaurusContext()
    return (
        <div className='row' style={{ padding: '30px 0' }}>
            <div className='col col-6'>
                <h3>{title}</h3>
                <div>{children}</div>
            </div>
            <div className='col col-6'>
                <BrowserWindow url={siteConfig.customFields.graphqlEndpoint}>
                    <CodeView language="graphql">
                        {query}
                    </CodeView>
                </BrowserWindow>
            </div>
        </div>
    )
}

const RightFeature = ({ query, title, children }) => {
    const { siteConfig } = useDocusaurusContext()
    return (
        <div className='row' style={{ padding: '30px 0' }}>
            <div className='col col-6'>
                <BrowserWindow url={siteConfig.customFields.graphqlEndpoint}>
                    <CodeView language="graphql">
                        {query}
                    </CodeView>
                </BrowserWindow>
            </div>
            <div className='col col-6'>
                <h3>{title}</h3>
                <div>{children}</div>
            </div>
        </div>
    )
}

export default function PlaygroundPage() {
    const { siteConfig } = useDocusaurusContext()
    const endpoint = siteConfig.customFields.graphqlEndpoint

    const fetcher = createGraphiQLFetcher({
        url: endpoint,
    })

    const initialQuery = `
{ 
    find_customers(limit: 2) {
        count
        customers {
            ContactName 
        }
    } 
}
    `

    const heroSchema = `
    type Customer @model {
        Id: ID
        Orders: [Order] @hasMany
    }

    type Order @model {
        Id: Int @primaryKey @autoIncrement
        Customer: Customer @belongsTo

        Listings: [OrderDetail] @hasMany
    }

    type OrderDetail @model {
        Id: ID
        OrderId: String
        ProductId: String

        Product: Product @belongsTo(sourceKey: "ProductId")
        Order: Product @belongsTo(sourceKey: "OrderId")
    }

    type Product @model {
        Id: Int @primaryKey @autoIncrement
        ProductName: String
    }
    `

    return (
        <Layout
            title={`${siteConfig.title}`}
            description="Northwind API Graphql"
        >
            <main>
                <div className="hero hero--primary" style={{ height: '100vh' }}>
                    <div className="container">
                        <div className='row'>
                            <div className='col col-6'>
                                <h1 className="hero__title">Northwind Database Inc API.</h1>
                                <p className="hero__subtitle">
                                    an <b>sGraph</b> powered GraphQL API
                                </p>
                                <div>
                                    <a href='https://github.com/sayjava/sgraph/tree/main/examples/northwind' className="button button--secondary button--lg">Github Project</a>
                                </div>
                            </div>
                            <div className='col col-6'>
                                <CodeView language="graphql" title="schema.graphql (Abbreviated)">
                                    {heroSchema}
                                </CodeView>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="hero hero-secondary">
                    <div className='container'>
                        <RightFeature title="Find Stuff" query={findQuery}>
                            <p>
                                <ul>
                                    <li>
                                        Find a specific customer with an id <b>ALFKI</b>
                                    </li>
                                    <li>
                                        Get their latest order and the <b>OrderDate</b>
                                    </li>
                                    <li>
                                        Retrieve the total cost of their order
                                    </li>
                                    <li>
                                        Retrieve the Average price of the items in that order
                                    </li>
                                </ul>
                            </p>
                        </RightFeature>
                        <LeftFeature title="Create Stuff" query={createQuery}>
                            <p>
                                Create employees and those who they manage easily in one mutation operation
                            </p>
                        </LeftFeature>
                        <RightFeature title="Update Stuff" query={updateQuery}>
                            <p>
                                Update a specific order with a new shipper
                            </p>
                        </RightFeature>
                        <LeftFeature title="Delete Stuff" query={deleteQuery}>
                            <p>
                                Remove dead categories easily from our system but limit the damage
                            </p>
                        </LeftFeature>
                    </div>
                </div>

                <div className='hero'>
                    <div className="container">
                        <h1 className="hero__title" style={{ textAlign: "center" }}>Experiment With Our API</h1>
                        <div className="editor">
                            <BrowserWindow>
                                <GraphiQL
                                    fetcher={fetcher}
                                    editorTheme={'solarized light'}
                                    query={initialQuery}
                                >
                                    <GraphiQL.Logo>
                                        Northwind Inc. API
                                    </GraphiQL.Logo>
                                </GraphiQL>
                            </BrowserWindow>
                        </div>
                    </div>
                </div>
            </main>
        </Layout>
    )
}
