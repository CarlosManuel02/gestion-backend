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
    password               varchar                         not null,
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
    task_id       uuid PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    description   TEXT,
    status        VARCHAR(50)  NOT NULL,
    creation_date DATE         NOT NULL,
    deadline      DATE,
    priority      INTEGER      NOT NULL,
    assignment    uuid REFERENCES "Users" (id),
    project_id    uuid REFERENCES projects (id)
);

CREATE TABLE projects
(
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    owner       uuid REFERENCES "Users" (id),
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
    id         uuid default uuid_generate_v4(),
    project_id uuid,
    user_id    uuid,
    role       VARCHAR(50) NOT NULL,
    PRIMARY KEY (id)
);



CREATE OR REPLACE FUNCTION get_project_details(project_id_param UUID, project_name_param VARCHAR)
    RETURNS TABLE
            (
                project_id          UUID,
                project_name        VARCHAR,
                project_owner       UUID,
                project_description TEXT,
                project_start_date  DATE,
                project_end_date    DATE,
                project_status      VARCHAR,
                project_image_url   TEXT,
                members             JSONB
            )
AS
$$
BEGIN
    RETURN QUERY
        SELECT p.id          AS project_id,
               p.name        AS project_name,
               p.owner       AS project_owner,
               p.description AS project_description,
               p.start_date  AS project_start_date,
               p.end_date    AS project_end_date,
               p.status      AS project_status,
               img.url       AS project_image_url,
               jsonb_agg(
                       jsonb_build_object(
                               'member_id', u.id,
                               'member_username', u.username,
                               'member_email', u.email,
                               'member_role', pm.role
                       )
               )             AS members
        FROM projects p
                 LEFT JOIN images img ON p.image = img.image_id
                 LEFT JOIN project_members pm ON p.id = pm.project_id
                 LEFT JOIN "Users" u ON pm.user_id = u.id
        WHERE (p.id = project_id_param OR p.name = project_name_param)
        GROUP BY p.id, img.url;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION get_all_projects_from_user(user_id_param UUID)
    RETURNS TABLE
            (
                project_id          UUID,
                project_name        VARCHAR,
                project_owner       UUID,
                project_description TEXT,
                project_start_date  DATE,
                project_end_date    DATE,
                project_status      VARCHAR,
                project_image_url   TEXT,
                members             JSONB
            )
AS
$$
BEGIN
    RETURN QUERY
        SELECT p.id          AS project_id,
               p.name        AS project_name,
               p.owner       AS project_owner,
               p.description AS project_description,
               p.start_date  AS project_start_date,
               p.end_date    AS project_end_date,
               p.status      AS project_status,
               img.url       AS project_image_url,
               jsonb_agg(
                       jsonb_build_object(
                               'member_id', u.id,
                               'member_username', u.username,
                               'member_email', u.email,
                               'member_role', pm.role
                       )
               )             AS members
        FROM projects p
                 LEFT JOIN images img ON p.image = img.image_id
                 LEFT JOIN project_members pm ON p.id = pm.project_id
                 LEFT JOIN "Users" u ON pm.user_id = u.id
        WHERE pm.user_id = user_id_param
        GROUP BY p.id, img.url;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION get_all_tasks_from_project(project_id_param uuid)
    RETURNS TABLE
            (
                task_id       UUID,
                task_name     VARCHAR,
                task_description TEXT,
                task_status   VARCHAR,
                task_creation_date DATE,
                task_deadline DATE,
                task_priority INTEGER,
                task_assignment UUID
            ) AS $$
BEGIN
    RETURN QUERY
        SELECT t.task_id       AS task_id,
               t.name          AS task_name,
               t.description   AS task_description,
               t.status        AS task_status,
               t.creation_date AS task_creation_date,
               t.deadline      AS task_deadline,
               t.priority      AS task_priority,
               t.assignment    AS task_assignment
        FROM tasks t
        WHERE t.project_id = project_id_param;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION get_all_tasks_from_user(user_id_param uuid, user_email_param VARCHAR)
    RETURNS TABLE
            (
                task_id       UUID,
                task_name     VARCHAR,
                task_description TEXT,
                task_status   VARCHAR,
                task_creation_date DATE,
                task_deadline DATE,
                task_priority INTEGER,
                task_assignment UUID,
                project_id    UUID,
                project_name  VARCHAR
            ) AS $$
BEGIN
    RETURN QUERY
        SELECT t.task_id       AS task_id,
               t.name          AS task_name,
               t.description   AS task_description,
               t.status        AS task_status,
               t.creation_date AS task_creation_date,
               t.deadline      AS task_deadline,
               t.priority      AS task_priority,
               t.assignment    AS task_assignment,
               p.id            AS project_id,
               p.name          AS project_name
        FROM tasks t
                 JOIN projects p ON t.project_id = p.id
                    JOIN "Users" u ON t.assignment = u.id
        WHERE t.assignment = user_id_param
           OR u.email = user_email_param;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION get_all_tasks_from_user_and_project(user_id_param uuid, project_id_param uuid)
    RETURNS TABLE
            (
                task_id       UUID,
                task_name     VARCHAR,
                task_description TEXT,
                task_status   VARCHAR,
                task_creation_date DATE,
                task_deadline DATE,
                task_priority INTEGER,
                task_assignment UUID
            ) AS $$
BEGIN
    RETURN QUERY
        SELECT t.task_id       AS task_id,
               t.name          AS task_name,
               t.description   AS task_description,
               t.status        AS task_status,
               t.creation_date AS task_creation_date,
               t.deadline      AS task_deadline,
               t.priority      AS task_priority,
               t.assignment    AS task_assignment
        FROM tasks t
        WHERE t.project_id = project_id_param
          AND t.assignment = user_id_param;
END;
$$ LANGUAGE plpgsql;