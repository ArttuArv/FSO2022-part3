require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person');
const person = require('./models/person');
const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(express.static('build'));

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
  {
    id: 5,
    name: 'Maija Poppanen',
    number: '39-23-6435323',
  }
]

// Middleware, joka käsittelee pyynnöt, jotka eivät päädy määriteltyihin reitteihin
const unknownEndpoint = (request, response) => {
  response.status(404).end();
}

const errorHandler = (error, req, res, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return res.status(400).send({ error: error.message });
  }

  next(error);
}

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
  Person.find({}).then(result => {
    res.json(result);
  }).catch(error => {
    console.log(error);
  })
});

// GET with ID
app.get('/api/persons/:id', (req, res, next) => {
  const id = req.params.id;

  console.log('ID: ', id);
  
  Person.findById(id).then(result => {
    console.log('result: ', result);
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ error: `Person with id ${id} not found` });
    }
  }).catch(error => next(error))  
});

// Update person with ID
app.put('/api/persons/:id', (req, res, next) => {
  const id = req.params.id;
  const body = req.body;

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(id, person, { new: true }).then(result => {
    res.json(result);
  }).catch(error => next(error))
})

app.use(errorHandler);

// DELETE with ID
app.delete('/api/persons/:id', (req, res) => {
  const id = req.params.id;

  Person.findByIdAndRemove(id).then(result => {
    if (result) {
      res.status(200).json({ success: `Person with id ${id} deleted` });
    } else {
      res.status(404).json({ error: `Person with id ${id} not found` });
    }
  }).catch(error => {
    console.log(error);
    res.status(400).json({ error: 'Wrong type of an ID' });
  })
});

// POST create new person
app.post('/api/persons', (req, res) => {
  const body = req.body;
  
  if (body.name === undefined || body.number === undefined || body.name === '' || body.number.length === 0) {
    return res.status(400).json({ error: 'Name or number missing.' });
  }
  else {
    Person.findOne({ name: body.name }).then(result => {
      if (result) {
        return res.status(400).json({ error: 'Name must be unique.' });
      } 
      else {
        const person = new Person({
          name: body.name,
          number: body.number,
        });
      
        person.save().then(savedPerson => {
          res.status(201).json(savedPerson);
        }).catch(error => {
          console.log(error);
          res.status(400).json({ error: 'Error saving person' });
        })
      }
    })
  }
});

// GET Info
app.get('/info', (req, res) => {
  const date = new Date();
  person.find({}).then(result => {
    res.send(`<div><p>Phonebook has info for ${result.length} people</p><p>${date}</p></div>`);
  }).catch(error => {
    console.log(error);
  });  
})

app.use(unknownEndpoint)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});