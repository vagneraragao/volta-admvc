// Banco de mensagens de agradecimento da campanha das garrafas.
//
// Cada item tem três partes: o agradecimento, que se adapta à quantidade com
// {n} e {garrafas}, a frase da Escritura e a referência. As frases com
// referência também entram no rodízio da Palavra no telão.
//
// Mora num arquivo só dele porque são DADOS, não lógica. Com mais de cem
// itens, deixá-los dentro da loja.js enterrava o estado e a sincronia no meio
// do conteúdo — e conteúdo é justamente a parte que mais muda.

export const MENSAGENS_PADRAO = [
    {
      texto: 'Obrigado! {n} {garrafas} agora fazem parte da nossa missão.',
      versiculo: 'Deus ama quem dá com alegria.',
      ref: '2 Coríntios 9.7',
    },

    {
      texto: 'Você devolveu {n} {garrafas}. Cada gesto ajuda a construir!',
      versiculo: 'Cada um deve fazer a sua parte.',
      ref: '1 Coríntios 3.9',
    },

    {
      texto: '{n} {garrafas} voltaram. E o propósito continua!',
      versiculo: 'Tudo vem de Deus e tudo pertence a ele.',
      ref: '1 Crônicas 29.14',
    },

    {
      texto: 'Obrigado por fazer parte! {n} {garrafas} para a Nova Sede.',
      versiculo: 'Vamos começar a reconstrução!',
      ref: 'Neemias 2.18',
    },

    {
      texto: '{n} {garrafas} entregues com alegria. Deus abençoe!',
      versiculo: 'Deus ama quem dá com alegria.',
      ref: '2 Coríntios 9.7',
    },

    {
      texto: 'Sua contribuição conta! {n} {garrafas} a mais na obra.',
      versiculo: 'Não nos cansemos de fazer o bem.',
      ref: 'Gálatas 6.9',
    },

    {
      texto: 'Obrigado! O que você entrega hoje ajuda a construir amanhã.',
      versiculo: 'Quem semeia com generosidade também colherá com generosidade.',
      ref: '2 Coríntios 9.6',
    },

    {
      texto: '{n} {garrafas} voltaram e se transformaram em propósito.',
      versiculo: 'Façam tudo para a glória de Deus.',
      ref: '1 Coríntios 10.31',
    },

    {
      texto: 'Cada garrafa conta. Obrigado pelas suas {n} {garrafas}!',
      versiculo: 'Não desprezem as coisas pequenas.',
      ref: 'Zacarias 4.10',
    },

    {
      texto: '{n} {garrafas} para a obra. Vamos juntos!',
      versiculo: 'Somos companheiros de trabalho na obra de Deus.',
      ref: '1 Coríntios 3.9',
    },

    {
      texto: 'Você fez sua parte: {n} {garrafas} para a Nova Sede.',
      versiculo: 'Façam o trabalho de todo o coração.',
      ref: 'Colossenses 3.23',
    },

    {
      texto: '{n} {garrafas} entregues. Uma pequena atitude, um grande propósito!',
      versiculo: 'Não desprezem as coisas pequenas.',
      ref: 'Zacarias 4.10',
    },

    {
      texto: 'Obrigado! Sua participação faz diferença na nossa caminhada.',
      versiculo: 'Ajudem uns aos outros a carregar as suas cargas.',
      ref: 'Gálatas 6.2',
    },

    {
      texto: '{n} {garrafas} a mais! A obra continua avançando.',
      versiculo: 'Vamos começar a reconstrução!',
      ref: 'Neemias 2.18',
    },

    {
      texto: 'Você ajudou a semear para o futuro. Obrigado!',
      versiculo: 'Quem semeia com generosidade colherá com generosidade.',
      ref: '2 Coríntios 9.6',
    },

    {
      texto: '{n} {garrafas} que voltam para cumprir um novo propósito.',
      versiculo: 'Tudo pertence ao Senhor.',
      ref: 'Salmos 24.1',
    },

    {
      texto: 'Obrigado! Sua oferta ajuda a tornar nosso sonho realidade.',
      versiculo: 'Deus pode usar tudo para o bem daqueles que o amam.',
      ref: 'Romanos 8.28',
    },

    {
      texto: '{n} {garrafas}. Juntos podemos fazer muito mais!',
      versiculo: 'Dois são melhores do que um.',
      ref: 'Eclesiastes 4.9',
    },

    {
      texto: 'Mais {n} {garrafas} para a Nova Sede. Deus seja glorificado!',
      versiculo: 'Façam tudo para a glória de Deus.',
      ref: '1 Coríntios 10.31',
    },

    {
      texto: 'Sua generosidade voltou em forma de propósito. Obrigado!',
      versiculo: 'Deus ama quem dá com alegria.',
      ref: '2 Coríntios 9.7',
    },

    {
      texto: '{n} {garrafas} entregues. A nossa construção ganha mais um passo!',
      versiculo: 'Vamos reconstruir!',
      ref: 'Neemias 2.18',
    },

    {
      texto: 'Obrigado! Nenhum gesto de amor é pequeno diante de Deus.',
      versiculo: 'Deus vê o que é feito em segredo.',
      ref: 'Mateus 6.4',
    },

    {
      texto: '{n} {garrafas} que ajudam a transformar esperança em realidade.',
      versiculo: 'A esperança não decepciona.',
      ref: 'Romanos 5.5',
    },

    {
      texto: 'Você semeou hoje. Obrigado por acreditar nessa obra!',
      versiculo: 'No tempo certo colheremos, se não desistirmos.',
      ref: 'Gálatas 6.9',
    },

    {
      texto: '{n} {garrafas} para uma obra que pertence a Deus.',
      versiculo: 'Se o Senhor não construir a casa, não adianta trabalhar.',
      ref: 'Salmos 127.1',
    },

    {
      texto: 'Obrigado por contribuir com {n} {garrafas}!',
      versiculo: 'Cada pessoa deve dar conforme decidiu no coração.',
      ref: '2 Coríntios 9.7',
    },

    {
      texto: 'Mais uma contribuição para a Nova Sede. Obrigado!',
      versiculo: 'Tudo o que fazemos deve ser feito com amor.',
      ref: '1 Coríntios 16.14',
    },

    {
      texto: '{n} {garrafas} voltaram. O propósito segue em frente!',
      versiculo: 'O Senhor firma os passos de quem anda com ele.',
      ref: 'Salmos 37.23',
    },

    {
      texto: 'Obrigado! Você também faz parte dessa construção.',
      versiculo: 'Vocês são o edifício de Deus.',
      ref: '1 Coríntios 3.9',
    },

    {
      texto: '{n} {garrafas}. Mais um passo dado com fé!',
      versiculo: 'Vivemos pela fé, e não pelo que vemos.',
      ref: '2 Coríntios 5.7',
    },

    {
      texto: 'Sua atitude ajuda a preparar um lugar para as próximas gerações.',
      versiculo: 'Uma geração contará à outra as grandes coisas de Deus.',
      ref: 'Salmos 145.4',
    },

    {
      texto: '{n} {garrafas} entregues. Obrigado por semear!',
      versiculo: 'Quem semeia pouco colhe pouco.',
      ref: '2 Coríntios 9.6',
    },

    {
      texto: 'Cada retorno aproxima a nossa Nova Sede.',
      versiculo: 'Tudo tem o seu tempo determinado.',
      ref: 'Eclesiastes 3.1',
    },

    {
      texto: '{n} {garrafas} e muita gratidão!',
      versiculo: 'Sejam sempre agradecidos.',
      ref: '1 Tessalonicenses 5.18',
    },

    {
      texto: 'Obrigado! Seu gesto ajuda a cuidar daquilo que Deus nos confiou.',
      versiculo: 'O Senhor confia responsabilidades aos seus servos.',
      ref: 'Lucas 16.10',
    },

    {
      texto: '{n} {garrafas} transformadas em contribuição para a obra.',
      versiculo: 'Tudo vem de Deus.',
      ref: '1 Crônicas 29.14',
    },

    {
      texto: 'Mais um passo! Obrigado pelas suas {n} {garrafas}.',
      versiculo: 'Corramos com perseverança a corrida que temos pela frente.',
      ref: 'Hebreus 12.1',
    },

    {
      texto: '{n} {garrafas} entregues com amor. Deus abençoe!',
      versiculo: 'Façam tudo com amor.',
      ref: '1 Coríntios 16.14',
    },

    {
      texto: 'Você participou. Você semeou. Você faz parte!',
      versiculo: 'Somos companheiros de trabalho de Deus.',
      ref: '1 Coríntios 3.9',
    },

    {
      texto: '{n} {garrafas} para uma grande obra!',
      versiculo: 'Não desprezem um começo pequeno.',
      ref: 'Zacarias 4.10',
    },

    {
      texto: 'Obrigado! Juntos estamos construindo algo para o Reino.',
      versiculo: 'Trabalhem juntos pelo mesmo propósito.',
      ref: 'Filipenses 1.27',
    },

    {
      texto: '{n} {garrafas} devolvidas. E muita esperança compartilhada!',
      versiculo: 'A esperança produz perseverança.',
      ref: 'Romanos 5.3-4',
    },

    {
      texto: 'Sua contribuição chegou na hora certa. Obrigado!',
      versiculo: 'Há tempo para todo propósito.',
      ref: 'Eclesiastes 3.1',
    },

    {
      texto: '{n} {garrafas}. O pouco nas mãos de muitos se torna muito!',
      versiculo: 'Jesus multiplicou o que havia sido oferecido.',
      ref: 'João 6.11',
    },

    {
      texto: 'Obrigado! Continue fazendo parte dessa história.',
      versiculo: 'Não nos cansemos de fazer o bem.',
      ref: 'Gálatas 6.9',
    },

    {
      texto: '{n} {garrafas} entregues. Nossa gratidão a você!',
      versiculo: 'Deem graças ao Senhor porque ele é bom.',
      ref: 'Salmos 107.1',
    },

    {
      texto: 'Cada garrafa devolvida carrega uma semente de esperança.',
      versiculo: 'Aquele que planta com esperança também colherá.',
      ref: '2 Coríntios 9.6',
    },

    {
      texto: '{n} {garrafas} para ajudar a construir nossa nova casa.',
      versiculo: 'Vamos construir novamente o Templo.',
      ref: 'Ageu 1.8',
    },

    {
      texto: 'Obrigado! Sua disposição fortalece a nossa obra.',
      versiculo: 'Sejam fortes e não desistam.',
      ref: '2 Crônicas 15.7',
    },

    {
      texto: '{n} {garrafas}. A obra é grande, mas Deus está conosco!',
      versiculo: 'Sejam fortes e corajosos, pois o Senhor está com vocês.',
      ref: '2 Crônicas 15.7',
    },

    {
      texto: 'Você devolveu {n} {garrafas} e ajudou a manter viva uma visão.',
      versiculo: 'Escreva claramente a visão.',
      ref: 'Habacuque 2.2',
    },

    {
      texto: '{n} {garrafas}. Uma contribuição feita com fé!',
      versiculo: 'A fé é a certeza das coisas que esperamos.',
      ref: 'Hebreus 11.1',
    },

    {
      texto: 'Obrigado por acreditar e participar!',
      versiculo: 'Aquele que começou a boa obra vai completá-la.',
      ref: 'Filipenses 1.6',
    },

    {
      texto: '{n} {garrafas} voltaram para um propósito maior.',
      versiculo: 'Deus pode fazer muito mais do que pedimos.',
      ref: 'Efésios 3.20',
    },

    {
      texto: 'Mais {n} {garrafas}! Mais um passo rumo à Nova Sede.',
      versiculo: 'Vamos continuar trabalhando.',
      ref: 'Neemias 4.6',
    },

    {
      texto: 'Obrigado! A sua parte também importa.',
      versiculo: 'Cada parte contribui para o crescimento do corpo.',
      ref: 'Efésios 4.16',
    },

    {
      texto: '{n} {garrafas} entregues com um coração disposto.',
      versiculo: 'Deus olha para o coração.',
      ref: '1 Samuel 16.7',
    },

    {
      texto: 'Seu gesto demonstra que juntos podemos servir melhor.',
      versiculo: 'Sirvam uns aos outros com amor.',
      ref: 'Gálatas 5.13',
    },

    {
      texto: '{n} {garrafas}. Obrigado por servir através de um simples gesto!',
      versiculo: 'Tudo o que fizerem, façam para o Senhor.',
      ref: 'Colossenses 3.23',
    },

    {
      texto: 'Hoje foram {n} {garrafas}. Amanhã, uma nova história!',
      versiculo: 'Deus faz novas todas as coisas.',
      ref: 'Apocalipse 21.5',
    },

    {
      texto: 'Obrigado! Sua contribuição tem valor diante de Deus.',
      versiculo: 'Deus não esquece o trabalho e o amor de vocês.',
      ref: 'Hebreus 6.10',
    },

    {
      texto: '{n} {garrafas} que não foram para o lixo. Foram para um propósito!',
      versiculo: 'Tudo tem um propósito.',
      ref: 'Eclesiastes 3.1',
    },

    {
      texto: 'Mais {n} {garrafas} para a nossa missão. Deus seja louvado!',
      versiculo: 'Tudo seja feito para a glória de Deus.',
      ref: '1 Coríntios 10.31',
    },

    {
      texto: 'Obrigado! Continue semeando com alegria.',
      versiculo: 'Deus ama quem dá com alegria.',
      ref: '2 Coríntios 9.7',
    },

    {
      texto: '{n} {garrafas} entregues. A nossa fé também se constrói com atitudes.',
      versiculo: 'A fé sem ações é morta.',
      ref: 'Tiago 2.17',
    },

    {
      texto: 'Sua ação fala alto: {n} {garrafas} para a Nova Sede!',
      versiculo: 'Mostrem a fé pelas suas ações.',
      ref: 'Tiago 2.18',
    },

    {
      texto: 'Obrigado por transformar intenção em ação!',
      versiculo: 'Não amemos somente com palavras, mas com ações.',
      ref: '1 João 3.18',
    },

    {
      texto: '{n} {garrafas} que mostram que cada um pode fazer sua parte.',
      versiculo: 'Cada pessoa recebeu uma tarefa.',
      ref: '1 Coríntios 12.18',
    },

    {
      texto: 'A obra precisa de todos nós. Obrigado pelas {n} {garrafas}!',
      versiculo: 'O corpo tem muitas partes, mas é um só.',
      ref: '1 Coríntios 12.12',
    },

    {
      texto: '{n} {garrafas}. Juntos somos mais fortes!',
      versiculo: 'Um pode ajudar o outro.',
      ref: 'Eclesiastes 4.10',
    },

    {
      texto: 'Obrigado! Você está ajudando a escrever essa história.',
      versiculo: 'Contem às próximas gerações o que Deus fez.',
      ref: 'Salmos 78.4',
    },

    {
      texto: '{n} {garrafas} para uma geração que ainda vai chegar.',
      versiculo: 'Ensinem seus filhos sobre as maravilhas de Deus.',
      ref: 'Salmos 78.6-7',
    },

    {
      texto: 'Hoje você ajudou a preparar o amanhã. Obrigado!',
      versiculo: 'Pensem também nas gerações que virão.',
      ref: 'Salmos 78.6',
    },

    {
      texto: '{n} {garrafas}. Que esse gesto alcance muitas vidas!',
      versiculo: 'Vocês são a luz do mundo.',
      ref: 'Mateus 5.14',
    },

    {
      texto: 'Obrigado! Que essa contribuição seja luz para muitos.',
      versiculo: 'Que a luz de vocês brilhe diante dos outros.',
      ref: 'Mateus 5.16',
    },

    {
      texto: '{n} {garrafas} e uma oportunidade de servir.',
      versiculo: 'Sirvam uns aos outros.',
      ref: '1 Pedro 4.10',
    },

    {
      texto: 'Você serviu através de um simples gesto. Obrigado!',
      versiculo: 'Cada um recebeu um dom para servir aos outros.',
      ref: '1 Pedro 4.10',
    },

    {
      texto: '{n} {garrafas} entregues. Seu serviço tem valor!',
      versiculo: 'Deus não esquece o trabalho de vocês.',
      ref: 'Hebreus 6.10',
    },

    {
      texto: 'Obrigado! Continue firme naquilo que Deus colocou em nossas mãos.',
      versiculo: 'Sejam firmes e não desistam.',
      ref: '2 Crônicas 15.7',
    },

    {
      texto: '{n} {garrafas}. Não vamos parar até concluir a obra!',
      versiculo: 'Não desistam de fazer o bem.',
      ref: 'Gálatas 6.9',
    },

    {
      texto: 'Mais um passo concluído. Obrigado por caminhar conosco!',
      versiculo: 'Corramos com perseverança.',
      ref: 'Hebreus 12.1',
    },

    {
      texto: '{n} {garrafas}. A caminhada continua!',
      versiculo: 'Deus guia os passos dos seus filhos.',
      ref: 'Salmos 37.23',
    },

    {
      texto: 'Obrigado! O Senhor abençoe sua generosidade.',
      versiculo: 'O Senhor abençoa quem confia nele.',
      ref: 'Jeremias 17.7',
    },

    {
      texto: '{n} {garrafas} entregues. Receba nossa gratidão!',
      versiculo: 'Sejam agradecidos em todas as situações.',
      ref: '1 Tessalonicenses 5.18',
    },

    {
      texto: 'Sua participação alegra o nosso coração!',
      versiculo: 'Alegrem-se sempre no Senhor.',
      ref: 'Filipenses 4.4',
    },

    {
      texto: '{n} {garrafas}. Que alegria fazer parte dessa obra!',
      versiculo: 'Sirvam ao Senhor com alegria.',
      ref: 'Salmos 100.2',
    },

    {
      texto: 'Obrigado! Estamos construindo juntos, passo a passo.',
      versiculo: 'A união traz força.',
      ref: 'Eclesiastes 4.12',
    },

    {
      texto: '{n} {garrafas}. Um gesto que se soma ao de muitos!',
      versiculo: 'Cada parte faz a sua parte.',
      ref: 'Efésios 4.16',
    },

    {
      texto: 'Sua contribuição se juntou à de muitos. Obrigado!',
      versiculo: 'Havia união entre todos os que criam.',
      ref: 'Atos 4.32',
    },

    {
      texto: '{n} {garrafas} entregues. Que haja união nessa construção!',
      versiculo: 'Como é bom quando o povo vive unido!',
      ref: 'Salmos 133.1',
    },

    {
      texto: 'Obrigado! Juntos podemos cuidar melhor daquilo que Deus nos deu.',
      versiculo: 'Deus colocou o ser humano para cuidar da sua criação.',
      ref: 'Gênesis 2.15',
    },

    {
      texto: '{n} {garrafas} retornaram. Cuidar também é servir!',
      versiculo: 'Deus confiou sua criação aos nossos cuidados.',
      ref: 'Gênesis 2.15',
    },

    {
      texto: 'Você cuidou do que seria descartado e ajudou uma boa causa.',
      versiculo: 'Quem é fiel nas pequenas coisas também será fiel nas grandes.',
      ref: 'Lucas 16.10',
    },

    {
      texto: '{n} {garrafas}. Pequenas atitudes também têm grande valor!',
      versiculo: 'Quem é fiel no pouco também será fiel no muito.',
      ref: 'Lucas 16.10',
    },

    {
      texto: 'Obrigado! O pouco pode se tornar muito quando colocado nas mãos certas.',
      versiculo: 'Jesus multiplicou o pouco que havia.',
      ref: 'João 6.11',
    },

    {
      texto: '{n} {garrafas}. Deus pode usar cada contribuição!',
      versiculo: 'Deus pode fazer muito mais do que imaginamos.',
      ref: 'Efésios 3.20',
    },

    {
      texto: 'Mais uma semente plantada. Obrigado!',
      versiculo: 'Cada um colherá aquilo que plantar.',
      ref: 'Gálatas 6.7',
    },

    {
      texto: '{n} {garrafas}. Toda semeadura tem seu tempo de colheita!',
      versiculo: 'No tempo certo colheremos, se não desistirmos.',
      ref: 'Gálatas 6.9',
    },

    {
      texto: 'Obrigado por semear esperança através do VOLTA!',
      versiculo: 'A esperança produz perseverança.',
      ref: 'Romanos 5.4',
    },

    {
      texto: '{n} {garrafas} que ajudam a transformar uma visão em realidade.',
      versiculo: 'Escreva claramente a visão.',
      ref: 'Habacuque 2.2',
    },

    {
      texto: 'A visão continua viva. Obrigado por fazer parte!',
      versiculo: 'A visão ainda vai acontecer no tempo determinado.',
      ref: 'Habacuque 2.3',
    },

    {
      texto: '{n} {garrafas}. Estamos construindo com esperança e fé!',
      versiculo: 'Tudo é possível para quem crê.',
      ref: 'Marcos 9.23',
    },

    {
      texto: 'Obrigado! Nossa esperança está em Deus.',
      versiculo: 'Os que esperam no Senhor renovam suas forças.',
      ref: 'Isaías 40.31',
    },

    {
      texto: '{n} {garrafas}. Que Deus continue sustentando esta obra!',
      versiculo: 'O Senhor é quem sustenta a obra.',
      ref: 'Salmos 127.1',
    },

    {
      texto: 'Mais uma contribuição. Mais um motivo para agradecer!',
      versiculo: 'Deem graças ao Senhor porque ele é bom.',
      ref: 'Salmos 136.1',
    },

    {
      texto: '{n} {garrafas}. Obrigado por fazer parte do VOLTA!',
      versiculo: 'Somos parte uns dos outros.',
      ref: 'Romanos 12.5',
    },

    {
      texto: 'Você faz parte dessa história. Obrigado!',
      versiculo: 'Cada um recebeu uma parte importante.',
      ref: 'Romanos 12.4-5',
    },

    {
      texto: '{n} {garrafas} entregues. A missão continua!',
      versiculo: 'Vão e façam discípulos de todas as nações.',
      ref: 'Mateus 28.19',
    },

    {
      texto: 'Que cada gesto ajude a cumprir nossa missão!',
      versiculo: 'Façam discípulos de todas as nações.',
      ref: 'Mateus 28.19',
    },

    {
      texto: '{n} {garrafas}. Uma contribuição para uma casa que servirá ao Reino.',
      versiculo: 'A minha casa será chamada casa de oração.',
      ref: 'Mateus 21.13',
    },

    {
      texto: 'Obrigado! Que nossa futura casa seja um lugar de bênção.',
      versiculo: 'Minha casa será chamada casa de oração.',
      ref: 'Isaías 56.7',
    },

    {
      texto: '{n} {garrafas}. Que essa obra seja dedicada ao Senhor!',
      versiculo: 'Tudo pertence ao Senhor.',
      ref: '1 Crônicas 29.11',
    },

    {
      texto: 'O que é de Deus volta para Deus. Obrigado!',
      versiculo: 'Tudo vem de ti, e nós te devolvemos o que recebemos.',
      ref: '1 Crônicas 29.14',
    },

    {
      texto: '{n} {garrafas}. Toma de volta, pois tudo é dEle!',
      versiculo: 'Tudo vem de ti, e nós te devolvemos o que recebemos.',
      ref: '1 Crônicas 29.14',
    },

    {
      texto: 'VOLTA: o que recebemos de Deus, devolvemos com gratidão.',
      versiculo: 'Tudo vem de ti.',
      ref: '1 Crônicas 29.14',
    },

    {
      texto: '{n} {garrafas} voltaram. O propósito permanece!',
      versiculo: 'Os planos do Senhor permanecem para sempre.',
      ref: 'Salmos 33.11',
    },

    {
      texto: 'Obrigado! O seu gesto faz parte de algo maior.',
      versiculo: 'Deus faz tudo para o bem daqueles que o amam.',
      ref: 'Romanos 8.28',
    },

    {
      texto: '{n} {garrafas}. Que Deus multiplique cada gesto de amor!',
      versiculo: 'Deus pode dar muito mais do que precisamos.',
      ref: '2 Coríntios 9.8',
    },

    {
      texto: 'Sua generosidade ajuda a obra a continuar. Obrigado!',
      versiculo: 'Deus dará tudo o que vocês precisam.',
      ref: '2 Coríntios 9.8',
    },

    {
      texto: '{n} {garrafas}. Continue fazendo o bem!',
      versiculo: 'Não nos cansemos de fazer o bem.',
      ref: 'Gálatas 6.9',
    },

    {
      texto: 'Obrigado por transformar um simples retorno em uma grande contribuição!',
      versiculo: 'Não amemos somente de palavras, mas com ações.',
      ref: '1 João 3.18',
    },

    {
      texto: '{n} {garrafas}. O VOLTA continua, e a obra também!',
      versiculo: 'O Senhor completará aquilo que começou.',
      ref: 'Salmos 138.8',
    },

    {
      texto: 'Mais uma etapa vencida. Obrigado por estar conosco!',
      versiculo: 'O Senhor está conosco; não tenham medo.',
      ref: 'Josué 1.9',
    },

    {
      texto: '{n} {garrafas} para uma obra que estamos construindo juntos.',
      versiculo: 'Eles trabalharam juntos na reconstrução.',
      ref: 'Neemias 3.1',
    },

    {
      texto: 'Cada pessoa fez sua parte. Obrigado pela sua!',
      versiculo: 'Cada um trabalhou na parte que lhe cabia.',
      ref: 'Neemias 3.28',
    },

    {
      texto: '{n} {garrafas}. Uma mão ajuda a outra!',
      versiculo: 'Um ajuda o outro.',
      ref: 'Eclesiastes 4.10',
    },

    {
      texto: 'Obrigado! Quando todos participam, a obra avança.',
      versiculo: 'O povo trabalhou com entusiasmo.',
      ref: 'Neemias 4.6',
    },

    {
      texto: '{n} {garrafas}. Vamos continuar construindo!',
      versiculo: 'O povo tinha vontade de trabalhar.',
      ref: 'Neemias 4.6',
    },

    {
      texto: 'Sua contribuição é parte da nossa história. Obrigado!',
      versiculo: 'Até aqui o Senhor nos ajudou.',
      ref: '1 Samuel 7.12',
    },

    {
      texto: '{n} {garrafas}. Até aqui nos ajudou o Senhor!',
      versiculo: 'Até aqui o Senhor nos ajudou.',
      ref: '1 Samuel 7.12',
    },

    {
      texto: 'Obrigado! Vamos celebrar cada passo dessa caminhada.',
      versiculo: 'Este é o dia que o Senhor fez; vamos nos alegrar.',
      ref: 'Salmos 118.24',
    },

    {
      texto: '{n} {garrafas}. Hoje temos mais um motivo para celebrar!',
      versiculo: 'Alegrem-se sempre no Senhor.',
      ref: 'Filipenses 4.4',
    },

    {
      texto: 'Que alegria ter você nessa missão! Obrigado!',
      versiculo: 'Sirvam ao Senhor com alegria.',
      ref: 'Salmos 100.2',
    },

    {
      texto: '{n} {garrafas}. Servir também é adorar!',
      versiculo: 'Façam tudo para a glória de Deus.',
      ref: '1 Coríntios 10.31',
    },

    {
      texto: 'Obrigado! Que seu gesto seja uma expressão de amor.',
      versiculo: 'Tudo o que vocês fizerem deve ser feito com amor.',
      ref: '1 Coríntios 16.14',
    },

    {
      texto: '{n} {garrafas}. Amor que se transforma em atitude!',
      versiculo: 'Amemos uns aos outros.',
      ref: '1 João 4.7',
    },

    {
      texto: 'Você fez sua parte. Deus continua fazendo a dele!',
      versiculo: 'Eu plantei, Apolo regou, mas Deus fez crescer.',
      ref: '1 Coríntios 3.6',
    },

    {
      texto: '{n} {garrafas}. Nós plantamos, Deus faz crescer!',
      versiculo: 'Deus é quem faz crescer.',
      ref: '1 Coríntios 3.7',
    },

    {
      texto: 'Obrigado! Nossa parte é semear com fé.',
      versiculo: 'Eu plantei, outro regou, mas Deus fez crescer.',
      ref: '1 Coríntios 3.6',
    },

    {
      texto: '{n} {garrafas}. Que Deus faça crescer esse propósito!',
      versiculo: 'Deus é quem faz crescer.',
      ref: '1 Coríntios 3.7',
    },

    {
      texto: 'VOLTA: pequenas atitudes, grande propósito!',
      versiculo: 'Não desprezem as coisas pequenas.',
      ref: 'Zacarias 4.10',
    },

    {
      texto: '{n} {garrafas}. Pequenas sementes, grandes sonhos!',
      versiculo: 'Quem semeia com generosidade colherá com generosidade.',
      ref: '2 Coríntios 9.6',
    },

    {
      texto: 'Obrigado por ajudar a transformar sonho em construção!',
      versiculo: 'Vamos construir novamente o Templo.',
      ref: 'Ageu 1.8',
    },

    {
      texto: '{n} {garrafas}. Nossa Nova Sede começa com cada um de nós!',
      versiculo: 'Vamos reconstruir!',
      ref: 'Neemias 2.18',
    },

    {
      texto: 'A Nova Sede começa em pequenos gestos. Obrigado!',
      versiculo: 'Não desprezem as coisas pequenas.',
      ref: 'Zacarias 4.10',
    },

    {
      texto: '{n} {garrafas}. O sonho é nosso, mas a obra é de Deus!',
      versiculo: 'Se o Senhor não construir a casa, não adianta trabalhar.',
      ref: 'Salmos 127.1',
    },

    {
      texto: 'Obrigado! Que tudo o que fizermos aponte para Deus.',
      versiculo: 'Façam tudo para a glória de Deus.',
      ref: '1 Coríntios 10.31',
    },

    {
      texto: '{n} {garrafas}. Para o Reino, para a missão, para a glória de Deus!',
      versiculo: 'Tudo seja feito para a glória de Deus.',
      ref: '1 Coríntios 10.31',
    },

    {
      texto: 'Toma de volta: {n} {garrafas} devolvidas ao propósito.',
      versiculo: 'Tudo vem de ti.',
      ref: '1 Crônicas 29.14',
    },

    {
      texto: '{n} {garrafas}. Porque tudo é dEle!',
      versiculo: 'Do Senhor é a terra e tudo o que nela existe.',
      ref: 'Salmos 24.1',
    },

    {
      texto: 'VOLTA: recebemos, cuidamos e devolvemos com gratidão.',
      versiculo: 'Tudo vem de ti, e nós te devolvemos o que recebemos.',
      ref: '1 Crônicas 29.14',
    },

    {
      texto: '{n} {garrafas}. Obrigado por devolver ao Dono!',
      versiculo: 'Tudo vem de ti.',
      ref: '1 Crônicas 29.14',
    },

    {
      texto: 'O que volta hoje ajuda a construir o que virá amanhã.',
      versiculo: 'Ensinem às próximas gerações.',
      ref: 'Salmos 78.6',
    },

    {
      texto: '{n} {garrafas}. Construindo hoje para servir amanhã!',
      versiculo: 'Uma geração contará à outra as grandes coisas de Deus.',
      ref: 'Salmos 145.4',
    },

    {
      texto: 'Obrigado por fazer parte do que Deus está construindo entre nós!',
      versiculo: 'Somos companheiros de trabalho de Deus.',
      ref: '1 Coríntios 3.9',
    },

    {
      texto: '{n} {garrafas}. Juntos, servindo a um propósito maior!',
      versiculo: 'Sirvam uns aos outros com amor.',
      ref: 'Gálatas 5.13',
    },

    {
      texto: 'Sua garrafa voltou. Seu propósito ficou!',
      versiculo: 'O amor nunca acaba.',
      ref: '1 Coríntios 13.8',
    },

    {
      texto: '{n} {garrafas}. O que parece pequeno pode fazer parte de algo grande!',
      versiculo: 'Não desprezem as coisas pequenas.',
      ref: 'Zacarias 4.10',
    },

    {
      texto: 'Obrigado! Cada retorno nos aproxima da Nova Sede.',
      versiculo: 'Vamos continuar trabalhando.',
      ref: 'Neemias 4.6',
    },

    {
      texto: '{n} {garrafas}. Mais um retorno, mais um passo!',
      versiculo: 'Não desistam de fazer o bem.',
      ref: 'Gálatas 6.9',
    },

    {
      texto: 'Sua participação fez o VOLTA acontecer hoje. Obrigado!',
      versiculo: 'Cada um recebeu uma tarefa.',
      ref: '1 Coríntios 3.5',
    },

    {
      texto: '{n} {garrafas}. Você também está construindo essa história!',
      versiculo: 'Cada um faça a sua parte.',
      ref: 'Efésios 4.16',
    },

    {
      texto: 'Obrigado! Que Deus abençoe sua disposição em servir.',
      versiculo: 'Deus não esquece o trabalho e o amor de vocês.',
      ref: 'Hebreus 6.10',
    },

    {
      texto: '{n} {garrafas}. Um gesto de hoje, uma bênção para amanhã!',
      versiculo: 'Quem semeia com generosidade colherá com generosidade.',
      ref: '2 Coríntios 9.6',
    },

    {
      texto: 'VOLTA: devolvendo o que é dEle e construindo para o Reino.',
      versiculo: 'Tudo vem de ti.',
      ref: '1 Crônicas 29.14',
    },
];
