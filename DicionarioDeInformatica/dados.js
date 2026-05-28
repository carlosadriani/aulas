const categorias = {
    PROGRAMACAO: "Programação",
    INFRAESTRUTURA: "Infraestrutura & Redes",
    SEGURANCA: "Segurança da Informação",
    CONCEITOS: "Conceitos Básicos"
};

let videos = [
    {
        id: "1",
        titulo: "O que é Firewalls e como funcionam?",
        descricao: "Uma explicação detalhada sobre segurança de redes, tipos de firewall e a importância na proteção de dados corporativos.",
        categoria: categorias.SEGURANCA,
        url: "https://www.youtube.com/@dicionariodeinformatica5370",
        favorito: false,
        ordem: 1
    },
    {
        id: "2",
        titulo: "Introdução ao Protocolo TCP/IP",
        descricao: "Entenda as camadas do protocolo que move a internet, desde a camada de aplicação até a física.",
        categoria: categorias.INFRAESTRUTURA,
        url: "https://www.youtube.com/@dicionariodeinformatica5370",
        favorito: false,
        ordem: 2
    },
    {
        id: "3",
        titulo: "Algoritmos de Criptografia Assimétrica",
        descricao: "Como funcionam as chaves públicas e privadas? Entenda o conceito por trás do RSA e criptografia moderna.",
        categoria: categorias.SEGURANCA,
        url: "https://www.youtube.com/@dicionariodeinformatica5370",
        favorito: false,
        ordem: 3
    }
];