# Buscador de CEP

## Descrição
O projeto "Buscador de CEP" é uma aplicação web que permite aos usuários buscar informações de endereço a partir de um CEP (Código de Endereçamento Postal) brasileiro. A aplicação utiliza a API ViaCEP para obter os dados do endereço e exibe a localização aproximada em um mapa.

## Estrutura do Projeto
```
buscador-de-cep
├── public
│   ├── index.html        # Estrutura HTML da aplicação
│   ├── css
│   │   └── styles.css    # Estilos CSS da aplicação
│   └── js
│       └── main.js       # Código JavaScript da aplicação
├── package.json          # Configuração do npm
├── .gitignore            # Arquivos e diretórios a serem ignorados pelo Git
└── README.md             # Documentação do projeto
```

## Instalação
1. Clone o repositório:
   ```
   git clone <URL do repositório>
   ```
2. Navegue até o diretório do projeto:
   ```
   cd buscador-de-cep
   ```
3. Instale as dependências:
   ```
   npm install
   ```

## Uso
1. Abra o arquivo `public/index.html` em um navegador web.
2. Digite um CEP válido no campo de entrada e clique no botão "Buscar endereço".
3. O endereço correspondente será exibido, juntamente com a localização no mapa.

## Contribuição
Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

## Licença
Este projeto está licenciado sob a MIT License. Veja o arquivo LICENSE para mais detalhes.