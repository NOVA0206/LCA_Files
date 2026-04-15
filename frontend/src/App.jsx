import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Spinner,
  Table
} from "react-bootstrap";

const API_URL = "http://localhost:5000/api/students";

const initialFormState = {
  name: "",
  email: "",
  course: "",
  marks: ""
};

function validate(values) {
  const errors = {};
  const marks = Number(values.marks);

  if (!values.name.trim()) {
    errors.name = "Name is required.";
  }

  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(values.email)) {
      errors.email = "Enter a valid email address.";
    }
  }

  if (!values.course.trim()) {
    errors.course = "Course is required.";
  }

  if (values.marks === "") {
    errors.marks = "Marks are required.";
  } else if (Number.isNaN(marks) || marks < 0 || marks > 100) {
    errors.marks = "Marks must be a number between 0 and 100.";
  }

  return errors;
}

function App() {
  const [students, setStudents] = useState([]);
  const [formValues, setFormValues] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isEditing = useMemo(() => editingId !== null, [editingId]);

  async function fetchStudents() {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.get(API_URL);
      setStudents(response.data);
    } catch (error) {
      setErrorMessage("Could not load students. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStudents();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function resetForm() {
    setFormValues(initialFormState);
    setFormErrors({});
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const errors = validate(formValues);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const payload = {
      name: formValues.name.trim(),
      email: formValues.email.trim(),
      course: formValues.course.trim(),
      marks: Number(formValues.marks)
    };

    setSaving(true);
    try {
      if (isEditing) {
        await axios.put(`${API_URL}/${editingId}`, payload);
        setSuccessMessage("Student updated successfully.");
      } else {
        await axios.post(API_URL, payload);
        setSuccessMessage("Student added successfully.");
      }

      await fetchStudents();
      resetForm();
    } catch (error) {
      const apiErrors = error.response?.data?.errors;
      if (apiErrors) {
        setFormErrors(apiErrors);
      } else {
        setErrorMessage("Could not save student. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(student) {
    setEditingId(student.id);
    setFormValues({
      name: student.name,
      email: student.email,
      course: student.course,
      marks: String(student.marks)
    });
    setFormErrors({});
    setErrorMessage("");
    setSuccessMessage("");
  }

  async function handleDelete(studentId) {
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await axios.delete(`${API_URL}/${studentId}`);
      setSuccessMessage("Student deleted successfully.");
      await fetchStudents();

      if (editingId === studentId) {
        resetForm();
      }
    } catch (error) {
      setErrorMessage("Could not delete student. Please try again.");
    }
  }

  return (
    <div className="app-shell py-4 py-md-5">
      <Container>
        <Row className="justify-content-center">
          <Col lg={10}>
            <Card className="shadow-sm border-0">
              <Card.Body className="p-4 p-md-5">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
                  <div>
                    <h2 className="mb-1">Student Management</h2>
                    <p className="text-muted mb-0">Create, view, update, and delete students.</p>
                  </div>
                  <Badge bg="dark">{students.length} students</Badge>
                </div>

                {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
                {successMessage && <Alert variant="success">{successMessage}</Alert>}

                <Form onSubmit={handleSubmit} noValidate className="mb-4">
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                          name="name"
                          value={formValues.name}
                          onChange={handleChange}
                          isInvalid={Boolean(formErrors.name)}
                          placeholder="Enter student name"
                        />
                        <Form.Control.Feedback type="invalid">{formErrors.name}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formValues.email}
                          onChange={handleChange}
                          isInvalid={Boolean(formErrors.email)}
                          placeholder="Enter email"
                        />
                        <Form.Control.Feedback type="invalid">{formErrors.email}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Course</Form.Label>
                        <Form.Control
                          name="course"
                          value={formValues.course}
                          onChange={handleChange}
                          isInvalid={Boolean(formErrors.course)}
                          placeholder="Enter course"
                        />
                        <Form.Control.Feedback type="invalid">{formErrors.course}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Marks</Form.Label>
                        <Form.Control
                          type="number"
                          min="0"
                          max="100"
                          name="marks"
                          value={formValues.marks}
                          onChange={handleChange}
                          isInvalid={Boolean(formErrors.marks)}
                          placeholder="0 - 100"
                        />
                        <Form.Control.Feedback type="invalid">{formErrors.marks}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-flex gap-2 mt-4">
                    <Button type="submit" variant="primary" disabled={saving}>
                      {saving ? "Saving..." : isEditing ? "Update Student" : "Add Student"}
                    </Button>
                    {isEditing && (
                      <Button type="button" variant="outline-secondary" onClick={resetForm}>
                        Cancel Edit
                      </Button>
                    )}
                  </div>
                </Form>

                <h5 className="mb-3">Student List</h5>

                {loading ? (
                  <div className="d-flex align-items-center gap-2 text-muted">
                    <Spinner size="sm" animation="border" /> Loading students...
                  </div>
                ) : students.length === 0 ? (
                  <Alert variant="info" className="mb-0">
                    No students added yet.
                  </Alert>
                ) : (
                  <div className="table-responsive">
                    <Table striped bordered hover className="align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Course</th>
                          <th>Marks</th>
                          <th style={{ width: "180px" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student) => (
                          <tr key={student.id}>
                            <td>{student.name}</td>
                            <td>{student.email}</td>
                            <td>{student.course}</td>
                            <td>{student.marks}</td>
                            <td>
                              <div className="d-flex gap-2">
                                <Button size="sm" variant="warning" onClick={() => handleEdit(student)}>
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => handleDelete(student.id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
