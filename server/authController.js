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
    }
}