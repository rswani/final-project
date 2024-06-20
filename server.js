const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;
const WORKOUTS_FILE = path.join(__dirname, 'workouts.json');
const SETTINGS_FILE = path.join(__dirname, 'settings.json');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

const readData = (filePath) => {
    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    }
    return [];
};

const writeData = (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

app.get('/workouts', (req, res) => {
    const workouts = readData(WORKOUTS_FILE);
    res.json(workouts);
});

app.get('/workouts/:date', (req, res) => {
    const workouts = readData(WORKOUTS_FILE);
    const workout = workouts.find(w => w.date === req.params.date);
    if (workout) {
        res.json(workout);
    } else {
        res.status(404).send('Workout not found');
    }
});

app.post('/workouts', (req, res) => {
    const { exercise, date, duration, calories } = req.body;
    const workouts = readData(WORKOUTS_FILE);
    const newWorkout = { exercise, date, duration, calories };
    workouts.push(newWorkout);
    writeData(WORKOUTS_FILE, workouts);
    res.status(200).send('Workout added successfully.');
});

app.delete('/workouts', (req, res) => {
    const { date } = req.body;
    if (!date) {
        return res.status(400).send('Date is required to delete a workout.');
    }

    let workouts = readData(WORKOUTS_FILE);
    workouts = workouts.filter(workout => workout.date !== date);
    writeData(WORKOUTS_FILE, workouts);

    res.send('Workout deleted successfully.');
});

app.get('/settings', (req, res) => {
    const settings = readData(SETTINGS_FILE);
    res.json(settings);
});

app.post('/settings', (req, res) => {
    const newSettings = req.body;
    writeData(SETTINGS_FILE, newSettings);
    res.status(200).send('Settings updated successfully.');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});