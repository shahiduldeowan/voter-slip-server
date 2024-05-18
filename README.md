# Voter Slip Server

A Node.js server for managing voter slip issues, slip queue, and providing real-time updates via WebSocket.

## Table of Contents

- [Voter Slip Server](#voter-slip-server)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Environment Variables](#environment-variables)
  - [Dependencies](#dependencies)
  - [DevDependencies](#devdependencies)
  - [Development](#development)
    - [Code Formatting](#code-formatting)

## Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/shahiduldeowan/voter-slip-server.git
    cd voter-slip-server
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Set up environment variables:**

    Create a `.env` file in the root directory and add the following variables:

    ```plaintext
    PORT=3000
    JWT_SECRET=your_jwt_secret
    DB_USER=your_db_user
    DB_PASSWORD=your_db_password
    DB_SERVER=your_db_server
    DB_DATABASE=your_db_name
    ```

## Usage

1. **Start the server:**

    ```bash
    npm start
    ```

2. **Development mode with auto-reloading:**

    ```bash
    npm run dev
    ```

## Environment Variables

- `PORT`: The port number on which the server runs.
- `JWT_SECRET`: Secret key for JWT authentication.
- `DB_USER`: Database user name.
- `DB_PASSWORD`: Database user password.
- `DB_SERVER`: Database server address.
- `DB_DATABASE`: Name of the database.

## Dependencies

- **bcrypt:** A library to help you hash passwords.
- **cookie-parser:** Parse Cookie header and populate `req.cookies` with an object keyed by the cookie names.
- **cors:** A package to provide a Connect/Express middleware that can be used to enable CORS with various options.
- **dotenv:** Loads environment variables from a `.env` file into `process.env`.
- **express:** Fast, unopinionated, minimalist web framework for Node.js.
- **jsonwebtoken:** An implementation of JSON Web Tokens.
- **mssql:** Microsoft SQL Server client for Node.js.
- **winston:** A logger for just about everything.

## DevDependencies

- **nodemon:** A tool that helps develop Node.js applications by automatically restarting the node application when file changes in the directory are detected.
- **prettier:** An opinionated code formatter.

## Development

### Code Formatting

This project uses Prettier for code formatting. To format the code, run:

```bash
npx prettier --write .
