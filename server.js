const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex')

const psql = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'postgres',
      password : 'hello',
      database : 'smartbrain'
    }
});

const app = express();

app.use(cors())
app.use(express.json())

const database = {
    users: [
        {
            id: '123',
            name: 'John',
            email: 'john@gmail.com',
            password: 'cock',
            entries: 0,
            joined: new Date(),
        },
        {
            id: '124',
            name: 'Sally',
            email: 'sally@gmail.com',
            password: 'peni',
            entries: 0,
            joined: new Date(),
        }
    ]
}

app.get('/', (req, res) => {
    res.send(database.users);
});

app.post('/signin', (req, res) => {
    const hash = '$2a$10$skpen8xqOr2ErlAdEJBx8OzTxpePtpGutCYcUW4gc1sIkSMuw5d/q';
    if (req.body.email === database.users[0].email && req.body.password === database.users[0].password) {
        res.json(database.users[0]);
    } else {
        res.status(400).json("error logging in")
    }
});

app.post('/register', (req, res) => {
    const { email, name, password } = req.body;
    psql('users')
        .returning('*')
        .insert({
        email: email,
        name: name,
        joined: new Date()
    })
        .then(user => {
            res.json(user[0]);
        })
        .catch(err => res.status(400).json('unable to register'))
})

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    psql.select('*').from('users').where({
        id: id
    })
        .then(user => {
            if (user.length) {
                res.json(user[0])
            } else {
                res.status(400).json('Not found')
            }
    })
    .catch(err =>  res.status(400).json('Error getting user'));
});

app.put('/image', (req, res) => {
    const { id } = req.body;
    psql('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
        res.json(entries[0]);
    })
    .catch(err => res.status(400).json('errorrrrrr'))
})

app.listen(3000, () => {
    console.log('App is running on port 3000');
});

/*
/ --> res = this is working 
/signin --> POST res ==> success/fail
/register --> POST = user
/profile/:userId --> GET = user
/image --> PUT 
*/