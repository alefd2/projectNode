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

function getBalance(statement){
    const balance = statement.reduce((acc,operation)=>{
        if(operation.type === 'credit') {
            return acc + operation.amount
        }else {
            return acc - operation.amount
        }
    }, 0)

    return balance;
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

app.post("/deposit", verifyIfExistAccountCPF , (request, response) => {
    const {description, amount} = request.body;

    const { costumer } = request;

    const statmentOperation = {
        amount,
        description,
        createAt: new Date(),
        type: "credit"
    }
    
    costumer.statement.push(statmentOperation);

    return response.status(201).send();
})

//saque
app.post("/withdraw" , verifyIfExistAccountCPF, (request, response) => {

    // recebe o valor do saque requeri  do
    const { amount } = request.body;
    const { costumer } = request;

    // retorna o valor iterado do banco
    const balance = getBalance(costumer.statement)

    if(balance < amount){
        response.status(400).send({
            error: "insuficient funds"
        })
    }

    const statmentOperation = {
        amount,
        createAt: new Date(),
        type: "debit"
    }

    costumer.statement.push(statmentOperation);

    return response.status(201).send()

})



//porta do serviço
app.listen(process.env.PORT || 3333, ()=>{
    console.log('server is running',process.env.PORT)
});