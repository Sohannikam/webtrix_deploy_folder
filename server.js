// require("dotenv").config();
// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const FormConfig = require("./models/FormConfig");
// const FormSubmission = require("./models/FormSubmission");
// const formRoutes = require("./routes/formRoutes"); // import routes



// const app = express();

// const multer = require("multer");
// const upload = multer(); // stores data in memory

// // =========================================================
// // ⭐ 1. FIRST — Add manual CORS override (fixes all errors)
// // =========================================================
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "https://formwebtrix001.netlify.app");
//   res.header("Access-Control-Allow-Credentials", "true");
//   res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
//   res.header("Access-Control-Allow-Headers", "Content-Type");
//   next();
// });



// //=========================================================
// // ⭐ 2. THEN — Normal CORS middleware
// // =========================================================
// app.use(
//   cors({
//    origin: "https://formwebtrix001.netlify.app",
//    credentials: true,
//   })
// );

// app.use(express.json());

// // ⭐ Mount all form routes here
// app.use("/api/webform", formRoutes);
// // =========================================================
// // ⭐ 3. Connect MongoDB
// // =========================================================
// const mongoURI = process.env.MONGO_URI;

// console.log("mongoURI is "+mongoURI)

// mongoose
//   .connect(mongoURI)
//   .then(() => console.log("✅ Connected to MongoDB Atlas"))
//   .catch((err) => {
//     console.error("❌ MongoDB connection error:", err);
//     process.exit(1);
//   });

// // =========================================================
// // ⭐ 5. Start server
// // =========================================================
// const PORT = process.env.PORT || 5000;

// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });

require("dotenv").config();

const express = require("express");

const mongoose = require("mongoose");

const cors = require("cors");
 
const formRoutes = require("./routes/formRoutes");
 
const app = express();
 
/* =========================================================

   ✅ CORS CONFIG (EMBED-FRIENDLY)

========================================================= */
 
app.use(

  cors({

    origin: true, // ✅ allow ANY domain (required for embeds)

    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],

    allowedHeaders: ["Content-Type", "Authorization"],

    credentials: false, // ❗ keep false for public embed

  })

);
 
// ✅ IMPORTANT: handle preflight

app.options("*", cors());
 
app.use(express.json());
 
/* =========================================================

   Routes

========================================================= */

app.use("/api/webform", formRoutes);
 
/* =========================================================

   MongoDB

========================================================= */

mongoose

  .connect(process.env.MONGO_URI)

  .then(() => console.log("✅ Connected to MongoDB"))

  .catch((err) => {

    console.error("❌ MongoDB error", err);

    process.exit(1);

  });
 
/* =========================================================

   Start Server

========================================================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {

  console.log(`🚀 Server running on port ${PORT}`);

});

 