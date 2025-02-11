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

const persons = ["mukesh", "aadarsh", "kushal", "niraj"];

app.get("/expenses", async (req, res) => {
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

app.get("/expenses/expenseList", async (req, res) => {
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
  const newExpense = { ...req.body };
  const { id, item, price, paidBy } = newExpense;
  const buttonstates = {};
  const checkboxstates = {};

  persons.forEach((person) => {
    buttonstates[person] = false;
    checkboxstates[person] = person === paidBy;
  });

  try {
    const result = await pool.query(
      `INSERT INTO EXPENSES (id_, item, price, "paidBy", buttonstates, checkboxstates) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [id, item, price, paidBy, buttonstates, checkboxstates]
    );
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("server error");
  }
});

app.post("/expenses/save-states", async (req, res) => {
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

app.delete("/expenses/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM expenses WHERE id_ = $1", [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete expense" });
  }
});

app.listen(5000, () => {
  console.log("server running");
});
