const cors = require("cors");
const express = require("express");
const pool = require("./db");
const app = express();

app.use(cors());
app.use(express.json());

pool.connect().then(()=>{
  console.log("db connected")
}).catch((err)=>{
  console.log("db gg")
})

let expenses = [];

app.get("/expenses", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM expenses");
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("server error");
  }
});

app.post("/expenses", async (req, res) => {
  // console.log(req.body)
  const newExpense = { id: Date.now(), ...req.body };
  const { id, item, price, paidBy } = newExpense;
  try {
    const result = await pool.query(
      `INSERT INTO EXPENSES (id_, item, price, "paidBy") VALUES ($1, $2, $3, $4) RETURNING *`,
      [id, item, price, paidBy]
    );
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("server error");
  }
});

app.delete("/expenses/:id", (req, res) => {
  const { id } = req.params;
  expenses = expenses.filter((expense) => expense.id !== parseInt(id));
  res.json({ success: true });
});

app.listen(5000, () => {
  console.log("server running");
});
