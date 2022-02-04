import request from 'supertest'
import express from 'express'
import { createTestServer } from '../server'

describe('Associations', () => {
    let app

    beforeAll(async () => {
        app = createTestServer({
            typeDefs: './test/fixtures/northwind.graphql',
            databaseUrl: 'sqlite:test/fixtures/northwind.sqlite',
        })
    })

    it('hasMany', async () => {
        const res = await request(app)
            .post('/')
            .send({
                query: `query {
                    customer: find_customer_by_pk(id: "ALFKI") {
                            Id
                            ContactName
                            Orders(limit: 2) {
                                Id
                                Freight
                                Customer {
                                    Id
                                    ContactName
                                }
                                Employee {
                                    FirstName
                                }
                            }
                        }
                    }`,
            })

        expect(res.body.data.customer).toMatchInlineSnapshot(`
            Object {
              "ContactName": "Maria Anders",
              "Id": "ALFKI",
              "Orders": Array [
                Object {
                  "Customer": Object {
                    "ContactName": "Maria Anders",
                    "Id": "ALFKI",
                  },
                  "Employee": Object {
                    "FirstName": "Michael",
                  },
                  "Freight": 19.5,
                  "Id": 10643,
                },
                Object {
                  "Customer": Object {
                    "ContactName": "Maria Anders",
                    "Id": "ALFKI",
                  },
                  "Employee": Object {
                    "FirstName": "Margaret",
                  },
                  "Freight": 15,
                  "Id": 10692,
                },
              ],
            }
        `)
    })

    it('hasMany - Self Referential', async () => {
        const res = await request(app)
            .post('/')
            .send({
                query: `query {
                    employee: find_employee_by_pk(id: "2") {
                            Id
                            FirstName
                            Manages {
                                FirstName
                            }
                        }
                    }`,
            })

        expect(res.body.data.employee).toMatchInlineSnapshot(`
            Object {
              "FirstName": "Andrew",
              "Id": 2,
              "Manages": Array [
                Object {
                  "FirstName": "Nancy",
                },
                Object {
                  "FirstName": "Janet",
                },
                Object {
                  "FirstName": "Margaret",
                },
                Object {
                  "FirstName": "Steven",
                },
                Object {
                  "FirstName": "Laura",
                },
              ],
            }
        `)
    })

    it('belongsTo - Self Referential', async () => {
        const res = await request(app)
            .post('/')
            .send({
                query: `query {
                    employee: find_employee_by_pk(id: "1") {
                            Id
                            FirstName
                            Manager {
                                Id
                                FirstName
                            }
                        }
                    }`,
            })

        expect(res.body.data.employee).toMatchInlineSnapshot(`
            Object {
              "FirstName": "Nancy",
              "Id": 1,
              "Manager": Object {
                "FirstName": "Andrew",
                "Id": 2,
              },
            }
        `)
    })

    it('belongsTo', async () => {
        const res = await request(app)
            .post('/')
            .send({
                query: `query {
                    detail: find_orderdetail_by_pk(id: "10248/11") {
                            Id
                            Product {
                                ProductName
                                UnitPrice
                            }
                        }
                    }`,
            })

        expect(res.body.data.detail).toMatchInlineSnapshot(`
            Object {
              "Id": "10248/11",
              "Product": Object {
                "ProductName": "Queso Cabrales",
                "UnitPrice": 21,
              },
            }
        `)
    })

    it('manyToMany', async () => {
        const res = await request(app)
            .post('/')
            .send({
                query: `query {
                    orders:find_orders(limit: 1) {
                        records {
                          Id
                          OrderDate
                          Customer {
                            ContactName
                          }
                          Products {
                            UnitPrice
                            ProductName
                          }
                        }
                      }
                    }`,
            })

        expect(res.body.data.orders.records).toMatchInlineSnapshot(`
            Array [
              Object {
                "Customer": Object {
                  "ContactName": "Paul Henriot",
                },
                "Id": 10248,
                "OrderDate": "2012-07-04",
                "Products": Array [
                  Object {
                    "ProductName": "Queso Cabrales",
                    "UnitPrice": 21,
                  },
                  Object {
                    "ProductName": "Singaporean Hokkien Fried Mee",
                    "UnitPrice": 14,
                  },
                  Object {
                    "ProductName": "Mozzarella di Giovanni",
                    "UnitPrice": 34.8,
                  },
                ],
              },
            ]
        `)
    })

    it('hasMany-hasOne', async () => {
        const res = await request(app)
            .post('/')
            .send({
                query: `query {
                    order:find_orders(limit: 1) {
                        records {
                          Id
                          Listings {
                            Quantity
                            Product {
                              ProductName
                              Category {
                                CategoryName
                              }
                            }
                          }

                          Listings_aggregate {
                            sum_Quantity
                          }
                        }
                      }
                    }`,
            })

        expect(res.body.data.order.records).toMatchInlineSnapshot(`
            Array [
              Object {
                "Id": 10248,
                "Listings": Array [
                  Object {
                    "Product": Object {
                      "Category": Object {
                        "CategoryName": "Dairy Products",
                      },
                      "ProductName": "Queso Cabrales",
                    },
                    "Quantity": 12,
                  },
                  Object {
                    "Product": Object {
                      "Category": Object {
                        "CategoryName": "Grains/Cereals",
                      },
                      "ProductName": "Singaporean Hokkien Fried Mee",
                    },
                    "Quantity": 10,
                  },
                  Object {
                    "Product": Object {
                      "Category": Object {
                        "CategoryName": "Dairy Products",
                      },
                      "ProductName": "Mozzarella di Giovanni",
                    },
                    "Quantity": 5,
                  },
                ],
                "Listings_aggregate": Object {
                  "sum_Quantity": 27,
                },
              },
            ]
        `)
    })
})
