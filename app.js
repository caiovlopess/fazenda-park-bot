const venom = require("venom-bot");
const axios = require("axios");
const banco = require("./src/banco");
const { parse, isWeekend } = require("date-fns");

/*const treinamento = `Você é um atendente e está tirando dúvidas do cliente.
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


`;*/

const respostasPredefinidas = [
  {
    pergunta: /carnaval/i,
    resposta:
      "Durante o Carnaval, o parque funcionará no sábado, domingo, segunda e terça-feira.",
  },

  {
    pergunta: /cachorro/i,
    resposta:
      "Se o seu cachorro for de pequeno porte, ele é bem-vindo na Fazenda Park Nova Conquista! 🐕",
  },
  {
    pergunta: /oi|ola|bom dia|boa tarde|boa noite|opa|olá/i,
    resposta:
      "Olá, {nome}! Bem-vindo à Fazenda Park Nova Conquista! Como posso ajudar? Para um atendimento mais rápido, prefira mensagens de texto.",
  },
  {
    pergunta: /segunda|parque funciona|sabado|sábado|domingo|horas|hora|funcionamento|horário|que dia|quais dias|funciona quando|que dia funciona|ques dia|diasperto|aberto|abre|fecha|fechado|hoje abre|amanhã abre|tá aberto|tá fechado|expediente|horas que abre|horas que fecha|horário de abrir|horário de fechar|que horas abre|que horas fecha|qual horário|qual hora abre|qual hora fecha|quando abre|quando fecha|hoje tem|sábado tem|domingo tem|final de semana tem|fim de semana tem|que dia tá aberto|quando tá funcionando|abre que dia|fecha que dia|tá funcionando|funciona até que horas|funciona que dia/i,
    resposta:
      "O parque funciona de 09:00 da manhã até 17:00 da tarde, apenas no domingo.",
  },
  {
    pergunta: /vitória|da conquista|vitoria da conquista|de conquista/i,
    resposta:
      "Olá! O parque fica a 4h e 38 min da cidade de Vitória da Conquista. Estamos localizados a 15 km de Itamaraty, sentido Gandu, na BR 101. A entrada fica à esquerda, tem um ponto de ônibus e 2 placas grandes do parque na entrada. Posso ajudar em mais alguma coisa?",
  },
  {
    pergunta: /preço|valor|entrada|custa/i,
    resposta:
      "Pagando a entrada de 30 reais você tem acesso a todas as piscinas, campo, tobogã, espaço para fotos, espaço com animais, parquinho para crianças, e muito mais! Obs: Crianças até 3 anos não pagam!",
  },
  {
    pergunta: /crianças pagam|criança|crianças/i,
    resposta:
      "Crianças acima de 3 anos pagam 30 reais. Até 3 anos, a entrada é gratuita.",
  },
  {
    pergunta: /desconto para autista|desconto para autistas|descontos para autistas|descontos para autista/i,
    resposta:
      "Atualmente, não oferecemos descontos para autistas. Agradecemos a compreensão. Posso ajudar em mais alguma dúvida?",
  },
  {
    pergunta: /obrigado|obrigada|obg/i,
    resposta:
      "Agradecemos por utilizar nossos serviços! Esperamos por você em breve!",
  },
  /*{
    pergunta: /desconto/i,
    resposta:
      "Desconto é somente para grupos! Para mais detalhes digite: 'Desconto em grupo'",
  },*/
  {
    pergunta: /comidas|bebidas/i,
    resposta:
      "Não é permitido entrar com bebidas, caixas de som ou alimentos de fora.",
  },
  {
    pergunta: /aniversário/i,
    resposta:
      "Pode comemorar aniversário! É permitido levar bolo e ornamentação, mas doces e salgados não.",
  },
  /*{
    pergunta: /excursão|excursões/i,
    resposta:
      "Sim, aceitamos excursões! Para agendar, é necessário consultar as datas e a quantidade de pessoas. Entre em contato com o gerente no número: 7399037182.",
  },
  {
    pergunta:
      /almoço|comida|refeições|café da manhã|café|alimentos|alimento|alimentação|restaurante/i,
    resposta:
      "Temos restaurante com opções de buffet e à la carte. Digitando a palavra CARDÁPIO, você poderá ver o nosso cardápio digital. Lembrando que não é permitido a entrada de alimentos ou bebidas de fora",
  }, */
  {
    pergunta: /pagamento|formas de pagamento|cartão|pix/i,
    resposta:
      "Aceitamos pagamentos em cartão, Pix ou dinheiro. O pagamento é feito apenas de forma presencial.",
  },
  {
    pergunta: /caixinha de som|música|som/i,
    resposta:
      "Não é permitido entrar com caixas de som ou qualquer outro dispositivo de som no parque.",
  },
  {
    pergunta: /carro|transporte|ônibus|horário de transporte/i,
    resposta:
      "O parque não oferece serviço de transporte ou carro para levar os visitantes. Recomendamos verificar opções de transporte particulares ou ônibus da região.",
  },
  {
    pergunta: /estadia|dormir|acomodação|hospedagem|dormitório|pernoite|quartos|hospedar|cama|abrigo|refúgio|alojamento|hospedagem de grupo|alojamento temporário|casa de hospedagem|quarto de hospedagem|alojamento coletivo/i,
    resposta:
      "O parque não oferece acomodações para estadia. A cidade mais próxima com opções de hospedagem é Itamarati, recomendamos procurar por lá.",
  },
  {
    pergunta: /desconto para professor|desconto para professor/i,
    resposta: "Não, não oferecemos descontos para professores.",
  },
];

const verificarDataFinalDeSemana = (mensagem) => {
  const regexData =
    /\b(\d{1,2})\s+de\s+(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\b/i;
  const meses = {
    janeiro: 0,
    fevereiro: 1,
    março: 2,
    abril: 3,
    maio: 4,
    junho: 5,
    julho: 6,
    agosto: 7,
    setembro: 8,
    outubro: 9,
    novembro: 10,
    dezembro: 11,
  };

  const match = mensagem.match(regexData);

  if (match) {
    const dia = parseInt(match[1]);
    const mes = meses[match[2].toLowerCase()];
    const anoAtual = new Date().getFullYear();

    // Converte a data da mensagem em um objeto Date
    const data = new Date(anoAtual, mes, dia);

    // Verifica se a data é um final de semana (sábado ou domingo)
    if (isWeekend(data)) {
      return "O parque vai abrir nessa data, pois cai em um final de semana! 😊";
    } else {
      return "O parque não abre durante a semana. Estamos abertos apenas aos sábados e domingos.";
    }
  }

  return null;
};

const obterPrevisao = async (latitude, longitude) => {
  try {
    const apiKey = "761a579c8372cb6bbd38d01188618164"; // Substitua pela sua chave da OpenWeatherMap
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=pt_br`;

    const response = await axios.get(url);
    const dados = response.data;

    return `Olá! ${dados.weather[0].main.toLowerCase().includes("rain") ? 
  "Parece que pode chover." : `O tempo está ${dados.weather[0].description} e sem previsão de chuva.`} A temperatura é de ${dados.main.temp}°C, ${dados.main.temp > 30 ? "bem quente, então se hidrate!" : dados.main.temp < 20 ? "mais fresquinho, talvez um agasalho ajude." : "agradável para aproveitar o dia."} O vento está a ${dados.wind.speed} m/s, ${dados.wind.speed > 5 ? "com uma brisa mais forte." : "bem calmo."} Qualquer coisa, é só chamar!`;

  } catch (error) {
    console.error("Erro ao obter previsão do tempo:", error);
    return "❌ Não foi possível obter a previsão do tempo no momento.";
  }
};
const palavrasClima = [
  "clima", "tempo", "previsão", "chuva", "calor", "frio", "sol", "nublado", "temperatura",
  "chovendo", "esfriando", "esquentando", "quantos graus", "vai chover", "vai fazer sol",
  "tá quente", "tá frio", "tá sol", "tempo hoje", "tempo agora", "vento", "sensação térmica"
];

const verificarRespostaPredefinida = (mensagem, nomeUsuario) => {
  const mensagemMin = mensagem.toLowerCase();
  const respostasEncontradas = new Set(); // Usando Set para evitar repetições

  const respostaData = verificarDataFinalDeSemana(mensagem);
  if (respostaData) respostasEncontradas.add(respostaData); // Adiciona resposta sem repetir

  for (const item of respostasPredefinidas) {
    if (item.pergunta.test(mensagemMin)) {
      let resposta = item.resposta;

      // Substitui o placeholder {nome} pelo nome real do usuário
      if (resposta.includes("{nome}")) {
        resposta = resposta.replace("{nome}", nomeUsuario);
      }

      // Só adiciona se a resposta ainda não foi adicionada ao Set
      respostasEncontradas.add(resposta); // Set garante que não haverá duplicação
    }
  }

  // Retorna a resposta única, ou null se não houver resposta
  return respostasEncontradas.size > 0 ? Array.from(respostasEncontradas).join("\n") : null;
};

venom
  .create({
    session: "chatGPT_BOT",
    multidevice: true,
    headless: true, // Ver o navegador para depuração
    logQR: true, // Mostrar QR Code no terminal
    debug: true, // Habilitar logs internos
  })
  .then((client) => start(client))
  .catch((err) => console.log(err));

const header = {
  "Content-Type": "application/json",
  Authorization:
    "Bearer sk-svcacct-_2I-KeutmUGMK8jRxJS4_Yn-RwEl-Anlokda9IC3qcJ28ucIrV5JAp5NIpNYa892XYEmMyT3BlbkFJJJKvwAWr6u1aRsac1H_z2kI_nRm4n3p0HsVc9qfh180z0bKzem6gZtOT8qUtYrwsi0bZ0A",
};

const path = require("path");

const start = (client) => {
  console.log("✅ Função start foi chamada!");
  client.onMessage(async (message) => {
    console.log("Mensagem recebida:", message);

    const primeiroNome = message.sender.pushname ? message.sender.pushname.split(" ")[0] : "Visitante";

    let respostaFinal = verificarRespostaPredefinida(message.body, primeiroNome) || "";

    let precisaEnviarLocalizacao = false;
    let precisaEnviarCardapio = false;
    let precisaEnviarOpcoesDesconto = false;
    let precisaEnviarPrevisao = false;

    if (palavrasClima.some((palavra) => message.body.toLowerCase().includes(palavra))) {
      const latitude = "-13.9306102";
      const longitude = "-39.499918";
      respostaFinal += await obterPrevisao(latitude, longitude);
      precisaEnviarPrevisao = true;
  }

    // Verifica se a mensagem menciona localização
    const palavrasLocalizacao = ["localização", "endereço", "onde fica", "aonde fica", "qual a localidade", "localidade", "local", "endereco", "qual cidade", "que cidade"];
    if (palavrasLocalizacao.some((palavra) => message.body.toLowerCase().includes(palavra))) {
      respostaFinal += "📍 *Nosso Endereço:*\nEstamos localizados a 15 km de Itamaraty, sentido Gandu, na BR 101. A entrada fica à esquerda, com um ponto de ônibus e 2 placas grandes do parque na entrada. Também estamos a 25 km de Gandu, sentido Itamaraty. A entrada fica a 800 metros depois da Fazenda Paineiras, na BR 101, à direita, com as mesmas 2 placas do parque.";
      precisaEnviarLocalizacao = true;
    }

    // Verifica se a mensagem menciona cardápio
    const palavrasCardapio = ["cardápio", "cardapio", "menu", "opções", "pratos", "comida", "o que tem para comer", "almoço", "comida", "refeições", "café da manhã", "café", "alimentos", "alimento", "alimentação", "restaurante"];
    if (palavrasCardapio.some((palavra) => message.body.toLowerCase().includes(palavra))) {
      respostaFinal += "Temos restaurante com opções de buffet e à la carte. Lembrando que não é permitido a entrada de alimentos ou bebidas de fora! Confira abaixo. 👇";
      precisaEnviarCardapio = true;
    }

    // Verifica se a mensagem menciona desconto em grupo
    const palavrasDesconto = ["desconto em grupo", "desconto pra grupo", "pacote", "excursão", "confra", "confraternização", "desconto", "grupo", "grupos"];
    if (palavrasDesconto.some((palavra) => message.body.toLowerCase().includes(palavra))) {
      precisaEnviarOpcoesDesconto = true;
    }

    // Envia a resposta predefinida se existir
    if (respostaFinal) {
      await client.sendText(message.from, respostaFinal);
    }

    // Se precisar enviar localização, faz isso depois de enviar o texto
    if (precisaEnviarLocalizacao) {
      await client.sendLocation(
        message.from,
        "-13.9306102",
        "-39.499918",
        "Fazenda Park Nova Conquista"
      );
    }

    // Se precisar enviar o cardápio, envia as imagens locais
    if (precisaEnviarCardapio) {
      const imagePath1 = path.resolve(__dirname, "images", "cardapio1.jpeg");
      const imagePath2 = path.resolve(__dirname, "images", "cardapio2.jpeg");

      await client.sendImage(
        message.from,
        imagePath1,
        "cardapio1.jpg",
        ""
      );

      await client.sendImage(
        message.from,
        imagePath2,
        "cardapio2.jpg",
        ""
      );
    }

    // Se precisar enviar as opções de desconto em texto
    if (precisaEnviarOpcoesDesconto) {
      await client.sendText(message.from, "💡 Desconto é somente para grupos! Para agendar, é necessário consultar as datas e a quantidade de pessoas. Digite a opção 1 ou 2:\n\n1️⃣ - Até 30 pessoas\n2️⃣ - Acima de 50 pessoas");
    }

    // Detectar resposta do usuário para opções de desconto
    if (message.body === "1" || message.body === "2") {
      console.log("Resposta de desconto recebida:", message.body);
      await client.sendText(
        message.from,
        "📞 Para mais informações sobre pacotes e descontos, entre em contato com nosso gerente pelo WhatsApp: *+55 73 99037-182*."
      );
    }

    //const historico = banco.db.find((num) => num.num === message.from);
    //historico.historico.push("user: " + message.body);
  });
};
    /*axios
      .post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: treinamento },
            { role: "system", content: "Histórico de conversas: " + historico.historico },
            { role: "user", content: message.body },
          ],
          max_tokens: 50,
        },
        { headers: header }
      )
      .then((response) => {
        const respostaIA = response.data.choices[0].message.content;
        historico.historico.push("assistant: " + respostaIA);
        client.sendText(message.from, respostaIA);
      })
      .catch((err) => {
        console.error("Erro na OpenAI:", err.response ? err.response.data : err);
      });*/
//  });
//};
