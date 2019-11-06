const bcrypt = require('bcryptjs')

module.exports = {
    register: async (req, res) => {
        //0. grab db connection, destructure body
        const db = req.app.get('db')
        const {email, password} = req.body
        //1. check to see if email already exists
        const result = await db.find_user(email)
        //if so, send proper response
        // .then(result => {
            if(result[0]){
                return res.status(200).send({message: 'email already in use'})
            }
        // })
        
        //2. if email does not exist, hash and salt the password
        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(password, salt)
        
        //3. create a new user in db (add hash and customer info)
        const hashID = await db.add_hash(hash)
        const {hash_id} = hashID[0]
        const createdUser = await db.add_cust({email, hash_id})
        
        //4. put new user on session object
        req.session.user = {id: createdUser[0].cust_id, email: createdUser[0].email}

        //5. respond with the user information
        res.status(200).send({message: 'logged in', userData: req.session.user})
    }, 
    login: async (req, res) => {
        const db = req.app.get('db')
        const {email, password} = req.body
        //1. check if an email has an account
        const user = await db.find_hash(email)
        //2. if not found, stop function/ send message
        if (!user[0]) return res.status(200).send({message: 'email not found'})
        //3. if found, rehash the password and compare hashes
        const result = bcrypt.compareSync(password, user[0].hash_value)
        if (result === true){
            req.session.user = {id: user[0].cust_id, email: user[0].email}
            //5. if hashes do match, send appropriate response 
            return res.status(200).send({message: 'Logged in', userData: req.session.user})
        } else {
            //4. if hashes don't match, send appropriate response
            res.status(200).send({message: 'Passwork incorrect'})
        }
        //6. add user to session
    }
}