INSERT INTO usuario (Nome, Telefone, Email, Senha_hash, Tipo, Perfil_usuario) VALUES 
('João Silva', '(11) 99999-9999', 'joao@email.com', '$2a$$xpto', 'PESSOA', 'ADOTANTE'),
('Maria Souza', '(11) 88888-8888', 'maria@email.com', '$2a$10$xpto', 'PESSOA', 'AMBOS'),
('ONG Pets Felizes', '(11) 77777-7777', 'ong@pets.com', '$2a$10$xpto', 'ONG', 'PROTETOR');

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

INSERT INTO pet (Id_usuario, Nome, Especie, Raca, Idade, Porte, Peso, Sexo, Bio) VALUES 
(2, 'Rex', 'Cachorro', 'POODLE', 3, 'MEDIO', 12.5, 'M', 'Cachorro muito brincalhão e amoroso'),
(3, 'Luna', 'Gato', 'PUG', 2, 'PEQUENO', 4.2, 'F', 'Gatinha tranquila que adora carinho'),
(2, 'Max', 'Cachorro', 'BULLDOG', 5, 'GRANDE', 25.0, 'M', 'Cachorro protetor e leal'),
(3, 'Mia', 'Gato', 'SIAMESE', 1, 'PEQUENO', 3.0, 'F', 'Gatinha curiosa e brincalhona');

INSERT INTO historico_medico_pet (Id_pet, Tipo, Descricao, Data, Documento) VALUES 
(1, 'VACINA', 'Vacina V8 aplicada com sucesso.', '2024-05-10', null),
(1, 'DOENCA', 'Diagnosticado com cinomose em 2023. Totalmente recuperado.', '2023-09-01', NULL),
(1, 'OUTROS', 'O cachorro se jogou da janela e acabou quebrando suas patas.', '2024-05-27', null),
(1, 'ALIMENTACAO', 'Necessário ração hipoalergênica. Não pode comer frango.', NULL, NULL),
(1, 'TRATAMENTO', 'Uso diário de medicamento para controle de ansiedade.', '2024-03-15', 'receita_controlada.pdf'),
(1, 'COMPORTAMENTO', 'Agressivo com homens desconhecidos. Precisa de aproximação lenta.', NULL, NULL),
(1, 'RESTRICAO_MOBILIDADE', 'Problema na pata traseira esquerda. Limitação ao caminhar.', '2024-04-05', NULL);

INSERT INTO adocao (Id_pet, Id_adotante, Status) VALUES 
(1, 1, 'Adotado'),
(2, 1, 'Falecido'),
(3, 2, 'Disponível'),
(4, 2, 'Disponível');

INSERT INTO historico_adocao (Id_adocao, Id_protetor) VALUES 
(1, 3),
(2, 3);

INSERT INTO tags_pet (Id_pet, Id_tag) VALUES 
(1, 1),
(1, 3),
(1, 4),
(2, 2),
(2, 4);