const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();

const costumers = [];

// Middlewares
function verifyIfExistAccountCPF(request, response, next){
    const { cpf } = request.headers;
    const costumer = costumers.find((costumer) => costumer.cpf === cpf);

    if(!costumer) {
        return response.status(400).json({erro: "costumer not found"})
    } 

    request.costumer = costumer
    return next();
}

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

app.get("/statment/", verifyIfExistAccountCPF, (request, response) => {
    const {costumer} = request;

    return response.json(costumer.statement)
})


//porta do serviço
app.listen(3333);