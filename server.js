const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 5000;

const db = mysql.createConnection({

});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database');
});

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.post('/saveFlights', (req, res) => {
  const flights = req.body.flights;

  if (!flights || flights.length === 0) {
    return res.status(400).json({ error: 'No flights data provided' });
  }

  const values = flights.map(flight => [
    flight.flight.iata || null,
    flight.flight_status || null,
    flight.departure?.airport || null,
    flight.arrival?.airport || null,
    flight.departure?.iata || null,
    flight.departure?.icao || null,
    flight.departure?.actual || null,
    flight.arrival?.actual || null,
    flight.arrival?.iata || null,
    flight.arrival?.icao || null,
    flight.airline?.name || null,
    flight.flight?.number || null,
    flight.departure?.delay || 0,
    flight.arrival?.delay || 0,
    flight.departure?.scheduled || null,
    flight.arrival?.scheduled || null,
    flight.departure?.estimated || null,
    flight.arrival?.estimated || null,
  ]);

  console.log('Prepared SQL values:', values);

  const sql = 'INSERT INTO spain_flights (FlightIATA, FlightStatus, DepartureAirport, ArrivalAirport, DepartureIATA, DepartureICAO, ActualDeparture, ActualArrival, ArrivalIATA, ArrivalICAO, AirlineName, FlightNumber, DepartureDelay, ArrivalDelay,  DepartureScheduled, ArrivalScheduled, DepartureEstimated, ArrivalEstimated) VALUES ?';

  db.query(sql, [values], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        console.error('Duplicate entry error:', err);
        return res.status(409).json({ error: 'Duplicate entry', details: err.sqlMessage });
      } else {
        console.error('Error inserting data into the database:', err);
        return res.status(500).json({ error: 'Error inserting data into the database', details: err.message });
      }
    }
    res.json({ message: 'Data saved successfully', insertedRows: result.affectedRows });
  });
  
  
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
