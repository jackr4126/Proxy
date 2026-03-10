# Node.js HTTP/HTTPS Proxy Server

## Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/jackr4126/Proxy.git
   cd Proxy
   ```

2. **Install dependencies**:
   Ensure you have Node.js installed. Run the following command:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   You may need to set environment variables. Create a `.env` file based on the example provided:
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your configuration.

## Usage Instructions

1. **Start the proxy server**:
   You can start the proxy server by running:
   ```bash
   node index.js
   ```
   By default, the server will listen on port `8080`. You can change this in the configuration.

2. **Make a request through the proxy**:
   Use any HTTP client (like Postman or Curl) to send requests through your proxy:
   ```bash
   curl -x http://localhost:8080 http://example.com
   ```

## License

This project is licensed under the MIT License.