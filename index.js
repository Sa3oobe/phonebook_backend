// must add  ("type": "module",) in package.json or else an syntaxError happen (Cannot use import statement outside a module)
import express, {request, response} from 'express'
import morgan from 'morgan'
import cors from 'cors'

const app = express()
// CORS is a middleware used to allow requests from other origins.
app.use(cors())

//STATIC is a built-in middleware from express used to make express show static content, the page index.html and the JavaScript, etc., it fetches.
app.use(express.static('build'))
/* We need a unique id for the note. First, we find out the largest id number in the current list and assign it to the maxId variable.
The id of the new note is then defined as maxId + 1. 
This method is in fact not recommended, but we will live with it for now as we will replace it soon enough. */
const generateId = () =>{
  const maxId = persons.length > 0 ?
  Math.max(...persons.map(n => n.id)):
  0
  return maxId + 1
}

let persons = [
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
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

// Custom token to get content body for POST method
morgan.token('content', (request, response) => { // eslint-disable-line no-unused-vars

  if (request.method === 'POST') {
    const logging = request.body

    return JSON.stringify(logging)
  }
  return ''
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content'))


app.use(express.json())


//=================  morgan  ===================
morgan('tiny')
app.use(morgan())

//=================  End of morgan  ===================

// get request to root
app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})
//get request that shows all phonebook persons
app.get('/api/persons', (request, response) => {
  response.json(persons)
})
//Fetching a single resource
app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find((person) => {
      console.log(`person id is ${person.id} its type "${typeof(person.id)}"...id is ${id} its type "${typeof(id)}" are they same? : ${person.id === id}`)
      return person.id === id
    })
    //checking if person exist, if not set status to 404 end end(). 
    if(person){
        response.json(person)
        
    } else {
        response.status(404).end()
    }
})
//Deleteing a single resource (HTTP DELETE request)
app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter((person) => {
    return person.id !== id
  })
  response.status(204).end()
})

//add a new resource(a new person)
app.post('/api/persons/',(request,response) => {
  const body = request.body
  
  if(!body.name || !body.number){
    return response.status(400).json({error: 'Missing content'})
  }
    
  const person = {
    name: body.name,
    number: body.number,
    id: generateId()
  }  
    
  if(persons.some((person) => person.name === body.name)){
    console.log(person.name)
    return response.status(400).json({ error: 'name must be unique' })
  }
  persons = persons.concat(person)
  response.json(person)
})

// GET request for http://localhost:3001/info
app.get('/info', (request,response) => {
  const numberOfPersons = persons.length
  const now = new Date()
  console.log(`this is from info req ${numberOfPersons}`);
  response.send(`<h1>PhoneBook has info for ${numberOfPersons} people</h1><h3>${now}</h3>`)
})



const unknownEndpoint = (request, response) => {
  response.status(404).send({error: 'unknown endpoint'})
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
