const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();

const costumers = [];


app.use(express.json());

app.post("/account", (request, response)=> {
    const {cpf, name} = request.body;

    const costumerAreadyExist = costumers.some((costumer)=> costumer.cpf === cpf)
    
    if(costumerAreadyExist) {
        response.status(400).json(
            {Error:"Costumer already exist" }
        )
    }

    costumers.push({
        cpf,
        name,
        id: uuidv4(),
        statement: [],
    })

    return response.status(201).send();
})

app.get("/members", (request, response) => {
    return response.json(costumers)
})




//porta do serviço
app.listen(3333);