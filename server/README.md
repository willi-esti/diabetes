# Import exercises in the database

Importing exercices :

```sh
tar xvf ex.sql.tgz
docker cp ex.sql db:/tmp/ex.sql && docker exec -it db psql -U postgres -d diabetes -f /tmp/ex.sql
```

You can also get it from the original git repo and import the data :

```
bash script/import_exercises.sh
```
