var cors = require('cors')
var path = require('path');
var express = require('express');
var fs = require('fs');
var querystring = require('querystring');
const bodyParser = require('body-parser');

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

/******************************************************
Funcionalidades próprias do sistema
*******************************************************/
var person = require('./etiquetas/amanha/amanha/Function.js');//require('./Person.js');var amanha = 

/******************************************************
 *  
*******************************************************/

var app = express();

/*
 A biblioteca swaggerUi permite uma fácil documentação de APIs. 
 Neste caso não será usado um basepath
 */


const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

/***
 * O passo inicial consiste em listar os arquivos (fotos PNG)
 * com ajuda da função:
 *  listar_fotos

Filtro: 
    um dos filtros aplicados permite suprimir a listagem (por parte da função listar_fotos) 
    dos arquivos do tipo *.png.txt
 * 
 */


var mime = {
    html: 'text/html',
    txt: 'text/plain',
    css: 'text/css',
    gif: 'image/gif',
    jpg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml',
    js: 'application/javascript'
};

///////////////////////// Constantes Auxiliares /////////////////////////////

const pasta_FOTOS_novas = './passo_1';
const url_FOTOS_novas = 'passo_1';
const pasta_ETIQUETAS = './etiquetas/';
const local_index="./fotos-comentarios"
const local_configuracoes=pasta_ETIQUETAS


///////////////////////// Funções Auxiliares /////////////////////////////

// Auxiliares da procura das imagens

function getFiles (dir, files_){
    files_ = files_ || [];
    var files = fs.readdirSync(dir);
    for (var i in files){
        var name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()){
            getFiles(name, files_);
        } else {
            files_.push(name);
        }
    }
    return files_;
}
  
///////////////////////// Rotas /////////////////////////////

/////////////////////// Colocando de forma dinâmica os ENDPOINTS ////
ENDPOINTS();

function ENDPOINTS() {

    //POST para registrar etiquetas
    app.post("/registrar_etiqueta", registrar);

//Lendo os diretorios presentes na pasta de ETIQUETAS
    const completo_pasta_INICIAL = path.join(__dirname, "/etiquetas/"); 

//console.log("--------------------------"+typeof(completo_pasta_INICIAL));

    const dirents = fs.readdirSync(completo_pasta_INICIAL, { withFileTypes: true });

//console.log("------------dirents--------------"+typeof(dirents.isDirectory));    
    
    const filesNames = dirents.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);

//Lista de "pastas"
    app.get("/lista_pastas", lista_pastas);
//Lista de NOVOS
    app.get("/novo/novo", atendendo_componente);
    
//Para cada pasta de etiqueta  se habilita um GET
    filesNames.forEach(element => {        
        // PNGs
        app.get("/"+element+"/*.png", entregando_png); //
// JSON contendo as configurações de cada funcionalidade
app.get("/"+element+"/*.json", entregando_json); 
        //Listado para cada etiqueta
        app.get("/"+element, lista_fotos_etiquetas);
        //Atendendo um componente de Angular
		app.get("/"+element+"/"+element, atendendo_componente);
    });

//Entregando Fotos recém colocadas na paste de NOVOS
    app.get("/"+url_FOTOS_novas+"/*/*.png", entregando_novos_png);
    app.get("/novo", lista_fotos_novas);

//Index
    app.get("/", entregando_index);
//PNG.TXT entregando_PNG_TXT; Mas serão evitados os "png.txt"
app.get("/*.json",entregando_json);
//PNG.TXT entregando_PNG_TXT; Mas serão evitados os "png.txt"
    app.get("/*.png.txt",entregando_PNG_TXT);
//Complementos do Index 
    app.get("/*.*", entregando_complementos_index);
}

///////////////////////// ///////////////////////// ///////////////////////// ///////////////////////// 

///////////////////////// Auxiliares: listando fotos emitindo JSON /////////////////////////

/******************************************************
 *  
*******************************************************/

function lista_fotos_etiquetas(req, res, next) {
    nome_etiqueta=req.path.replace("/","");    
    const completo_pasta_FOTOS = path.join(__dirname, pasta_ETIQUETAS); 
    const dirents = fs.readdirSync(completo_pasta_FOTOS, { withFileTypes: true });
    const filesNames = dirents.filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

    pasta_especifica = path.join(completo_pasta_FOTOS,nome_etiqueta); 
    
    //const base_url="http://localhost:31/"; //${PORT}

    //const base_url=`http://${HOST}:${PORT}`;

    const base_url=`https://docker-2-julian.herokuapp.com/`;

    lista_arquivos=getFiles(pasta_especifica).map(
        function(endereco_local) {
            return endereco_local.replace(completo_pasta_FOTOS,base_url);
        }
    )
//Diversos filtros
    const sem_PNG_TXT = lista_arquivos.filter(
        element => !(element.includes(".txt") || element.includes(".json"))
        );
//console.log(sem_PNG_TXT);

    res.json(sem_PNG_TXT);
   
}

/******************************************************
 *  
*******************************************************/

function lista_fotos_novas(eq, res, next)
{
    const completo_pasta_FOTOS = path.join(__dirname, pasta_FOTOS_novas); 

    const dirents = fs.readdirSync(completo_pasta_FOTOS, { withFileTypes: true });

//A estrutura de arquivos é essencial: LEMBRAR que apenas 
//serão considerados aqueles que estejam em pastas

    const filesNames = dirents.filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

    //const base_url="http://localhost:3001/"+url_FOTOS_novas;

    const base_url="https://docker-2-julian.herokuapp.com/"+url_FOTOS_novas;
    
    lista_arquivos=[];

    filesNames.forEach(element => {
        pasta_especifica = path.join(completo_pasta_FOTOS,element); 
        lista_arquivos=lista_arquivos.concat(getFiles(pasta_especifica));        
    });

    lista_arquivos=lista_arquivos.map(
        function(endereco_local) {
            return endereco_local.replace(completo_pasta_FOTOS,base_url);
        }
    )

    const sem_PNG_TXT = lista_arquivos.filter(
        element => !(element.includes(".txt") || element.includes(".json"))
        );

    res.json(sem_PNG_TXT);
}

/**
Facilidade de registro:
    Usando o JSON para poder registrar 
    num arquivo único



*/

function registrar(req, res, next) {        

    
    banco_dados=req.body['endereco_origen'];
    banco_dados=","+JSON.stringify(req.body);

//Se escreve um registro num arquivo que será um QUASE json
    fs.appendFile(__dirname+'/db.json', banco_dados, function (err,data) {
        if (err) {
        return console.log("erro de escrita do arquivo"+err);
        }
    });
    res.send(req.body['etiqueta']);   
    res.sendStatus(200); 
}
///////////////////////// ///////////////////////// ///////////////////////// ///////////////////////// 
/**
Pratica de segurança:
    Se define um path especifico no MIDLEWARE para o formato PNG



*/


function entregando_novos_png(req, res, next) {    

    lendo_png(req, res, next,"");
}


/******************************************************
 *  
*******************************************************/


function lista_pastas(req, res, next) {    

    const completo_pasta_FOTOS = path.join(__dirname, pasta_ETIQUETAS);     
    const dirents = fs.readdirSync(completo_pasta_FOTOS, { withFileTypes: true });    
    const filesNames = dirents.filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
    res.json(filesNames);
}

/******************************************************
 *  
*******************************************************/

function entregando_index(req, res, next) {

//console.log(req.path)
    
    var dir = path.join(__dirname, local_index); 
    
    var previo_file = path.join(dir, req.path.replace(/\/$/, '/index.html'));   

    decodificando_endereco_url=querystring.parse(previo_file);

    file=Object.keys(decodificando_endereco_url)[0];  

    var type = mime[path.extname(file).slice(1)] || 'text/plain';

    
//Envio do arquivo por PIPE
    var stream_pastas_locais = fs.createReadStream(file);

    stream_pastas_locais.on('open', function () {
        res.set('Content-Type', type);
        stream_pastas_locais.pipe(res);
    });

//Em caso de ERRO deve-se liberar para o seguinte:
    stream_pastas_locais.on('error', function (err) {
        res.send("Erro função (entregando_index) "+req.path);
        next();
    });
}

/******************************************************
 *  
*******************************************************/

function entregando_PNG_TXT (req, res, next) {

        next();
}

function entregando_complementos_index(req, res, next) {
    
    var dir = path.join(__dirname, local_index); 
    
    var previo_file = path.join(dir, req.path.replace(/\/$/, '/index.html'));   

    decodificando_endereco_url=querystring.parse(previo_file);

    file=Object.keys(decodificando_endereco_url)[0];  

    var type = mime[path.extname(file).slice(1)] || 'text/plain';

    
//Envio do arquivo por PIPE
    var stream_pastas_locais = fs.createReadStream(file);

    stream_pastas_locais.on('open', function () {
        res.set('Content-Type', type);
        stream_pastas_locais.pipe(res);
    });

//Em caso de ERRO deve-se liberar para o seguinte:
    stream_pastas_locais.on('error', function (err) {
        res.send("FUNC entregando_complementos_index "+req.path);
        //res.send("Erro função (entregando PNG) FUNC entregando_complementos_index"+req.path);
        next();
    });
}

/******************************************************
 *  
*******************************************************/

function atendendo_componente(req, res, next) {    
    
    var dir = path.join(__dirname, local_index);         

	file=dir+"/index.html";

    var type = mime[path.extname(file).slice(1)] || 'text/plain';
    
//Envio do arquivo por PIPE
    var stream_pastas_locais = fs.createReadStream(file);

    stream_pastas_locais.on('open', function () {
        res.set('Content-Type', type);
        stream_pastas_locais.pipe(res);
    });

    lendo_configuracao(req,res);

//Em caso de ERRO deve-se liberar para o seguinte:
    stream_pastas_locais.on('error', function (err) {
        res.send("Erro função (atendendo_componente) "+req.path);
        next();
    });
}
/******************************************************
 *  
*******************************************************/

function lendo_configuracao(req,res)
{    
    var dir = path.join(__dirname, local_configuracoes); 
    var previo_file = path.join(dir, req.path+'/configuracao.json');

var person1 = new person('James', 'Bond');
console.log(person1.fullName());
    
    fs.readFile(previo_file, 'utf8' , (err, data) => {
        if (err) {
            //console.error("err");
          //console.error(err)
          return
        }
//console.log(data)
        try {
            let myArray = JSON.parse(data);
            //console.log(myArray)
        } catch (exc) {
            console.log('Invalido json:', exc);
        }

      })



}

/******************************************************
     if (err) throw err;

    // This is very important! Whenever you parse a JSON, you have to use try/catch
    try {
        let myArray = JSON.parse(data);
        console.log(myArray.map(item => item.message);
    } catch (exc) {
        console.log('Invalid json:', exc);
    }
*******************************************************/


function entregando_png(req, res, next) {    

    lendo_png(req, res, next,"etiquetas");
}

/******************************************************
 *  Cada funcionalidade terá 
*******************************************************/

function entregando_json(req, res, next) {    


    next();
    //lendo_json(req, res, next,"etiquetas");
}


/******************************************************
 *  
*******************************************************/

function lendo_json(req, res, next,complemento_endereco) {
    var dir = path.join(__dirname, complemento_endereco); 
    var previo_file = path.join(dir, req.path.replace(/\/$/, '/index.html'));   

    decodificando_endereco_url=querystring.parse(previo_file);
    file=Object.keys(decodificando_endereco_url)[0];  

    var type = mime[path.extname(file).slice(1)] || 'text/plain';

//console.log(file);

//Envio do arquivo por PIPE
    var stream_pastas_locais = fs.createReadStream(file);

    stream_pastas_locais.on('open', function () {
        res.set('Content-Type', type);
        stream_pastas_locais.pipe(res);
    });

//Em caso de ERRO deve-se liberar para o seguinte:
    stream_pastas_locais.on('error', function (err) {
        res.statusCode=404;
        res.send("(March 2022) Erro função (entregando JSON) "+req.path);
        //next();
    });
}

/******************************************************
 *  
*******************************************************/

function lendo_png(req, res, next,complemento_endereco) {
    var dir = path.join(__dirname, complemento_endereco); 
    var previo_file = path.join(dir, req.path.replace(/\/$/, '/index.html'));   

    decodificando_endereco_url=querystring.parse(previo_file);
    file=Object.keys(decodificando_endereco_url)[0];  

    var type = mime[path.extname(file).slice(1)] || 'text/plain';

//    console.log(file);

    
//Envio do arquivo por PIPE
    var stream_pastas_locais = fs.createReadStream(file);

    stream_pastas_locais.on('open', function () {
        res.set('Content-Type', type);
        stream_pastas_locais.pipe(res);
    });

//Em caso de ERRO deve-se liberar para o seguinte:
    stream_pastas_locais.on('error', function (err) {
        res.statusCode=404;
        res.send("Erro função (entregando PNG) 2022, Janeiro "+req.path);
        //next();
    });
}
    

///////////////////////// FIM  

/*
Para 
    Heroku, 
    ECS
    AWS
http://${HOST}:${PORT}`);
 
 */


app.listen(PORT, HOST);

console.log(`Running on http://${HOST}:${PORT}`);

