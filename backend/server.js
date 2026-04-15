const express = require("express");
const cors = require("cors");
const studentRoutes = require("./routes/students");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Student API is running" });
});

app.use("/api/students", studentRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
