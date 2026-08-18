# Local Product Keeper

Build a minimal React JavaScript application.

Important constraints:

- This must be a standard web React app only. Do NOT use Electron, Electron.js, Tauri, or any desktop-app framework.

- Keep all application data local. Do not use cloud databases, external APIs, authentication providers, analytics, or remote storage.

- Do not create any `.md` files, including README files, documentation files, or changelogs.

- Start with an otherwise empty project: no dashboard, landing page, sample UI, unnecessary components, placeholder pages, or extra features.

Architecture:

- Use a clear MVC-inspired project structure.

- Separate concerns into dedicated files/folders:

  - `models/` for data schemas/types and product model logic.

  - `services/` or `api/` for database access classes and CRUD methods.

  - `controllers/` for business logic between the UI and data layer.

  - `views/` or `components/` for React UI.

- Keep database code isolated from React components. Components must call controllers/services rather than directly accessing the database.

- Use TypeScript 

Local database:

- Use a local SQLite `.db` database file.

- The database file must be stored in the user’s Documents folder, for example:

  - Windows: `%USERPROFILE%/Documents/app-data.db`

  - macOS/Linux: `~/Documents/app-data.db`

- On first run, automatically create the Documents directory if necessary and create the `.db` file if it does not exist.

- Initialize the required database table automatically.

- Seed exactly 5 products only when the database is newly created or the products table is empty.

- Do not reseed or duplicate products on later launches.

Important feasibility requirement:

- Since a browser-only React app cannot safely create or access arbitrary files in the user’s Documents folder, implement a minimal local backend/server in JavaScript for SQLite and filesystem access.

- The React frontend communicates only with this local backend through localhost.

- Do not use Electron or any desktop wrapper.

- Ensure the backend binds only to localhost, not to public network interfaces.

Initial test feature only:

Build only a simple product storage test screen to verify that local database reading and writing work before building anything else.

The screen should include:

1. A simple list/table showing the 5 seeded products loaded from the local SQLite database.

2. A small “Add Product” form with:

   - Product name

   - Price

   - Optional description

3. Form submission must save the product to the local `.db` file through the local backend.

4. After saving, refresh or update the displayed product list using data read back from the database.

5. Add lightweight validation for required name and valid non-negative price.

6. Show simple success and error messages.

Product data schema:

- id: integer primary key

- name: required text

- price: required numeric value

- description: optional text

- createdAt: timestamp

Keep the UI extremely minimal:

- One page only.

- No styling libraries unless already required.

- Basic HTML/CSS only.

- No routing unless strictly necessary.

- No icons, images, animations, themes, navigation, settings, user accounts, or unrelated pages.

Deliverable:

- Generate the complete runnable source code.

- Include only the files necessary to run this React frontend plus local JavaScript backend.

- Do not generate `.md` files.

- Do not add features beyond the local SQLite product list and add-product test form.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8622b80d-0d3c-4fd6-b683-f34fa30d86ab).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
