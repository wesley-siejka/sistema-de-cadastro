# Como rodar o MySQL Server manualmente (Windows)

## 1. Localize os binários
Procure na pasta extraída pelos arquivos `mysqld.exe` (servidor) e `mysql.exe` (cliente). Normalmente estão em uma subpasta chamada `bin` dentro de `mysql-commercial` ou similar.

## 2. Inicie o servidor MySQL
Abra o PowerShell na pasta onde está o `mysqld.exe` e rode:

```
./mysqld.exe --initialize-insecure --console
```
Esse comando inicializa o banco sem senha para o usuário root (apenas na primeira vez).

Depois, inicie o servidor:
```
./mysqld.exe
```

## 3. Conecte ao MySQL
Abra outro PowerShell na mesma pasta e rode:
```
./mysql.exe -u root
```

## 4. Crie banco e usuário
No prompt do MySQL, execute:
```
CREATE DATABASE sistema_vendas;
CREATE USER 'user_sistema'@'localhost' IDENTIFIED BY '123456';
GRANT ALL PRIVILEGES ON sistema_vendas.* TO 'user_sistema'@'localhost';
FLUSH PRIVILEGES;
```

## 5. Pronto!
Agora você pode conectar o Go ao MySQL usando:
- host: `localhost`
- user: `user_sistema`
- password: `123456`
- database: `sistema_vendas`

Se precisar de ajuda para instalar como serviço ou configurar senha, só pedir!
