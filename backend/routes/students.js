const express = require("express");
const fs = require("fs/promises");
const path = require("path");

const router = express.Router();
const dataFilePath = path.join(__dirname, "..", "data", "students.json");

async function readStudents() {
  try {
    const fileData = await fs.readFile(dataFilePath, "utf-8");
    const parsed = JSON.parse(fileData || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === "ENOENT") {
      await fs.writeFile(dataFilePath, "[]", "utf-8");
      return [];
    }

    throw error;
  }
}

async function writeStudents(students) {
  await fs.writeFile(dataFilePath, JSON.stringify(students, null, 2), "utf-8");
}

function validateStudent(payload) {
  const errors = {};
  const name = String(payload.name || "").trim();
  const email = String(payload.email || "").trim();
  const course = String(payload.course || "").trim();
  const marks = Number(payload.marks);

  if (!name) {
    errors.name = "Name is required.";
  }

  if (!email) {
    errors.email = "Email is required.";
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.email = "Enter a valid email address.";
    }
  }

  if (!course) {
    errors.course = "Course is required.";
  }

  if (Number.isNaN(marks)) {
    errors.marks = "Marks must be a number.";
  } else if (marks < 0 || marks > 100) {
    errors.marks = "Marks must be between 0 and 100.";
  }

  return {
    errors,
    student: {
      name,
      email,
      course,
      marks
    }
  };
}

router.get("/", async (req, res) => {
  const students = await readStudents();
  res.json(students);
});

router.post("/", async (req, res) => {
  const { errors, student } = validateStudent(req.body);

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  const students = await readStudents();
  const newStudent = {
    id: Date.now().toString(),
    ...student
  };

  students.push(newStudent);
  await writeStudents(students);
  res.status(201).json(newStudent);
});

router.put("/:id", async (req, res) => {
  const { errors, student } = validateStudent(req.body);

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  const students = await readStudents();
  const studentIndex = students.findIndex((item) => item.id === req.params.id);

  if (studentIndex === -1) {
    return res.status(404).json({ message: "Student not found." });
  }

  students[studentIndex] = {
    ...students[studentIndex],
    ...student
  };

  await writeStudents(students);
  res.json(students[studentIndex]);
});

router.delete("/:id", async (req, res) => {
  const students = await readStudents();
  const nextStudents = students.filter((item) => item.id !== req.params.id);

  if (nextStudents.length === students.length) {
    return res.status(404).json({ message: "Student not found." });
  }

  await writeStudents(nextStudents);
  res.json({ message: "Student deleted successfully." });
});

module.exports = router;
