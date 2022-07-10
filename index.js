import inquirer from 'inquirer';
import chalk from 'chalk';

import fs from 'fs';

operation();
function operation() {
    inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: 'O que voce deseja fazer? ',
        choices: ['Criar conta', 'Consultar Saldo', 'Depositar', 'Sacar', 'Sair']
    }]).then((answer) => {
        const action = answer['action'];
        console.log(action);

        if (action === 'Criar conta') {
            createAccount();
        } else if (action === 'Consultar Saldo') {
            getAccountBalance()
        } else if (action === 'Depositar') {
            deposit();
        } else if (action === 'Sacar') {
            withdraw();
        } else if (action === 'Sair') {
            console.log(chalk.bgBlue.black('Você saiu da sua conta com sucesso'))
            process.exit()
        }

    }).catch(err => console.log(err))

}
//console.log('inciamos o account')

//create account

function createAccount() {
    console.log(chalk.bgGreen.black('Parabéns por escolher o nosso banco'));
    console.log(chalk.green('Defina as opções da sua conta a seguir'));
    buildAccount();

}
function buildAccount() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Digite o nome da conta'
        }
    ]).then((answer) => {
        const accountName = answer['accountName'];
        console.info(answer['accountName']);

        if (!fs.existsSync('accounts')) {
            fs.mkdirSync('accounts');
        }
        if (fs.existsSync(`accounts/${accountName}.json`)) {
            console.log(chalk.bgRed.black('Essa conta já foi criada'));
            buildAccount()
            return;
        }
        fs.writeFileSync(
            `accounts/${accountName}.json`,
            '{"balance" : 0}',
            function (err) {
                console.log(err)
            },
            console.log(chalk.green('Sua conta foi criada com sucesso'))
        )
    })
        .catch((err) => console.log(err))
}
// add amount user account
function deposit() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta'
        }
    ]).then((answer) => {
        const accountName = answer['accountName']

        //check account
        if (!checkAccount(accountName)) {
            return deposit();
        }
        inquirer.prompt([
            {
                name: 'amount',
                message: 'Quanto você desejar depositar? '
            }
        ]).then((answer) => {
            const amount = answer['amount']
            // add an amount
            addAmout(accountName, amount);
            operation()
        }).catch((err) => console.log(err))

    }).catch((err) => console.log(err));
}
function checkAccount(accountName) {
    if (!fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(chalk.bgRed.black('Esta conta não existe'));
        return false;
    }
    return true;
}

function addAmout(accountName, amount) {
    const accountData = getAccount(accountName);
    console.log(accountData);

    if (!amount) {
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde'));
        return deposit();
    }
    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance);
    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function (err) {
            console.log(err);
        },
    )
    console.log(chalk.green(`Foi depositado o valor de R$${amount} na sua conta ${accountName}`));
}

function getAccount(accountName) {
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`,
        {
            encoding: 'utf8',
            flag: 'r'
        })

    return JSON.parse(accountJSON);
}
function getAccountBalance() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta? '
        }
    ]).then((answer) => {
        const accountName = answer['accountName']
        if (!checkAccount(accountName)) {
            return getAccountBalance()
        }

        const accountData = getAccount(accountName)

        console.log(chalk.bgBlue.black(`Olá, o saldo da sua conta é R$ ${accountData.balance}`))

    }).catch((err) => console.log(err))
}
function withdraw() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual sua conta? '
        }
    ]).then((answer) => {
        const accountName = answer['accountName']

        if (!checkAccount(accountName)) { return withdraw() }

        inquirer.prompt([
            {
                name: 'amount',
                message: 'Quanto você deseja sacar? '
            }
        ]).then((answer) => {
            const amount = answer['amount']
            removeAmount(accountName, amount)
            //operation();
        }).catch((err) => console.log(err))

    }).catch((err) => console.log(err))
}

function removeAmount(accountName, amount) {
    const accountData = getAccount(accountName)

    if (!amount) {
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde'))
        return withdraw();
    }

    if (accountData.balance < amount) {
        console.log(chalk.bgRed.black('Valor indisponível para saque'))
        return withdraw();
    }

    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)

    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function (err) {
            console.log(err)
        },
    )
    console.log(chalk.green(`Foi realizado um saque de R$ ${amount} da sua conta`))
    operation();
}