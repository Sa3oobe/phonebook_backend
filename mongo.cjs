//import { Schema, model, connect, connection } from 'mongoose'
const mongoose = require('mongoose')

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})
const Person = mongoose.model('Person', personSchema)

console.log(process.argv.length)
console.log('this should be the number', process.argv[4]);
if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
} 
const password = process.argv[2]
const url = `mongodb+srv://sab2:sab2123@cluster1.jybvkhn.mongodb.net/phoneBook?retryWrites=true&w=majority`

mongoose
  .connect(url)
  .then(() => {
    console.log('Connected');
    if (process.argv[3] && process.argv[4]) {
      const name = process.argv[3].toString()
      const perNumber = process.argv[4]
      const person = new Person({
        name: name,
        number: perNumber
        })
      //.save() is a methode part of the model witch is inherated by note object
      person
      .save()
      .then(() => {
          console.log(`added ${person.name} number ${person.number} to phonebook`)
          //If the connection is not closed, the program will never finish its execution.
          return mongoose.connection.close()
      })
    } else {
      Person
        .find({})
        .then( result => {
          return result.map( (person) => `${person.name} ${person.number}`)
        })
        .then( lines => {
          console.log('phonebook:')
          console.log(lines.join('\n'))
          mongoose.connection.close()
        })
    }
  })
  .catch((err) => console.log(err))

/* else if(process.argv.length === 3) {
  Person.find({}).then(result => {
    console.log('PhoneBooke: ')
    result.forEach(person => {
      console.log(person.name,' ',person.perNumber)
    })
    mongoose.connection.close()
  })
} else if(process.argv.length > 3){
  const name = process.argv[3].toString()
  const perNumber = process.argv[4].toString()

  console.log('this is node exe path',process.argv[0]);
  console.log('this is path',process.argv[1]);
  console.log('this is passowrd',process.argv[2]);
  console.log('this is name',process.argv[3],' type: ', typeof(name));
  console.log('this is number',process.argv[4]);
  const url = `mongodb+srv://sab2:sab2123@cluster1.jybvkhn.mongodb.net/phoneBook?retryWrites=true&w=majority`
  mongoose
      .connect(url)
      .then((result) => {
          console.log('connected')
          
          const person = new Person({
          name: name,
          number: perNumber
          })
          //.save() is a methode part of the model witch is inherated by note object
          return person.save()
      })
      .then(() => {
          console.log(`added ${name} number ${perNumber} to phonebook`)
          //If the connection is not closed, the program will never finish its execution.
          return mongoose.connection.close()
      })
      .catch((err) => console.log(err))
    /* Person.find({}).then(result => {
      console.log('PhoneBooke: ')
      result.forEach(person => {
        console.log(person.name,' ',person.perNumber)
      })
      mongoose.connection.close()
    }) */
//}
 //*/
