-- Inserção na tabela Usuario
INSERT INTO Usuario (Nome, Telefone, Email, Senha_hash, Tipo) VALUES 
('João Silva', '(11) 99999-9999', 'joao@email.com', '$2a$10$xpto', 'Adotante'),
('Maria Souza', '(11) 88888-8888', 'maria@email.com', '$2a$10$xpto', 'Protetor'),
('ONG Pets Felizes', '(11) 77777-7777', 'ong@pets.com', '$2a$10$xpto', 'ONG');

-- Inserção na tabela UserHistory
INSERT INTO UserHistory (User_id, Mensagem) VALUES 
(1, 'Usuário cadastrado no sistema'),
(2, 'Primeiro acesso realizado'),
(3, 'Cadastro de ONG verificado');

-- Inserção na tabela Categorias
INSERT INTO Categorias (Nome) VALUES 
('Comportamento'),
('Saúde'),
('Cuidados');

-- Inserção na tabela Tags
INSERT INTO Tags (Nome, Categoria_id) VALUES 
('Brincalhão', 1),
('Calmo', 1),
('Vacinação', 2),
('Castrado', 2),
('Banho', 3);

-- Inserção na tabela Pet
INSERT INTO Pet (User_id, Nome, Especie, Idade, Porte, Peso, Sexo, Bio) VALUES 
(2, 'Rex', 'Cachorro', 3, 'Médio', 12.5, 'M', 'Cachorro muito brincalhão e amoroso'),
(3, 'Luna', 'Gato', 2, 'Pequeno', 4.2, 'F', 'Gatinha tranquila que adora carinho');

-- Inserção na tabela MedicalPetHistory
INSERT INTO MedicalPetHistory (Pet_id, Hospital, Resultado, Tratamento, Documento, Data) VALUES 
(1, 'Hospital Vet Plus', 'Exame de rotina', 'Vacina V10', 'vacinacao_001.pdf', '2025-03-15'),
(2, 'Clínica Felina', 'Castração', 'Pós-operatório normal', 'castracao_002.pdf', '2025-02-20');

-- Inserção na tabela Adoption
INSERT INTO Adoption (Pet_id, Adopter_id, Status) VALUES 
(1, 1, 'Pendente'),
(2, 1, 'Aceita');

-- Inserção na tabela AdoptionHistory
INSERT INTO AdoptionHistory (Adoption_id, Trainer_id) VALUES 
(1, 3),
(2, 3);

-- Inserção na tabela PetTags (relacionamento muitos-para-muitos)
INSERT INTO PetTags (Pet_id, Tag_id) VALUES 
(1, 1), -- Rex é Brincalhão
(1, 3), -- Rex tem Vacinação
(1, 4), -- Rex é Castrado
(2, 2), -- Luna é Calma
(2, 4); -- Luna é Castrada