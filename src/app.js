require("express-async-errors");
require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const userRouter = require("./routes/auth");
const adminRouter = require("./routes/adminAuth");
const fbRouter = require("./routes/fbauth");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const twitterRouter = require("./routes/twitterAuth");
const gitRouter = require("./routes/gitauth");
const emailVerificationRouter = require("./routes/EmailVerification");
const resetPasswordRouter = require("./routes/resetPassword");
const { connectDB } = require("./controllers/db");
const { errorHandler, unknownRoutes } = require("./utils/middleware");
const { authorizeUser } = require("./controllers/auth");
const swaggerUi = require("swagger-ui-express");
const passport = require("passport");
require("./config/passport");

const openApiDocumentation = require("./swagger/openApiDocumentation");

require("express-async-errors");
require("dotenv").config();

connectDB();
const SessionMgt = require("./services/SessionManagement");

app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

//passport middleware
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
    cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
    store: new MongoStore({
      url: process.env.AUTH_API_MONGODB_URI,
      autoReconnect: true,
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

// configure user session
SessionMgt.config(app);

// auth routes
app.use("/api/auth/admin", adminRouter);
app.use("/api/auth/user/email-verification", emailVerificationRouter());
app.use("/api/auth/user/password", resetPasswordRouter);
app.use("/api/auth/user", authorizeUser, userRouter);
app.use("/api/fb-auth/user", fbRouter);
app.use("/api/twitter-auth/user", twitterRouter);
app.use("/api/git-auth/user", gitRouter);

// DON'T DELETE: Admin acc. verification

// app.use('/api/admin/auth/email', emailVerificationRouter());

app.use("/api/doc", swaggerUi.serve, swaggerUi.setup(openApiDocumentation));
// app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(unknownRoutes);
app.use(errorHandler);

module.exports = app;
