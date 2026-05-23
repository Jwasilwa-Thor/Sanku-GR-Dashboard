# Database Setup Guide - Sanku CRM

This project uses **Azure Cosmos DB** (NoSQL API) for data storage. Follow these steps to set up and connect your database.

## 1. Create Azure Cosmos DB Account
1. Log in to the [Azure Portal](https://portal.azure.com).
2. Create a new **Azure Cosmos DB** account.
3. Select **Azure Cosmos DB for NoSQL**.
4. Once created, go to the **Settings > Keys** section to get your:
   - **URI** (COSMOS_ENDPOINT)
   - **Primary Key** (COSMOS_KEY)

## 2. Configure Database and Containers
1. In the Cosmos DB Data Explorer, create a new database named `SankuCRM`.
2. Create the following containers within the `SankuCRM` database:
   - `Policies`
   - `Stakeholders`
   - `Projects`
   - `Engagements`
3. **Important**: Set the Partition Key for all containers to `/id`.

## 3. Local Configuration
1. In the `server` directory, copy `local.settings.json.example` to `local.settings.json`.
2. Fill in the values:
   ```json
   {
     "IsEncrypted": false,
     "Values": {
       "FUNCTIONS_WORKER_RUNTIME": "node",
       "AzureWebJobsStorage": "UseDevelopmentStorage=true",
       "COSMOS_ENDPOINT": "your-cosmos-uri",
       "COSMOS_KEY": "your-cosmos-key",
       "COSMOS_DATABASE": "SankuCRM"
     }
   }
   ```

## 4. Environment Variables (Azure)
When deploying to the Azure Function App (`sank-gr`), ensure the same environment variables are set in the **Environment variables** blade:
- `COSMOS_ENDPOINT`
- `COSMOS_KEY`
- `COSMOS_DATABASE`

## 5. Seeding Data
To populate the database with mock data, run the following from the project root:
```bash
npm run seed
```
*(Ensure your API is running locally or the `SEED_API_BASE_URL` is set to your production URL).*
