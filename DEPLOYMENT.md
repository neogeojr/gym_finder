# Deployment notes

How to put Gym Finder on the internet with a free MongoDB Atlas database and a free Render web service.

Rules for the whole process:

- Never paste the database password, the connection string or `JWT_SECRET` into git, the README, a chat or a screenshot. They go only into Render's environment settings (and your own `.env.local`).
- Website screens change from time to time. If a button is named a little differently, look for the closest match.

## What you need first

- The project pushed to your GitHub repository, with `npm run build` passing on your computer.
- A free MongoDB Atlas account and a free Render account.
- About 45 minutes. The first deploy takes a few minutes to build.

## Part 1: MongoDB Atlas (the database)

1. Go to <https://www.mongodb.com/cloud/atlas> and sign in or sign up.
2. Create a project if asked (any name, for example `gym-finder`).
3. Click **Create** (or **Build a Database**) and choose the **Free** (M0) tier.
4. Pick a cloud provider and a region close to you. Give the cluster a name, then click **Create**.
5. Create the database user:
   - If a "Security Quickstart" appears, use it. Otherwise open **Database Access** in the left menu and click **Add New Database User**.
   - Choose **Password** authentication. Enter a username such as `gymfinder`.
   - Click **Autogenerate Secure Password**, then click **Copy** and keep it somewhere private for the next few minutes (a password manager is best). Use letters and numbers only, or you will have to URL-encode special characters later.
   - Give it the **Read and write to any database** role and click **Add User**.
6. Allow connections:
   - Open **Network Access** in the left menu and click **Add IP Address**.
   - Click **Allow Access From Anywhere** (this fills in `0.0.0.0/0`) and confirm.
   - Why: Render's free service has no fixed IP address, so a single allowed address is not possible. The database is still protected by the username and password.
7. Get the connection string:
   - Open **Database** (or **Clusters**) and click **Connect** on your cluster.
   - Choose **Drivers** (Node.js).
   - Copy the connection string. It looks like `mongodb+srv://<username>:<password>@<cluster-address>/?retryWrites=true&w=majority`.
   - Replace `<username>` and `<password>` with the database user you made. Do not include the angle brackets. This finished string is your `MONGODB_URI`.
8. You do not need to create the database or any collections. The app creates them the first time it saves data, using the name you set in `DB_NAME`.

## Part 2: Make a JWT secret

On your computer, run this and copy the output. It is your `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"npm
```

Use a new secret for the live site. Do not reuse the one in your `.env.local`.

## Part 3: Render (the web service)

1. Go to <https://render.com> and sign in, ideally with your GitHub account.
2. Click **New +**, then **Web Service**.
3. Choose **Build and deploy from a Git repository** and click **Next**.
4. Connect your GitHub account if asked, then find your repository and click **Connect**.
5. Fill in the settings:

   | Setting            | Value                                                                                          |
   | ------------------ | ---------------------------------------------------------------------------------------------- |
   | Name               | `gym-finder` (this becomes part of the address)                                                |
   | Region             | Closest to your Atlas region                                                                   |
   | Branch             | The branch you want live (usually `main`, or `dev` if `main` is not ready)                     |
   | Root Directory     | Leave empty if the repo's top folder holds `package.json`. Otherwise enter the subfolder name. |
   | Runtime / Language | Node                                                                                           |
   | Build Command      | `npm install && npm run build`                                                                 |
   | Start Command      | `npm start`                                                                                    |
   | Instance Type      | Free                                                                                           |

6. Open **Environment** (or **Advanced**, then **Add Environment Variable**) and add:

   | Key            | Value                                      |
   | -------------- | ------------------------------------------ |
   | `MONGODB_URI`  | The connection string from Part 1, step 7  |
   | `DB_NAME`      | `gym_finder`                               |
   | `JWT_SECRET`   | The secret from Part 2                     |
   | `NODE_VERSION` | `22` (Next.js 16 needs Node 20.9 or newer) |

   `DB_TEST_NAME` is only used by the tests, so you do not need it on Render. Render sets `NODE_ENV=production` for you, which makes the login cookie `secure`.

7. Click **Create Web Service**. Render now builds and starts the app. Watch the **Logs** tab.
8. Wait for the log to say the service is live (the status at the top turns **Live**). Your address is shown at the top, like `https://gym-finder.onrender.com`.

## Part 4: Check the live site end to end

Open your address and go through this list:

- [ ] The home page loads with the search box.
- [ ] **Sign up** as an owner (choose "gym owner") with a real-looking email and a password of 8 to 50 characters.
- [ ] Click **My gyms**, then **Add a gym**. Fill it in, tick **Offers a day pass**, save. The gym appears on the dashboard.
- [ ] **Logout**, then **Sign up** as a member with a different email.
- [ ] Search for the gym's name. Open its page and click **Get day pass**. A code and today's date appear.
- [ ] Click **My passes**. The pass is listed with a link to the gym.
- [ ] Click **Get day pass** on the same gym again (after reloading). You should see a message that you already have a pass today.
- [ ] Log out and open `/passes`. You should land on the login page.

If every box is ticked, the deployment works.

## Part 5: Write the address into the README

1. Open `README.md` and add a line under the first paragraph with your real address, for example `Live site: https://gym-finder.onrender.com`. If the README still has a `Live site: _to be added..._` placeholder, replace that line instead.
2. Commit it with the message `Add deployment notes`.

## Notes and common problems

- **The first visit is slow.** Render's free service goes to sleep after about 15 minutes without visitors and takes up to a minute to wake. This is normal
- **Build fails with a Node version error.** Check that `NODE_VERSION` is set (see Part 3, step 6) and redeploy.
- **The site loads but sign up or login says something went wrong on the server.** The database connection is failing. Check `MONGODB_URI` (no angle brackets, correct password), that Atlas **Network Access** lists `0.0.0.0/0`, and the Render **Logs** tab for the `MongoDB connection error` line.
- **Special characters in the database password.** Characters such as `@`, `:` or `/` must be URL-encoded inside the connection string. The simplest fix is to make a new password with only letters and numbers.
- **Changing an environment variable.** Edit it under **Environment** and save. Render redeploys automatically.
- **Updating the live site.** Push to the branch you chose in Part 3. Render rebuilds on every push (the default setting).
- **Test data.** If you want a clean database before submitting, open **Database** in Atlas, then **Browse Collections**, and delete the test users, gyms and passes you created. Do not share screenshots that show other people's emails.
- **Never commit** `.env.local`, the connection string, or the JWT secret. If one leaks, change the Atlas database user's password or generate a new `JWT_SECRET` in Render right away.
