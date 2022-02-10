---
title: Associations
description: sGraph associations
---

`sGraph` supports all the different types of associations supported by [sequelize](https://sequelize.org/v7/manual/assocs.html) and the parameters

## Type Associations

| Association             | Directive        |
| ----------------------- | ---------------- |
| One-to-One, Many-to-One | `@belongsTo`     |
| Many-to-One             | `@hasMany`       |
| Many-to-Many            | `@belongsToMany` |
| One-to-One              | `@hasOne`        |

## One-to-Many

```graphql

```

## Many-to-Many

## Full Association Definition

```graphql
type Order @model {
    Id: Int @primaryKey @autoIncrement
    OrderDate: String @dateOnly
    Freight: Float
    ShipName: String
    ShipAddress: String
    ShipCountry: String
    ShipRegion: String
    ShippedDate: String
    RequiredDate: String
    CustomerId: String
    EmployeeId: String

    Customer: Customer @belongsTo(sourceKey: "CustomerId")
    Employee: Employee @belongsTo(sourceKey: "EmployeeId")
    Products: [Product] @belongsToMany(through: "OrderDetail")

    Listings: [OrderDetail] @hasMany(foreignKey: "OrderId")
}
```
