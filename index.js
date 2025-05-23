import pg from "pg";
import express from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

dotenv.config();

const app = express();
const port = 3000;
const pgSession = connectPgSimple(session);

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ extended: true }));

const db = new pg.Pool({
  user: "postgres",
  host: "localhost",
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
});

passport.use(
  new LocalStrategy(async function (username, password, cb) {
    await db.query(
      `SELECT * from userdata WHERE username='${username}'`,
      async (err, res) => {
        if (err) {
          console.log(err);
          return cb(null, false);
        } else {
          const user = res.rows[0];

          const isMatch = await bcrypt.compare(password, user.password);

          if (isMatch) {
            return cb(null, user);
          } else {
            return cb(null, false);
          }
        }
      }
    );
  })
);

passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser(async (userId, cb) => {
  await db.query(`SELECT * FROM userdata WHERE id='${userId}'`, (err, res) => {
    if (err) {
      cb(err);
    } else {
      const user = res.rows[0];
      cb(null, user);
    }
  });
});

db.connect();

app.use(
  session({
    store: new pgSession({
      pool: db,
      tableName: "session",
    }),
    secret: process.env.SECRET_COOKIE,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 hour session expiration
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// app.use((req, res, next) => {
//   console.log(req.session);
//   console.log(req.user);
//   next();
// });

let users = [];

app.get("/show", async (req, res) => {
  let usersQueried = await db.query(`SELECT * FROM userdata`);

  users = usersQueried.rows;

  res.render("showusers.ejs", {
    user: users,
  });
});

app.get(["/", "/login"], (req, res) => {
  if (req.session.viewCount) {
    req.session.viewCount = req.session.viewCount + 1;
  } else {
    req.session.viewCount = 1;
  }

  res.render("login.ejs", {
    viewCount: req.session.viewCount,
  });
});

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    successRedirect: "/login_s",
  })
);

app.get("/login_s", (req, res) => {
  res.render("login_s.ejs");
});

app.get("/register", async (req, res) => {
  res.render("register.ejs");
});

app.post("/register_s", (req, res) => {
  registerUser(req.body.username, req.body.password);
  res.render("register_s.ejs");
});

app.get("/delete", (req, res) => {
  res.render("delete.ejs");
});

app.post("/delete_s", (req, res) => {
  deleteUser(req.body.username);
  res.render("delete_s.ejs");
});

app.get("/authenticated", isAuth, (req, res) => {
  res.render("authenticated_page.ejs");
});

app.get("/logout", (req, res, next) => {
  console.log(req.session);
  req.logout(function (err) {
    console.log(err);
    if (err) {
      return next(err);
    }
  });

  res.redirect("/authenticated");
});

// async function loginUser(username, password) {
//   try {
//     let existingUser = await db.query(
//       `SELECT * FROM userdata WHERE username = '${username}'`
//     );

//     if (existingUser.rows.length > 0) {
//       const user = existingUser.rows[0];

//       const isMatch = await bcrypt.compare(password, user.password);
//       console.log(isMatch);
//     } else {
//       console.log("no user found");
//     }
//   } catch (err) {
//     console.error(err);
//   }
// }

async function registerUser(username, password) {
  const hash = await bcrypt.hash(password, 12);
  await db.query(
    `INSERT INTO userdata (username, password) values ('${username}', '${hash}')`,
    (err, res) => {
      if (err) {
        console.error("Error executing query", err.stack);
      } else {
      }
    }
  );
}

async function deleteUser(username) {
  const excludeUser = await db.query(
    `DELETE FROM userdata WHERE username='${username}'`
  );
  console.log(excludeUser);
}

function isAuth(req, res, next) {
  if (req.isAuthenticated()) {
    console.log("right");
    next();
  } else {
    res.status(401).json({ msg: `You're not authorized to access this page` });
  }
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
