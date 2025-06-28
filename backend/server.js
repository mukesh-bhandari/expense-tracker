require("dotenv").config();
const cors = require("cors");
const express = require("express");
const pool = require("./db");
const app = express();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const BS = require("bikram-sambat-js");

app.use(
  cors({
    origin: [process.env.FRONTEND_DEV_URL, process.env.FRONTEND_PROD_URL],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// pool
//   .connect()
//   .then(() => {
//     console.log("db connected");
//   })
//   .catch((err) => {
//     console.log(err);
//     console.log("db gg");
//   });

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

const persons = ["mukesh", "aadarsh", "kushal", "niraj"];

//middleware

// const authenticateUser = async (req, res, next) => {
//   const token = req.cookies?.accessToken;
//   if (!token) return res.status(401).json({ error: "not authorized" });
//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
//     if (err) {
//       if (err.name === "TokenExpiredError") {

//         const refreshToken = req.cookies?.refreshToken;
//         if (refreshToken == null) return res.status(401).json({ error: "no refresh token" });
//         try{
//          const result = await pool.query("SELECT EXISTS (SELECT 1 FROM refresh_tokens WHERE token = $1)", [refreshToken]);
//          if (!result.rows[0].exists) return res.status(403).json({ error: "refresh token not found" });
//         }catch(error){
//           return res.status(403).json({ error: "Refresh token not found" });
//         }
//         //  if (!refreshTokens.includes(refreshToken)) return res.status(403).json({ error: "refresh token not matched" });
//         //  console.log(refreshTokens)
//         jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {
//           if (err) {
//             if (err.name === "TokenExpiredError") {
//               await pool.query("DELETE FROM refresh_tokens WHERE token = $1", [refreshToken]);
//               return res.status(403).json({ error: "token expired" });

//             }
//             return res.status(403).json({ error: "Invalid refresh token" });

//           }
//           const newAccessToken = jwt.sign(
//             { username: user.username },
//             process.env.ACCESS_TOKEN_SECRET,
//             { expiresIn: "15m" }
//           );
//           res.cookie("accessToken", newAccessToken, {
//             httpOnly: true,
//             secure: true,
//             sameSite: "None",
//             maxAge: 15 * 60 * 1000,
//           });
//           console.log("token refreshed")
//           // res.json({ message: "Token refreshed" });
//           req.user = user;
//           next();
//         });

//         // return res.status(401).json({ error: "TokenExpired", err }); // Let frontend know to refresh
//       }else{
//         return res.status(403).json({ error: "Invalid token", err });
//       }

//     }// here
//     req.user = decoded;
//     next();
//   });
// };

const authenticateUser = async (req, res, next) => {
  const token = req.cookies?.accessToken;
  // console.log("Token:", token);
  if (!token) {
    return res.status(401).json({ error: "not authorized" });
  }

  try {
    // Try to verify access token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    // If token expired, try to use refresh token
    if (err.name === "TokenExpiredError") {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ error: "no refresh token" });
      }
      // Check if refresh token exists in DB
      try {
        const result = await pool.query(
          "SELECT EXISTS (SELECT 1 FROM refresh_tokens WHERE token = $1)",
          [refreshToken]
        );
        if (!result.rows[0].exists) {
          return res.status(401).json({ error: "refresh token not found" });
        }
      } catch (dbErr) {
        return res.status(401).json({ error: "Refresh token not found in db" });
      }

      // Verify refresh token and issue new access token
      try {
        const user = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        console.log("new access token created ");
        const newAccessToken = jwt.sign(
          { username: user.username },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "15m" }
        );
        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        req.user = user;
        return next();
      } catch (refreshErr) {
        // If refresh token expired, remove from DB
        if (refreshErr.name === "TokenExpiredError") {
          await pool.query("DELETE FROM refresh_tokens WHERE token = $1", [
            refreshToken,
          ]);
          console.log("Refresh token expired, removed from DB");
          return res.status(401).json({ error: "refresh token expired" });
        }
        console.log("Invalid refresh token", refreshErr);
        return res.status(401).json({ error: "Invalid refresh token" });
      }
    }
    // Any other error
    return res.status(401).json({ error: "Invalid access token" });
  }
};

app.get("/api/expenses", authenticateUser, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM expenses WHERE transaction_complete = FALSE ORDER BY id_ ASC"
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("server error");
  }
});

app.get("/api/expenses/expenseList", authenticateUser, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM expenses ORDER BY id_ ASC");
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("server error");
  }
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid user" });
    } else {
      const user = result.rows[0];
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid password" });
      }

      const accessToken = jwt.sign(
        { username: user.username },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );
      const refreshToken = jwt.sign(
        { username: user.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
      );
      await pool.query("DELETE FROM refresh_tokens WHERE user_id = $1", [
        user.id_,
      ]);

      await pool.query(
        "INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2) ON CONFLICT (token) DO NOTHING",
        [user.id_, refreshToken]
      );
      // refreshTokens.push(refreshToken);

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ message: "Login Successfull" });
    }
  } catch (error) {
    console.log("server error", error);
    res.status(500).json({ message: "Error login in" });
  }
});

app.post("/api/expenses", async (req, res) => {
  // console.log(req.body)
  const newExpense = { ...req.body };
  const { id, item, price, paidBy, date } = newExpense;
  const buttonstates = {};
  const checkboxstates = {};
 console.log(date)
  persons.forEach((person) => {
    buttonstates[person] = false;
    checkboxstates[person] = person === paidBy;
  });
  
  let dateToInsert = date ;
  if(date === ""){
    const currentDate = new Date();
     dateToInsert  = BS.ADToBS(currentDate); 
  }
  console.log(dateToInsert) 

  try {
    const result = await pool.query(
      `INSERT INTO EXPENSES (id_, item, price, "paidBy", buttonstates, checkboxstates, bs_date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [id, item, price, paidBy, buttonstates, checkboxstates, dateToInsert]
    );
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("server error");
  }
});

app.post("/api/expenses/save-states", async (req, res) => {
  const expenses = req.body;

  try {
    for (const expense of expenses) {
      const { id, buttonStates, checkboxStates, transaction_complete } =
        expense;

      await pool.query(
        "UPDATE expenses SET buttonstates = $1, checkboxstates = $2, transaction_complete = $3 WHERE id_ = $4",
        [buttonStates, checkboxStates, transaction_complete, id]
      );
    }

    res.status(200).send({ message: "All states updated successfully" });
  } catch (error) {
    console.error("Error updating states:", error);
    res.status(505).send({ message: "Failed to update states" });
  }
});

app.get("/api/pastExpenses/:id", async (req, res) =>{
const {id} = req.params;
  const currentDate = new Date();
   const  bs_date  = BS.ADToBS(currentDate); 
    const month =  bs_date.split("-")[1];
    monthToSearch =Number(month)  - Number(id);
    if(monthToSearch < 1){
      monthToSearch +=12;
    }
     const monthStr = monthToSearch.toString().padStart(2, "0");
 try {
    const result = await pool.query(
      `SELECT * FROM expenses WHERE SPLIT_PART(bs_date, '-', 2) = $1 ORDER BY id_ ASC`,
      [monthStr]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("server error");
  }
})


// app.delete("/api/expenses/:id", async (req, res) => {
//   const { id } = req.params;
//   try {
//     await pool.query("DELETE FROM expenses WHERE id_ = $1", [id]);
//     res.json({ success: true });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to delete expense" });
//   }
// });

// app.get("/api/date", async (req, res) => {
//   try {
//     const result = await pool.query("select id_ from expenses");

//     for (const row of result.rows) {
//       const timestamp = Number(row.id_);
//       const date = new Date(timestamp);

//       const bsDateStr = BS.ADToBS(date); // returns "2081-10-8" (string)
//       await pool.query("UPDATE expenses SET bs_date = $1 WHERE id_ = $2", [
//         bsDateStr,
//         row.id_,
//       ]);
//     }
//     res.json({ message: "bs_date column backfilled for all expenses." });
//   } catch (error) {
//     console.log("error in date api", error);
//     res.status(500).json({ error: "Failed to backfill bs_date" });
//   }
// });


app.use((req, res) => {
  res.status(404).json({ message: "Route no found" });
});

app.listen(5000, () => {
  console.log("server running");
});
