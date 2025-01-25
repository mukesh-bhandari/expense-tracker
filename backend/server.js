const cors = require("cors");
const express = require("express");
const pool = require("./db");
const app = express();

app.use(cors());
app.use(express.json());

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
  process.exit(-1); // Exit the process or take appropriate action
});

let expenses = [];

app.get("/expenses", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM expenses ORDER BY id_ ASC");
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("server error");
  }
});

app.post("/expenses", async (req, res) => {
  // console.log(req.body)
  const newExpense = {...req.body };
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
app.post('/expenses/save-states', async (req, res) => {
  const expenses = req.body;

  try {
      for (const expense of expenses) {
          const { id, buttonStates, checkboxStates } = expense;

          await pool.query(
              'UPDATE expenses SET buttonstates = $1, checkboxstates = $2 WHERE id_ = $3',
              [buttonStates, checkboxStates, id]
          );
      }

      res.status(200).send({ message: 'All states updated successfully' });
  } catch (error) {
      console.error('Error updating states:', error);
      res.status(505).send({ message: 'Failed to update states' });
  }
});

// app.delete("/expenses/:id", (req, res) => {
//   const { id } = req.params;
//   expenses = expenses.filter((expense) => expense.id !== parseInt(id));
//   res.json({ success: true });
// });

app.listen(5000, () => {
  console.log("server running");
});
