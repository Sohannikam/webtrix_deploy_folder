require("dotenv").config();

const express = require('express');
const router = express.Router();
const FormConfig = require('../models/FormConfig');
const FormSubmission = require('../models/FormSubmission');
const multer = require('multer');
const upload = multer(); // stores files in memory


async function verifyRecaptcha(token, ip) {
 console.log("value of token in formRoutes.js is"+token);
  if (!token) return null;

  console.log("inside of verifyRecaptcha")
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  console.log("secret key is"+secret)

  const response = await fetch(
    "https://www.google.com/recaptcha/api/siteverify",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret: secret,
        response: token,
        remoteip: ip, // optional but recommended
      }),
    }
  );

  return response.json();
}

// async function verifyTurnstile(token, ip) {
//   if (!token) return null;

//   const secret = process.env.TURNSTILE_SECRET_KEY;

//   console.log("secret value is"+secret)

//   const response = await fetch(
//     "https://challenges.cloudflare.com/turnstile/v0/siteverify",
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/x-www-form-urlencoded",
//       },
//       body: new URLSearchParams({
//         secret,
//         response: token,
//         remoteip: ip,
//       }),
//     }
//   );

//   return response.json();
// }


// router.post('/submit', upload.any(), async (req, res) => {
//   try {
//     const formId = req.body.form_id;
//     if (!formId) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing form_id",
//       });
//     }

//     /* ===============================
//     reCAPTCHA VERIFICATION
//     =============================== */

//     const recaptchaToken = req.body["g-recaptcha-response"];

//     if (!recaptchaToken) {
//       return res.status(403).json({
//         success: false,
//         message: "Security check failed (missing reCAPTCHA token)",
//       });
//     }

//     const recaptchaResult = await verifyRecaptcha(
//       recaptchaToken,
//       req.ip
//     );

//     console.log("recaptcha value after verifyRecaptcha is"+JSON.stringify(recaptchaResult, null, 2));

//     if (!recaptchaResult || !recaptchaResult.success) {
//       return res.status(403).json({
//         success: false,
//         message: "reCAPTCHA verification failed",
//       });
//     }

//     // OPTIONAL BUT STRONGLY RECOMMENDED
//     const MIN_SCORE = 0.5;

//     if (recaptchaResult.score < MIN_SCORE) {
//       return res.status(403).json({
//         success: false,
//         message: "Bot activity detected",
//       });
//     }

//     // Optional action check (extra security)
//     if (recaptchaResult.action !== "submit") {
//       return res.status(403).json({
//         success: false,
//         message: "Invalid reCAPTCHA action",
//       });
//     }

// //     const turnstileToken = req.body["cf-turnstile-response"];
// // console.log("value of turnstileToken is"+turnstileToken)
// // if (!turnstileToken) {
// //   return res.status(403).json({
// //     success: false,
// //     message: "Security check failed",
// //   });
// // }

// // const result = await verifyTurnstile(turnstileToken, req.ip);

// // if (!result || result.success !== true) {
// //   return res.status(403).json({
// //     success: false,
// //     message: "Bot verification failed",
// //   });
// // }


//     /* ===============================
//        ✅ Passed reCAPTCHA → Save form
//     =============================== */

//     const submission = new FormSubmission({
//       form_id: formId,
//       fields: req.body,
//       files: req.files,
//       submitted_at: new Date(),

//     });

//     await submission.save();

//     res.json({
//       success: true,
//       message: "Form submitted successfully",
//     });
//   } catch (error) {
//     console.error("submit api error", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// });


// Save form definition
router.post('/saveDefinition', async (req, res) => {
  try {
    const { formId, definition } = req.body;

    if (!formId || !definition) {
      return res.status(400).json({
        success: false,
        message: "Missing formId or definition",
      });
    }

    const saved = await FormConfig.findOneAndUpdate(
      { formId },
      { definition },
      { upsert: true, new: true }
    );

    res.json({ success: true, 
        message:"form definition saved successfully",
        data: saved 
    });
  } catch (err) {
    console.error("Save form error:", err);
    res.status(500).json({ 
        success:false,
        message: "Server error while saving form definition", });
  }
});

// // Get form config (embed.js uses this)
router.get('/form/:formId', async (req, res) => {

  try {
    console.log("api called succesfully")
    const record = await FormConfig.findOne({ formId: req.params.formId });

    if (!record) {
      return res.status(404).json({ message: "Form not found" });
    }

    res.json(record.definition);   // IMPORTANT!!
  } catch (err) {
    console.error("Get form error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// // Submit form
router.post('/submit', upload.any(), async (req, res) => {

  try {

       // 🐝 Honeypot check
    if (req.body.company_website) {
      console.warn("Honeypot triggered", {
        ip: req.ip,
        value: req.body.company_website,
      });

      return res.status(400).json({
        success: false,
        message: "Spam detected",
      });
    }

    const renderTime = Number(req.body._form_render_time);

if (!renderTime || renderTime < 2000) {
  // bot detected

     return res.status(400).json({
        success: false,
        message: "Suspicious submission detected",
      });
}


    const formId = req.body.form_id;
    if (!formId) {
      return res.status(400).json({ success: false, message: "Missing form_id" });
    }

    const submission = new FormSubmission({
      form_id: formId,
      fields: req.body,
      files: req.files,
      submitted_at: new Date(),
    });

    await submission.save();

    res.json({ success: true, message: "Form submitted successfully" });
  } catch (error) {
    console.error("submit api error", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});


router.put("/:formId/settings", async (req, res) => {
  console.log("insdie api setting")
  try {
    console.log("inside of try block of setting ")
    const { formId } = req.params;
    const { patch } = req.body;

console.log("Received patch:", JSON.stringify(patch, null, 2));


    console.log("form id is"+formId)

    const setObj = {};

    for(const key in patch){
for (const key in patch) {
  setObj[`definition.settings.${key}`] = patch[key];
}
    }
    const updated = await FormConfig.findOneAndUpdate(
      { formId },
      { $set: setObj},
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Form not found" });
    }

    res.json({
      success: true,
      settings: updated.definition.settings
    });
  } catch (err) {
    console.error("Settings update error:", err);
    res.status(500).json({ success: false });
  }
});


// ✅ Get last saved form (latest updated)
router.get("/forms/last", async (req, res) => {
  try {
    const lastForm = await FormConfig
      .findOne({})
      .sort({ updatedAt: -1 }) // 🔥 MOST IMPORTANT LINE
      .select("formId updatedAt createdAt");

    if (!lastForm) {
      return res.status(404).json({ message: "No forms found" });
    }

    res.json({
      formId: lastForm.formId,
      updatedAt: lastForm.updatedAt,
    });
  } catch (err) {
    console.error("Get last form error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
