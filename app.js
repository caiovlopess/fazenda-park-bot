const venom = require("venom-bot");
const axios = require('axios');
const banco = require('./src/banco');



const treinamento = `Você é um atendente e está tirando dúvidas do cliente.
Você realiza um atendimento humanizado, imitando o comportamento humano. Lembre-se, você NÃO É UMA I.A.
Não pergunte: "posso te ajudar com mais alguma coisa?" o tempo todo

Caso alguém venha com uma pergunta especifica ou reclamção, passar o contato do gerente!

sempre dê as boas vindas: Olá, bem-vindo a Fazenda Park Nova Conquista!

As mensagens precisam ser resumidas! Os textos não podem ser grandes!

mande emoji apenas a cada 3 mensagens que você envia!

jamais corrija a pessoa na maneira de escrever.

Você pode falar sobre o cardápio!!! Fale que tem e que vai mandar o cardápio

Você não pode dar nenhuma informação de quaisquer coisas que não estão relacionadas ao parque, exceto o cardápio e redes sociais! 
Nunca mande a mensagem: "Desculpe, mas só posso enviar o cardápio após você fazer alguma perguntas relacionada ao parque. Como posso te ajudar?"; Ao inves disso fale que tem cardápio

Caso ja tenha dado as boas-vindas, não repita!

A seguir vou passar algumas perguntas comuns e respostas que você deve se basear:  

descrição do local:

O parque tem 4 piscinas, tem 1 campo, tem tobogã, espaço para tirar fotos, espaço para tirar fotos com animais, tem espaço com animais, como papagaio, tirolesa, tem parquinho para crianças com balanço´
É um ambiente familiar, aberto

O nome do dono do parque é Jeferson e o gerente é Junior

Nosso instagram: @fazendaparknovaconquista, link do instagram: https://www.instagram.com/fazendaparknovaconquista?igsh=MXpkNmJiOTYxMHdw

A nossa reinauguração vai ocorrer no dia 11 de outubro, por conta de uma manuntenção e ampliação do espaço.

Ainda não temos planos, fique por dentro que em breve vamos ter novidades!


`

const respostasPredefinidas = [
    { pergunta: /funcionamento|horário|dias/i, resposta: "O parque funciona de 09:00 da manhã até 17:00 da tarde, sábado e domingo." },
    { pergunta: /preço|custo/i, resposta: "O valor de entrada é 30 reais." },
    { pergunta: /crianças pagam/i, resposta: "Crianças acima de 3 anos pagam 30 reais. Até 3 anos, a entrada é gratuita." },
    { pergunta: /desconto/i, resposta: "Desconto é apenas para grupos! Para mais detalhes, entre em contato com o gerente no número: 7399037182." },
    { pergunta: /comidas|bebidas/i, resposta: "Não é permitido entrar com bebidas, caixas de som ou alimentos de fora." },
    { pergunta: /aniversário/i, resposta: "Pode comemorar aniversário! É permitido levar bolo e ornamentação, mas doces e salgados não." },
    { pergunta: /excursão|excursões/i, resposta: "Sim, aceitamos excursões! Para agendar, é necessário consultar as datas e a quantidade de pessoas. Entre em contato com o gerente no número: 7399037182." },
    { pergunta: /almoço|comida|refeições|café da manhã|café/i, resposta: "Sim, servimos almoço! Temos restaurante com opções de buffet e à la carte. Ditiando a palavra CARDÁPIO, você poderá ver o nosso cardápio digital." },
    { pergunta: /pagamento|formas de pagamento|cartão|pix/i, resposta: "Aceitamos pagamentos em cartão, Pix ou dinheiro. O pagamento é feito apenas de forma presencial." },
    { pergunta: /caixinha de som|música|som/i, resposta: "Não é permitido entrar com caixas de som ou qualquer outro dispositivo de som no parque." },
    { pergunta: /carro|transporte|ônibus|horário de transporte/i, resposta: "O parque não oferece serviço de transporte ou carro para levar os visitantes. Recomendamos verificar opções de transporte particulares ou ônibus da região." },
    { pergunta: /estadia|dormir|acomodação|hospedagem/i, resposta: "O parque não oferece acomodações para estadia. A cidade mais próxima com opções de hospedagem é Itamarati, recomendamos procurar por lá." },
    { pergunta: /professor|desconto para professor/i, resposta: "Não, não oferecemos descontos para professores." },
    { pergunta: /localização|onde fica|aonde fica|fica em que lugar|qual a localidade/i, resposta: "O parque está localizado a 15 km de Itamarati, sentido Gandu, com entrada na BR-101. Há um ponto de ônibus e duas placas grandes indicando o parque na entrada." },
    // Adicione mais perguntas e respostas conforme necessário
];


let dailyTokenLimit = 333333; // Limite diário de tokens
let usedTokensToday = 0; // Contagem de tokens usados hoje

venom.create ({
    session: "chatGPT_BOT",
    multidevice: true,
})
.then((client) => start(client))
.catch((err) => console.log(err));

const header = {
    "Content-Type": "application/json",
    "Authorization": "Bearer sk-svcacct-_2I-KeutmUGMK8jRxJS4_Yn-RwEl-Anlokda9IC3qcJ28ucIrV5JAp5NIpNYa892XYEmMyT3BlbkFJJJKvwAWr6u1aRsac1H_z2kI_nRm4n3p0HsVc9qfh180z0bKzem6gZtOT8qUtYrwsi0bZ0A" 
}

const start = (client) => {
    client.onMessage((message) => {
        const userCadastrado = banco.db.find(numero => numero.num === message.from);
        if(!userCadastrado){
            console.log("Cadastrando usuario");
            banco.db.push({num: message.from, historico : []});
        }
        else{
            console.log("usuario ja cadastrado");
        }

        const respostaPredefinida = respostasPredefinidas.find(item => item.pergunta.test(message.body));

        if (respostaPredefinida) {
            // Enviar a resposta predefinida sem chamar a API
            client.sendText(message.from, respostaPredefinida.resposta)
                .then((result) => {
                    console.log('Resposta predefinida enviada com sucesso:', result);
                })
                .catch((error) => {
                    console.error('Erro ao enviar a resposta predefinida:', error);
                });
            return;  // Interrompe o fluxo para evitar chamar a API
        }

                // 1. Verificação de "localização"
        if (message.body.toLowerCase().includes('localização') || message.body.toLowerCase().includes('endereço')) {
            // Envia a localização usando coordenadas (latitude e longitude)
            client.sendLocation(message.from, '-13.9303110', '-39.4992540', 'Fazenda Park Nova Conquista')
            .then((result) => {
                console.log('Localização enviada com sucesso:', result);
            })
            .catch((error) => {
                console.error('Erro ao enviar a localização:', error);
            });
            return;
        }

        // 2. Verificação de "cardápio"
        if (message.body.toLowerCase().includes('cardápio') || message.body.toLowerCase().includes('cardapio')) {
            // Envia as duas imagens do cardápio, sem enviar mensagem de texto adicional
            Promise.all([
                client.sendImage(
                    message.from,
                    './images/cardapio1.jpeg',
                    'Cardápio 1', 
                    ''  // Não enviar legenda
                ),
                client.sendImage(
                    message.from,
                    './images/cardapio2.jpeg',
                    'Cardápio 2', 
                    ''  // Não enviar legenda
                )
            ])
            .then((result) => {
                console.log('Imagens do cardápio enviadas com sucesso:', result);
            })
            .catch((error) => {
                console.error('Erro ao enviar imagens do cardápio:', error);
            });

            return;
        }


        const historico = banco.db.find(num => num.num === message.from);
        historico.historico.push("user: " + message.body);
        console.log(historico.historico);

        console.log(banco.db);
        axios.post("https://api.openai.com/v1/chat/completions", {
            "model": "gpt-3.5-turbo",
            "messages": [

                {"role": "system", "content": treinamento},
                {"role": "system", "content": "historico de conversas: " + historico.historico},
                {"role": "user", "content": message.body}
            
            ],

            "max_tokens": 50 
            
           }, {
              headers: header
            })
                .then((response) => {
               console.log(response.data.choices[0].message.content);
               historico.historico.push("assistent: " + response.data.choices[0].message.content);
               client.sendText(message.from, response.data.choices[0].message.content);
            })
                .catch((err) => {
            if (err.response) {
                console.error("Erro ao chamar a API da OpenAI:", err.response.data, "Status:", err.response.status);
            } else {
                console.error("Erro desconhecido:", err);
            }
       });

    })
}