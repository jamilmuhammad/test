# Insignia Crypto Wallet Backend

This project is a simple Crypto Wallet backend implemented with Node.js, NestJS framework, Prisma ORM and PostgreSQL.

Features implemented:
- Register new users (creates a wallet for each user)
- Read wallet balance
- Deposit into a wallet
- Transfer between wallets (atomic)
- List top N transactions by value for a user
- List overall top transacting users by value (naive aggregation)

Tech stack:
- Node.js + TypeScript
- NestJS (controllers + services)
- Prisma ORM
- PostgreSQL

Quick start

1. Install dependencies

```bash
cd backend
npm install
```

2. Start a PostgreSQL instance (example using Docker):

```bash
docker run --name insignia-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=insignia_dev -p 5432:5432 -d postgres:15
```

3. Copy env and generate Prisma client

```bash
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
```

4. Run in dev

```bash
npm run start:dev
```

API endpoints

- POST /users/register  { email, name? }
- GET /wallets/:userId/balance
- POST /wallets/:userId/deposit  { amount }
- POST /wallets/transfer  { fromUserId, toUserId, amount }
- GET /transactions/user/:userId/top/:n
- GET /transactions/top-users/:n

Testing

```bash
npm test
```

Notes

- This is a minimal implementation focusing on correctness and clarity. The aggregation for top transacting users uses a simple approach that is fine for small data sets; for larger datasets you'd implement aggregation in the database (groupBy) or use optimized queries.
- For production use: add validation pipes, DTO validation classes, authentication, pagination and better error handling.
Crypto Wallet Backend Service

This project is a backend service for a simple Crypto wallet application, built with NestJS, Prisma, and PostgreSQL.

Features

User Registration: Create new users with initial wallets.

Balance Check: Retrieve current wallet balance.

Deposit: Add funds to a wallet.

Transfer: Secure, atomic transfers between wallets.

Analytics:

List top N transactions by value for a specific user.

List overall top transacting users by total volume.

Tech Stack

Framework: NestJS

Database: PostgreSQL

ORM: Prisma

Testing: Jest

Language: TypeScript

Setup & Installation

Clone the repository (simulated here by saving these files).

Install dependencies:

npm install


Database Setup:
Ensure you have a PostgreSQL instance running. Update your .env file:

DATABASE_URL="postgresql://user:password@localhost:5432/crypto_wallet?schema=public"


Run Migrations:

npx prisma migrate dev --name init


Start the Server:

npm run start:dev


API Documentation

1. Register User

POST /wallet/register

Body: { "email": "user@example.com", "name": "John Doe" }

2. Get Balance

GET /wallet/:userId/balance

3. Deposit Funds

POST /wallet/deposit

Body: { "userId": "uuid", "amount": 100.50 }

4. Transfer Funds

POST /wallet/transfer

Body: { "fromUserId": "uuid1", "toUserId": "uuid2", "amount": 50.00 }

5. Top Transactions (Per User)

GET /wallet/:userId/transactions?limit=5

6. Top Transacting Users (Overall)

GET /wallet/stats/top-users

Architecture Decisions

Atomicity: The transfer functionality uses prisma.$transaction to ensure that money is never lost or created during a move. If either the debit or credit fails, the entire operation rolls back.

Decimal Arithmetic: Financial calculations are handled carefully to avoid floating-point errors (using Prisma's Decimal type mapping).

Clean Code: logic is encapsulated in the Service layer, keeping Controllers thin.

Testing

Run unit tests for the wallet service:

npm run test


<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
