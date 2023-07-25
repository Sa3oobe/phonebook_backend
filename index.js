// must add  ("type": "module",) in package.json or else an syntaxError happen (Cannot use import statement outside a module)
//deleted "type": "module", from package.json for testing if that change it to CommonJS>> it dose
//IT is confirmed that adding ("type": "module") to package.json change it to ESript
//import express, {request, response} from 'express'
const express = require('express')
//import morgan from 'morgan'
const morgan = require('morgan')
//import cors from 'cors'
const cors = require('cors')
//import 'dotenv/config'
require('dotenv').config()
//import Person from './models/person.js'
const Person = require('./models/person.js')

const app = express()
//const Person = new personSchema
//======== RequestLogger middleware===============
const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

//================= catching requests made to non-existent routes ==============
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

//================= ERROR handler middleware ====================================
// this has to be the last loaded middleware.
//The error handler checks if the error is a CastError exception,
//In all other error situations, the middleware passes the error forward to the default Express error handler.
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if(error.name === 'CastError'){
    return response.status(400).send({
      error: 'malformatted id'
    })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({
      error: error.message
    })
    //return response.send(error.message)
  }
  next(error) // all other error forwarded to the default error handler
}


// CORS is a middleware used to allow requests from other origins.
app.use(cors())
app.use(express.json())
//STATIC is a built-in middleware from express used to make express show static content, the page index.html and the JavaScript, etc., it fetches.
app.use(express.static('build'))
app.use(requestLogger)
/* We need a unique id for the note. First, we find out the largest id number in the current list and assign it to the maxId variable.
The id of the new note is then defined as maxId + 1.
This method is in fact not recommended, but we will live with it for now as we will replace it soon enough. */
/* const generateId = () =>{
  const maxId = persons.length > 0 ?
  Math.max(...persons.map(n => n.id)):
  0
  return maxId + 1
} */
//hard coded persons array ↓↓↓↓
/* let persons = [
  {
    "id": 1,
    "name": "Arto Hellas",
    "number": "040-123456"
  },
  {
    "id": 2,
    "name": "Ada Lovelace",
    "number": "39-44-5323523"
  },
  {
    "id": 3,
    "name": "Dan Abramov",
    "number": "12-43-234345"
  }
] */

// Custom token to get content body for POST method
morgan.token('content', (request, response) => { // eslint-disable-line no-unused-vars

  if (request.method === 'POST') {
    const logging = request.body

    return JSON.stringify(logging)
  }
  return ''
})
//app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content'))
//app.use(morgan('combined'))

//=================  morgan  ===================
//morgan('short')
app.use(morgan('short'))
//=================  End of morgan  ===================

// get request to root
app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})
//get request that shows all phonebook persons
app.get('/api/persons', (request, response) => {
  console.log('====================================')
  console.log('getting all notes')
  console.log('Person type is ' + typeof(Person))
  console.log('====================================')

  Person.find({}).then(persons => {
    response.json(persons)
  })
})

//Fetching a single resource
app.get('/api/persons/:id', (request, response, next) => {
  /* const id = Number(request.params.id)
  const person = persons.find((person) => {
      console.log(`person id is ${person.id} its type "${typeof(person.id)}"...id is ${id} its type "${typeof(id)}" are they same? : ${person.id === id}`)
      return person.id === id
    }) */
  Person.findById(request.params.id)
    .then(person => {
    //checking if person exist, if not set status to 404 end end().
      if(person){
        response.json(person)
      } else {
        response.statusMessage = 'Unable to find note'
        response.status(404).end()
      }

    }).catch(error => next(error))
})


//Deleteing a single resource (HTTP DELETE request)
app.delete('/api/persons/:id', (request, response, next) => {

  Person.findByIdAndRemove(request.params.id)
    // eslint-disable-next-line no-unused-vars
    .then(result => {
      response.status(204).end() //204 No Content
    })
    .catch(error => next(error))
})

//add a new resource(a new person)
app.post('/api/persons/',(request,response) => {
  //Without the json-parser, the body property would be undefined. That is way we need it
  const body = request.body

  if(!body.name || !body.number){
    return response.status(400).json({ error: 'Missing content' })
  }
  //setting the person object
  const person = new Person({
    name: body.name,
    number: body.number,
    //id: generateId()
  })

  /* if(body.some((person) => person.name === body.name)){
    console.log(person.name)
    return response.status(400).json({ error: 'name must be unique' })
  } */
  person
    .save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => {
      console.log(error.message)
      /* return response.status(400).json({
        error: "name must be unique"
    }) */
      return response.error

    })
  //persons = persons.concat(person)
  //response.json(person)
})

// GET request for http://localhost:3001/info
app.get('/info', (request, response) => {
  const now = new Date()
  Person.find({}).then(persons => {
    persons.map(person => person.toJSON())
    response.send(
      `<h1>PhoneBook has info for ${persons.length} people</h1><h3>${now}</h3>`
    )
  })
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
