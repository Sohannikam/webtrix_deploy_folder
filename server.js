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
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization","sadminid","token"],
    credentials: false,
  })
);
 
// ✅ IMPORTANT: handle preflight

app.options(/.*/, cors());

 
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

 