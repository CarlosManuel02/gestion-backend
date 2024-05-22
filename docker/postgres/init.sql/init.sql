-- auto-generated definition
create table "Logs"
(
    id          uuid default uuid_generate_v4() not null
        constraint "PK_69e142ffa0889d451f768edce3e"
            primary key,
    user_id     varchar                         not null,
    action      varchar                         not null,
    "createdAt" timestamp
);

alter table "Logs"
    owner to root;


-- auto-generated definition
create table "Users"
(
    id                     uuid default uuid_generate_v4() not null
        constraint "PK_16d4f7d636df336db11d87413e3"
            primary key,
    username               varchar                         not null,
    email                  varchar                         not null,
    password               varchar  not null,
    role                   varchar                         not null,
    "lastLogin"            timestamp,
    salt                   varchar                         not null,
    "resetPasswordToken"   varchar,
    "resetPasswordExpires" timestamp
);

alter table "Users"
    owner to root;


-- auto-generated definition
CREATE TABLE tasks
(
    task_id       SERIAL PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    description   TEXT,
    status        VARCHAR(50)  NOT NULL,
    creation_date DATE         NOT NULL,
    deadline      DATE,
    priority      INTEGER      NOT NULL,
    difficulty    INTEGER      NOT NULL,
    assignment    INTEGER REFERENCES"Users" (id),
    project_id    INTEGER REFERENCES projects (id)
);

CREATE TABLE projects
(
    id  SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    image       TEXT REFERENCES images (image_id),
    description TEXT,
    start_date  DATE         NOT NULL,
    end_date    DATE,
    status      VARCHAR(50)  NOT NULL
);

CREATE Table images
(
    image_id SERIAL PRIMARY KEY,
    url      TEXT NOT NULL
);


create TAble project_members
(
    project_id uuid ,
    user_id    uuid ,
    PRIMARY KEY (project_id, user_id),
    FOREIGN KEY (project_id) REFERENCES projects (id),
    FOREIGN KEY (user_id) REFERENCES "Users" (id)
);
