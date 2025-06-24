INSERT INTO usuario (Nome, Telefone, Email, Senha_hash, Tipo, Perfil_usuario) VALUES
('João Silva', '(11) 99999-9999', 'joao@email.com', '1', 'PESSOA', 'ADOTANTE'),
('Maria Souza', '(11) 88888-8888', 'maria@email.com', '1', 'PESSOA', 'PROTETOR'),
('ONG Pets Felizes', '(11) 77777-7777', 'ong@pets.com', '1', 'ONG', 'PROTETOR'),
('Visitante', '00000000000', 'visitante@visitante', 'visitante', 'PESSOA', 'ADOTANTE'),
('Admin', '00000000000', 'admin@admin', 'admin', 'PESSOA', 'ADOTANTE');

INSERT INTO historico_usuario (Id_usuario, Mensagem) VALUES 
(1, 'Usuário cadastrado no sistema'),
(2, 'Primeiro acesso realizado'),
(3, 'Cadastro de ONG verificado');

INSERT INTO categorias (Nome) VALUES 
('Comportamento'),
('Saúde'),
('Cuidados');

INSERT INTO tags (Nome, Id_categoria) VALUES 
('Brincalhão', 1),
('Calmo', 1),
('Vacinação', 2),
('Castrado', 2),
('Banho', 3);

INSERT INTO pet (Id_usuario, Nome, Especie, Raca, Idade_ano, Idade_mes, Porte, Peso, Sexo, Bio) VALUES 
(3, 'Rex', 'Cachorro', 'POODLE', 1, 5, 'MEDIO', 12.5, 'M', 'Cachorro muito brincalhao e amoroso'),
(3, 'Luna', 'Gato', 'PUG', 2, 0, 'PEQUENO', 4.2, 'F', 'Gatinha tranquila que adora carinho'),
(3, 'Max', 'Cachorro', 'BULLDOG', 5, 0, 'GRANDE', 25.0, 'M', 'Cachorro protetor e leal'),
(3, 'Mia', 'Gato', 'SIAMESE', 1, 0, 'PEQUENO', 3.0, 'F', 'Gatinha curiosa e brincalhona'),
(3, 'Bobby', 'Cachorro', 'VIRALATA', 13, 0, 'MEDIO', 15.0, 'M', 'Cachorro amigavel e sociavel'),
(3, 'Nina', 'Gato', 'VIRALATA', 3, 0, 'PEQUENO', 3.5, 'F', 'Gata independente e carinhosa'),
(3, 'Toby', 'Cachorro', 'BEAGLE', 6, 0, 'PEQUENO', 10.0, 'M', 'Cachorro curioso e ativo'),
(3, 'Lily', 'Gato', 'PERSA', 9, 0, 'PEQUENO', 5.0, 'F', 'Gata tranquila e afetuosa'),
(3, 'Charlie', 'Cachorro', 'LABRADOR', 4, 0, 'GRANDE', 30.0, 'M', 'Cachorro amigavel e brincalhao'),
(3, 'Bella', 'Gato', 'SIBERIANO', 2, 0, 'PEQUENO', 4.5, 'F', 'Gata carinhosa e brincalhona'),
(3, 'Rocky', 'Cachorro', 'GERMAN SHEPHERD', 7, 0, 'GRANDE', 35.0, 'M', 'Cachorro protetor e inteligente'),
(3, 'Sophie', 'Gato', 'BRITISH SHORTHAIR', 5, 0, 'PEQUENO', 4.0, 'F', 'Gata tranquila e afetuosa'),
(3, 'Oscar', 'Cachorro', 'DACHSHUND', 8, 0, 'PEQUENO', 9.0, 'M', 'Cachorro curioso e brincalhao'),
(3, 'Chloe', 'Gato', 'RAGDOLL', 3, 0, 'PEQUENO', 6.0, 'F', 'Gata carinhosa e tranquila'),
(3, 'Ziggy', 'Cachorro', 'LABRADOR', 4, 0, 'GRANDE', 29.0, 'M', 'Muito brincalhao e carinhoso'),
(3, 'Luna', 'Gato', 'SIAMES', 2, 0, 'PEQUENO', 3.6, 'F', 'Gata vocal e esperta'),
(3, 'Toby', 'Cachorro', 'BEAGLE', 3, 0, 'MEDIO', 12.5, 'M', 'Adora cavar buracos e correr'),
(3, 'Rocky', 'Cachorro', 'BOXER', 6, 0, 'GRANDE', 33.0, 'M', 'Protetor e brincalhao'),
(3, 'Nina', 'Gato', 'PERSA', 5, 0, 'PEQUENO', 4.3, 'F', 'Tranquila e carente'),
(3, 'Leo', 'Cachorro', 'POODLE', 7, 0, 'PEQUENO', 6.7, 'M', 'Muito esperto e docil'),
(3, 'Thor', 'Cachorro', 'HUSKY SIBERIANO', 4, 0, 'GRANDE', 28.9, 'M', 'Ama correr na grama'),
(3, 'Lili', 'Gato', 'ANGORA', 3, 0, 'PEQUENO', 3.5, 'F', 'Sociavel e ronrona muito'),
(3, 'Sasha', 'Gato', 'VIRALATA', 6, 0, 'PEQUENO', 3.9, 'F', 'Muito esperta e cacadora'),
(3, 'Spike', 'Cachorro', 'ROTTWEILER', 5, 0, 'GRANDE', 39.0, 'M', 'Forte, leal e protetor'),
(3, 'Lola', 'Gato', 'MAINE COON', 4, 0, 'MEDIO', 6.5, 'F', 'Grande, fofa e docil'),
(3, 'Maya', 'Cachorro', 'GOLDEN RETRIEVER', 3, 0, 'GRANDE', 27.0, 'F', 'Muito amigavel e ativa'),
(3, 'Pingo', 'Cachorro', 'PINSCHER', 5, 0, 'PEQUENO', 4.2, 'M', 'Pequeno, mas valente'),
(3, 'Nina', 'Gato', 'RAGDOLL', 2, 0, 'PEQUENO', 4.0, 'F', 'Docinha e adora colo'),
(3, 'Bob', 'Cachorro', 'VIRALATA', 6, 0, 'MEDIO', 17.3, 'M', 'Muito esperto e fiel'),
(3, 'Romeu', 'Cachorro', 'COCKER SPANIEL', 4, 0, 'MEDIO', 13.2, 'M', 'Carinhoso e brincalhao'),
(3, 'Theo', 'Gato', 'BRITISH SHORTHAIR', 3, 0, 'PEQUENO', 4.8, 'M', 'Gosta de dormir o dia todo'),
(3, 'Mimi', 'Hamster', 'CHINES', 1, 0, 'PEQUENO', 0.11, 'F', 'Muito agil e curiosa'),
(3, 'Marley', 'Cachorro', 'DALMATA', 5, 0, 'GRANDE', 30.0, 'M', 'Cheio de energia e lealdade'),
(3, 'Bella', 'Gato', 'BENGAL', 2, 0, 'PEQUENO', 3.9, 'F', 'Cheia de energia e pulos altos'),
(3, 'Zara', 'Cachorro', 'SHIH TZU', 3, 0, 'PEQUENO', 5.5, 'F', 'Muito fofa e adora brincar'),
(3, 'Leo', 'Gato', 'SPHYNX', 4, 0, 'PEQUENO', 3.0, 'M', 'Adora calor e carinho constante'),
(3, 'Mel', 'Cachorro', 'POODLE', 5, 0, 'PEQUENO', 8.0, 'F', 'Muito esperta e adora colo'),
(3, 'Simba', 'Gato', 'MAINE COON', 2, 0, 'MEDIO', 6.5, 'M', 'Gato peludo e sociavel'),
(3, 'Fred', 'Gato', 'PERSA', 6, 0, 'PEQUENO', 5.0, 'M', 'Calmo e gosta de lugares altos'),
(3, 'Amora', 'Cachorro', 'BEAGLE', 3, 0, 'PEQUENO', 10.0, 'F', 'Exploradora e ativa'),
(3, 'Tigrinho', 'Gato', 'VIRALATA', 1, 0, 'PEQUENO', 2.5, 'M', 'Filhote curioso'),
(3, 'Cacau', 'Cachorro', 'SHIH TZU', 4, 0, 'PEQUENO', 7.0, 'F', 'Adora colo e criancas'),
(3, 'Sasha', 'Cachorro', 'COCKER SPANIEL', 4, 0, 'MEDIO', 12.0, 'F', 'Orelhuda e brincalhona'),
(3, 'Belinha', 'Cachorro', 'POODLE', 10, 0, 'PEQUENO', 6.2, 'F', 'Muito docil e ja tranquila'),
(3, 'Tobias', 'Cachorro', 'VIRALATA', 12, 0, 'MEDIO', 18.0, 'M', 'Idoso calmo e amoroso'),
(3, 'Mimi', 'Gato', 'PERSA', 9, 0, 'PEQUENO', 4.5, 'F', 'Gosta de dormir no sol'),
(3, 'Chico', 'Gato', 'SIAMES', 11, 0, 'PEQUENO', 5.1, 'M', 'Gato de colo, muito manso'),
(3, 'Dona Flor', 'Cachorro', 'SHIH TZU', 13, 0, 'PEQUENO', 7.5, 'F', 'Precisa de cuidados especiais'),
(3, 'Tina', 'Gato', 'ANGORA', 10, 0, 'PEQUENO', 3.9, 'F', 'Muito calma e afetuosa'),
(3, 'Guga', 'Cachorro', 'BASSET', 14, 0, 'MEDIO', 20.0, 'M', 'Idoso simpatico e adora companhia');

INSERT INTO pet_favoritos (Id_usuario, Id_pet) VALUES
(2, 1),
(2, 3);        

INSERT INTO historico_medico_pet (Id_pet, Tipo, Descricao, Data, Documento) VALUES 
(5, 'VACINA', 'Vacina V8 aplicada com sucesso.', '2024-05-10', null),
(19, 'DOENCA', 'Diagnosticado com cinomose em 2023. Totalmente recuperado.', '2023-09-01', NULL),
(13, 'OUTROS', 'O cachorro se jogou da janela e acabou quebrando suas patas.', '2024-05-27', null),
(1, 'ALIMENTACAO', 'Necessário ração hipoalergênica. Não pode comer frango.', NULL, NULL),
(1, 'TRATAMENTO', 'Uso diário de medicamento para controle de ansiedade.', '2024-03-15', 'receita_controlada.pdf'),
(1, 'COMPORTAMENTO', 'Agressivo com homens desconhecidos. Precisa de aproximação lenta.', NULL, NULL),
(1, 'RESTRICAO_MOBILIDADE', 'Problema na pata traseira esquerda. Limitação ao caminhar.', '2024-04-05', NULL);

INSERT INTO solicitacao_adocao (Id_pet, Id_protetor, Id_adotante, Situacao) VALUES
(1, 3, 1, 'Pendente'),
(2, 3, 2, 'Pendente'),
(3, 3, 3, 'Pendente');

INSERT INTO adocao (Id_pet, Id_adotante, Id_protetor, Status) VALUES
(1, 1, 3, 'Disponivel'),
(2, 2, 3, 'Disponivel');

INSERT INTO historico_adocao (Id_adocao, Id_protetor) VALUES
(1, 3),
(2, 3);

INSERT INTO tags_pet (Id_pet, Id_tag) VALUES 
(1, 1),
(1, 3),
(1, 4),
(2, 2),
(2, 4);