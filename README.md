# Australian Address Validator

This project is a Next.js application that validates Australian addresses using APIs. It integrates with the Australia Post API for postcode lookups and OpenAI for additional processing.

## Features

- Validate Australian addresses with postcode and suburb.
- Integrates with Australia Post API for address verification.
- Simple and responsive user interface.
- GraphQL serverless function powered by Apollo Client.
- Custom provider for address validator form state management.
- OpenAI integration with custom tool calling.

## Requirements

- Node.js (version 16 or higher recommended)
- npm or yarn package manager
- API keys for Australia Post and OpenAI

---

## Getting Started

### 1. Clone the Repository

```bash
# Clone this repository
git clone https://github.com/SimonHanlyJones/lawpath_tech_test

# Navigate to the project directory
cd lawpath_tech_test
```

### 2. Install Dependencies

```bash
# Install project dependencies using npm
npm install

# Or use yarn
yarn install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root of your project directory and add the following variables:

```env
AUS_POST_KEY=<your-australia-post-api-key>
AUS_POST_POSTCODE_SEARCH_URL=https://digitalapi.auspost.com.au/postcode/search

OPENAI_KEY=<your-openai-api-key>
```

Replace `<your-australia-post-api-key>` and `<your-openai-api-key>` with your respective API keys.

### 4. Run the Application

```bash
# Start the development server
npm run dev

# Or use yarn
yarn dev
```

The application will be available at `http://localhost:3000`.

---

## Running Integration Tests

To run integration tests, follow these steps:

1. Start the development server:

   ```bash
   npm run dev
   ```

2. Open a new terminal and run the tests:
   ```bash
   npm test
   ```

This will execute the integration tests against the development server.

---

## Deployment

### Vercel Deployment

This project is optimized for deployment on Vercel. Follow these steps to deploy:

1. Push your repository to a version control platform (e.g., GitHub).
2. Connect your repository to [Vercel](https://vercel.com/).
3. Set the environment variables (`AUS_POST_KEY`, `AUS_POST_POSTCODE_SEARCH_URL`, and `OPENAI_KEY`) in the Vercel dashboard under the project settings.
4. Deploy the project via the Vercel dashboard.

---

## API Key Information

### Australia Post API

- [Australia Post API Documentation](https://developers.auspost.com.au/)
- Used for postcode and suburb validation.

### OpenAI API

- [OpenAI API Documentation](https://platform.openai.com/docs/)
- Used for additional address processing (if applicable).

---

## Scripts

| Command         | Description                       |
| --------------- | --------------------------------- |
| `npm run dev`   | Start the development server.     |
| `npm run build` | Build the project for production. |
| `npm start`     | Run the production build.         |

---

## Directory Structure

```plaintext
.
├── app                  # Core application directory
│   ├── components       # Reusable React components
│   ├── fonts            # Custom fonts
│   ├── interfaces       # TypeScript interfaces
│   ├── lib              # Library code
│   ├── test             # Test files
│   ├── globals.css
├── contexts             # Context API for state management
├── pages                # Next.js API routes
└── public               # Public assets
```
