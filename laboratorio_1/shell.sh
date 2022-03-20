rm -r fotos-comentarios

cd maquina-antiga
ng build
mv dist/fotos-comentarios ..
cd ..

heroku container:push web ; heroku container:release web ; heroku open
