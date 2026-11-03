# Gym Finder

Gym Finder is a small web app for finding gyms and claiming a free day pass. Anyone can search for a gym by name, city, state or zip code and open its page. A logged-in user can claim a day pass for a gym that offers one and see all of their passes in one list. Gym owners add, edit and delete their own gyms.

## Who can do what

| Action                               | Guest | Member | Owner              |
| ------------------------------------ | ----- | ------ | ------------------ |
| Search gyms and open a gym page      | Yes   | Yes    | Yes                |
| Sign up and log in                   | Yes   | -      | -                  |
| Claim a day pass and see "My passes" | No    | Yes    | Yes                |
| Add a gym                            | No    | No     | Yes                |
| Edit or delete a gym                 | No    | No     | Only gyms they own |

Choose "member" or "owner" on the sign up page. There is no admin role and no approval step: a gym is public as soon as its owner saves it.

## Tech stack

- Next.js 16 (App Router) with TypeScript
- MongoDB with Mongoose
- Login with a JWT in an httpOnly cookie (`jsonwebtoken`, `bcryptjs`)
- Tailwind CSS
- React Context for the logged-in user, `axios` for API calls, `react-hot-toast` for messages
- Jest and React Testing Library, with `mongodb-memory-server` for the API tests

## Setup

You need Node.js 20.9 or newer and a MongoDB database (a local MongoDB or a free MongoDB Atlas cluster).

1. Install the packages:

   ```bash
   npm install
   ```

2. Copy the example environment file and fill in your own values (see the table below). `.env.local` is never committed.

   ```bash
   cp .env.example .env.local
   ```

3. Start the development server and open <http://localhost:3000>:

   ```bash
   npm run dev
   ```

4. To try the app: sign up as an owner, add a gym that offers a day pass, then log out, sign up as a member, open the gym and click "Get day pass". Your passes are listed under "My passes".

## Environment variables

| Variable       | What it is                                                                                   |
| -------------- | -------------------------------------------------------------------------------------------- |
| `MONGODB_URI`  | MongoDB connection string (local or Atlas).                                                  |
| `DB_NAME`      | Database the app uses.                                                                       |
| `DB_TEST_NAME` | Database name used when the tests run, so tests never touch real data.                       |
| `JWT_SECRET`   | Long random string that signs the login cookie. Make one with the command in `.env.example`. |

Never put real values in git. On a host such as Render, set them in the host's environment settings.

## Scripts

| Command             | What it does                     |
| ------------------- | -------------------------------- |
| `npm run dev`       | Start the development server.    |
| `npm run build`     | Build the app for production.    |
| `npm start`         | Run the production build.        |
| `npm test`          | Run all tests.                   |
| `npm run lint`      | Check the code with ESLint.      |
| `npm run typecheck` | Check the types with TypeScript. |

## Pages

| Page                       | Who                 | What                                       |
| -------------------------- | ------------------- | ------------------------------------------ |
| `/`                        | Everyone            | Home with a search box.                    |
| `/search?q=`               | Everyone            | Search results.                            |
| `/gyms/[gymId]`            | Everyone            | Gym details and the "Get day pass" button. |
| `/login`, `/signup`        | Logged-out visitors | Log in or create an account.               |
| `/passes`                  | Logged in           | My passes.                                 |
| `/owner`                   | Owners              | Dashboard of my gyms.                      |
| `/owner/gyms/new`          | Owners              | Add a gym.                                 |
| `/owner/gyms/[gymId]/edit` | Owners              | Edit one of my gyms.                       |

`proxy.ts` sends visitors without a login cookie from `/passes` and `/owner` pages to `/login`, and sends logged-in visitors away from `/login` and `/signup`. This is only a convenience. The API routes below do the real permission checks.

## API routes

| Method and route                | Who               | What                                                                                  |
| ------------------------------- | ----------------- | ------------------------------------------------------------------------------------- |
| `POST /api/users/signup`        | Anyone            | Create an account (`regular` or `owner`).                                             |
| `POST /api/users/login`         | Anyone            | Log in and set the cookie.                                                            |
| `POST /api/users/logout`        | Anyone            | Clear the cookie.                                                                     |
| `GET /api/users/me`             | Logged in         | The current user, without the password.                                               |
| `GET /api/gyms?q=`              | Anyone            | Search gyms by name, city, state or zip code (up to 50, sorted by name).              |
| `POST /api/gyms`                | Owner             | Create a gym.                                                                         |
| `GET /api/gyms/[gymId]`         | Anyone            | One gym.                                                                              |
| `PATCH /api/gyms/[gymId]`       | Owner of that gym | Edit a gym.                                                                           |
| `DELETE /api/gyms/[gymId]`      | Owner of that gym | Delete a gym and its passes.                                                          |
| `GET /api/owner/gyms`           | Owner             | My gyms, newest first.                                                                |
| `POST /api/gyms/[gymId]/passes` | Logged in         | Claim a day pass for today (one per gym per day, the gym must offer day passes).      |
| `GET /api/passes`               | Logged in         | My passes, newest first, with each gym's name and address (`gym` is null if removed). |

Errors come back as `{ "error": "message" }` with a status of 400, 401, 403, 404, 409 or 500.

## Tests

Run everything with `npm test`. The tests are small and focused, and live in `__tests__`:

- `__tests__/unit`: models, validation, the gym input cleaner, the route guard.
- `__tests__/integration`: API routes called directly against an in-memory MongoDB (`mongodb-memory-server`), so no real database is needed. The first run downloads a MongoDB binary, so it needs an internet connection.
- `__tests__/ui`: React components and pages with React Testing Library (`axios` is mocked).
- `__tests__/helpers/api.ts`: shared helpers (start and stop the test database, build requests, create users).

## Security notes

- Passwords are hashed with bcrypt and are never returned by the API.
- The login token is a JWT in an httpOnly cookie, so page scripts cannot read it. It is `sameSite=lax`, `secure` in production, and expires after one day.
- Every protected API route checks the user's role on the server. Owner routes also check that the gym belongs to the logged-in owner, so one owner cannot change another owner's gym.
- Signup always creates a `regular` or `owner` account. Any other role, such as `admin`, is ignored.
- Search text is escaped before it is used in a database query.
- Secrets live in environment variables, never in git.

## What is not included yet

Admin role and approval, review of edits to live gyms, cancelling and redeeming passes, login rate limiting, a profile page (changing email or password, deleting an account), search filters, amenities, website, hours and day pass type, a seed script, maps, pictures and QR codes.
