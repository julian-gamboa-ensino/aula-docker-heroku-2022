# Aula básica de Angular (laboratório 1)

https://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js

automação do IP no index e no angular

console.log("lista_pastas Muito Delay"

Estranho: existem problemas com um componente de nome `list.component.ts`

Cognito: https://medium.com/@prasadjay/amazon-cognito-user-pools-in-nodejs-as-fast-as-possible-22d586c5c8ec


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
    console.log(sem_PNG_TXT);

    res.json(sem_PNG_TXT);
}
