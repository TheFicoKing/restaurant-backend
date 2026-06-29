const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors'); // 1. ДОДАЈ ГО ОВА ГОРЕ

const app = express();
const PORT = process.env.PORT || 3000;

// Овде ќе се чуваат резервациите привремено во меморија
let reservations = [];
const MAX_CAPACITY = 50; 

// Среден слој (Middleware)
app.use(cors()); // 2. ДОДАЈ ГО ОВА ПРЕД ДРУГИТЕ MIDDLEWARES!
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Автоматски служи ги статичните фајлови
app.use(express.static(__dirname));

// --- РУТИ ЗА HTML СТРАНИЦИТЕ ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/online-order', (req, res) => {
    res.sendFile(path.join(__dirname, 'online-order.html'));
});

app.get('/chefs', (req, res) => {
    res.sendFile(path.join(__dirname, 'chefs.html'));
});

app.get('/quality-food', (req, res) => {
    res.sendFile(path.join(__dirname, 'quality-food.html'));
});


// --- API РУТИ ---

// 1. Поправена рута за примање на резервација преку FETCH (JSON)
app.post('/book-table', (req, res) => {
    const { name, email, datetime, select_person, special_request } = req.body;
    
    const currentBooked = reservations.reduce((sum, res) => sum + parseInt(res.people || 0), 0);
    const requestedPeople = parseInt(select_person || 0);

    if (currentBooked + requestedPeople > MAX_CAPACITY) {
        return res.status(400).json({ success: false, message: 'Нема доволно слободни места.' });
    }

    const newReservation = {
        id: reservations.length + 1,
        name,
        email,
        date: datetime,
        people: requestedPeople,
        request: special_request || "Нема"
    };

    reservations.push(newReservation);
    return res.json({ success: true, message: 'Успешна резервација' });
});

// 2. АПИ Рута за проверка на статус
app.get('/api/status', (req, res) => {
    const totalBookedPeople = reservations.reduce((sum, r) => sum + r.people, 0);
    res.json({
        bookedSeats: totalBookedPeople,
        maxCapacity: MAX_CAPACITY,
        availableSeats: MAX_CAPACITY - totalBookedPeople,
        totalReservations: reservations.length,
        allReservations: reservations
    });
});

// 3. Рута за бришење на резервација
app.delete('/api/reservations/:id', (req, res) => {
    const reservationId = parseInt(req.params.id);
    const index = reservations.findIndex(r => r.id === reservationId);
    
    if (index !== -1) {
        reservations.splice(index, 1);
        return res.json({ success: true, message: `Резервацијата #${reservationId} е успешно избришана.` });
    } else {
        return res.status(404).json({ success: false, message: "Резервацијата не е пронајдена." });
    }
});

// --- СТАРТУВАЊЕ НА СЕРВЕРОТ ---
app.listen(PORT, () => {
    console.log(`Серверот е стартуван на порта ${PORT}`);
});
