INSERT INTO usuario (Nome, Telefone, Email, Senha_hash, Tipo, Perfil_usuario) VALUES 
('João Silva', '(11) 99999-9999', 'joao@email.com', '$2a$10$xpto', 'PESSOA', 'ADOTANTE'),
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
(3, 'Luna', 'Gato', 'PUG', 2, 'PEQUENO', 4.2, 'F', 'Gatinha tranquila que adora carinho');

INSERT INTO historico_medico_pet (Id_pet, Hospital, Resultado, Tratamento, Documento, Data) VALUES 
(1, 'Hospital Vet Plus', 'Exame de rotina', 'Vacina V10', 'vacinacao_001.pdf', '2025-03-15'),
(2, 'Clínica Felina', 'Castração', 'Pós-operatório normal', 'castracao_002.pdf', '2025-02-20');

INSERT INTO adocao (Id_pet, Id_adotante, Status) VALUES 
(1, 1, 'Pendente'),
(2, 1, 'Aceita');

INSERT INTO historico_adocao (Id_adocao, Id_protetor) VALUES 
(1, 3),
(2, 3);

INSERT INTO tags_pet (Id_pet, Id_tag) VALUES 
(1, 1),
(1, 3),
(1, 4),
(2, 2),
(2, 4);