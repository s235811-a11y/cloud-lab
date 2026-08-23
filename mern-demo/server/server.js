const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const Student = require('../models/Student');

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());

// Kết nối MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('MongoDB Atlas connected successfully');
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
    });

// Câu 22: GET /api/hello
app.get('/api/hello', (req, res) => {
    res.json({
        message: 'Backend đang hoạt động'
    });
});

// Câu 36: GET /api/students
app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.find();

        res.json(students);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Câu 37: POST /api/students
app.post('/api/students', async (req, res) => {
    try {
        const student = await Student.create(req.body);

        res.status(201).json(student);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});

// Câu 38: PUT /api/students/:id
app.put('/api/students/:id', async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!student) {
            return res.status(404).json({
                message: 'Student not found'
            });
        }

        res.json(student);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});

// Câu 39: DELETE /api/students/:id
app.delete('/api/students/:id', async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(
            req.params.id
        );

        if (!student) {
            return res.status(404).json({
                message: 'Student not found'
            });
        }

        res.json({
            message: 'Student deleted successfully'
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});

// Khởi động Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});