const categorias = {
    PROGRAMACAO: "Programação",
    INFRAESTRUTURA: "Infraestrutura & Redes",
    SEGURANCA: "Segurança da Informação",
    CONCEITOS: "Conceitos Básicos"
};

let videos = [
    {
        id: "1",
        titulo: "O que são Firewalls e como funcionam?",
        descricao: "Uma explicação detalhada sobre segurança de redes, tipos de firewall e a importância na proteção de dados corporativos.",
        categoria: categorias.SEGURANCA,
        url: "https://www.youtube.com/watch?v=-KpQpE1gPfw",
        favorito: false,
        ordem: 1
    },
    {
        id: "2",
        titulo: "Introdução ao Protocolo TCP/IP",
        descricao: "Entenda as camadas do protocolo que move a internet, desde a camada de aplicação até a física.",
        categoria: categorias.INFRAESTRUTURA,
        url: "https://www.youtube.com/watch?v=-hBpZgjcCKc",
        favorito: false,
        ordem: 2
    },
    {
        id: "3",
        titulo: "O que é Criptografia na segurança da informação?",
        descricao: " tipos de Criptografia simétrica e assimétrica na segurança da informação.",
        categoria: categorias.SEGURANCA,
        url: "https://www.youtube.com/watch?v=A7815lXI634",
        favorito: false,
        ordem: 3
    },
    {
        id: "4",
        titulo: "O que é Criptografia Assimétrica?",
        descricao: "Entenda como funciona a criptografia assimétrica na segurança da informação.",
        categoria: categorias.SEGURANCA,
        url: "https://www.youtube.com/watch?v=GeSnN8Tt04U",
        favorito: false,
        ordem: 4
    }
];