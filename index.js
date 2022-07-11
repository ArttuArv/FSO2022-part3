const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

morgan.token('body', (req, res) => {
  return JSON.stringify(req.body);
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

let phonenumbers = [
  {
    id: 1, 
    name: 'Arto Hellas', 
    number: '040-123456',
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: 3,
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  {
    id: 4,
    name: 'Mary Poppendieck',
    number: '39-23-6435323',
  },
]

// Random number for person ids
const generateId = () => {
  const randomID = Math.floor(Math.random() * 1000000);
  return randomID;
}

// GET etusivu info huvin vuoksi
app.get('/', (req, res) => {
  res.send(`<div><h1>Phonebook API</h1></div>`);
})

// GET all
app.get('/api/persons', (req, res) => {
  res.json(phonenumbers);
});

// GET with ID
app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  const person = phonenumbers.find(person => person.id === id);
  if (person) {
    res.json(person);
  } else {
    res.status(404).json({ error: `Person with id ${id} not found` });
  }
});

// DELETE with ID
app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);

  console.log("Person: ", phonenumbers.some(person => person.id === id) );

  if (phonenumbers.some(person => person.id === id)) {
    phonenumbers = phonenumbers.filter(person => person.id !== id);
    res.status(200).json({ success: `Person with id ${id} deleted` });
  } else {
    res.status(404).json({ error: `Person with id ${id} not found` });
  }
});

// POST create new person
app.post('/api/persons', (req, res) => {
  const body = req.body;
  
  if (body.name === undefined || body.number === undefined 
    || body.name === '' || body.number === '') {
    return res.status(400).json({ error: 'Name or number missing.' });
  }
  else if (phonenumbers.some(person => person.name === body.name)) {
    return res.status(400).json({ error: 'Name already exists.' });
  } 
  else {
    const person = {
      id: generateId(),
      name: body.name,
      number: body.number,
    };
  
    phonenumbers = [ ...phonenumbers, person ];
    res.status(201).json({message: 'Created Succesfully', person });
  }
});



// GET Info
app.get('/info', (req, res) => {
  const date = new Date();
  
  res.status(200).send(`<div><p>Phonebook has info for ${phonenumbers.length} people</p><p>${date}</p></div>`);
})

// Middleware, joka käsittelee pyynnöt, jotka eivät päädy määriteltyihin reitteihin
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});