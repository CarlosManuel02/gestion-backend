-- ===============================
-- Database: task_manager
-- ===============================

DROP TABLE IF EXISTS Users CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS Logs CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS project_members CASCADE;
DROP TABLE IF EXISTS project_repositories CASCADE;
DROP TABLE IF EXISTS project_invitations CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS project_settings CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS Attachments CASCADE;
DROP TABLE IF EXISTS task_comments CASCADE;



-- ===============================
-- User Management Tables
-- ===============================

-- Users Table
CREATE TABLE Users
(
    id                     UUID    NOT NULL PRIMARY KEY,
    username               VARCHAR NOT NULL,
    email                  VARCHAR NOT NULL,
    password               VARCHAR NOT NULL,
    salt                   VARCHAR NOT NULL,
    reset_password_token   VARCHAR,
    reset_password_expires TIMESTAMP
);

-- Notifications Table
CREATE TABLE notifications
(
    id         UUID NOT NULL PRIMARY KEY,
    title      TEXT,
    from_user  UUID REFERENCES Users (id),
    to_user    UUID REFERENCES Users (id),
    message    TEXT,
    read       BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP
);

-- Logs Table
CREATE TABLE Logs
(
    id         UUID    NOT NULL PRIMARY KEY,
    user_id    UUID    NOT NULL,
    action     VARCHAR NOT NULL,
    created_at TIMESTAMP
);

-- ===============================
-- Project Management Tables
-- ===============================

-- Projects Table
CREATE TABLE projects
(
    id          UUID         NOT NULL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    owner       UUID REFERENCES Users (id),
    description TEXT,
    start_date  DATE         NOT NULL,
    end_date    DATE,
    status      VARCHAR(50)  NOT NULL CHECK ( status IN ('active', 'inactive', 'completed') ),
    visibility  BOOLEAN      NOT NULL DEFAULT TRUE,
    project_key VARCHAR(50)
);

-- Project Members Table
CREATE TABLE project_members
(
    id         UUID        NOT NULL PRIMARY KEY,
    project_id UUID REFERENCES projects (id),
    user_id    UUID REFERENCES Users (id),
    join_date  DATE        NOT NULL,
    role       VARCHAR(50) NOT NULL
);

-- Project Repositories Table
CREATE TABLE project_repositories
(
    id         UUID NOT NULL PRIMARY KEY,
    project_id UUID REFERENCES projects (id),
    url        TEXT NOT NULL
);

CREATE TABLE project_invitations
(
    id         UUID    NOT NULL PRIMARY KEY,
    project_id UUID REFERENCES projects (id),
    user_id    UUID REFERENCES Users (id),
    token      VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);
-- ===============================
-- Project Settings Tables
-- ===============================

-- Roles Table
CREATE TABLE roles
(
    id   UUID        NOT NULL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);


-- Project Settings Table
CREATE TABLE project_settings
(
    id          UUID  NOT NULL PRIMARY KEY,
    project_id  UUID REFERENCES projects (id),
    role_id     UUID REFERENCES roles (id),
    permissions JSONB NOT NULL
);
-- ===============================
-- Task Management Tables
-- ===============================

-- Tasks Table
CREATE TABLE tasks
(
    task_id       UUID         NOT NULL PRIMARY KEY,
    task_key      VARCHAR(10)  NOT NULL,
    name          VARCHAR(255) NOT NULL,
    description   TEXT,
    status        VARCHAR(50)  NOT NULL,
    creation_date DATE         NOT NULL,
    deadline      DATE,
    priority      INTEGER      NOT NULL,
    assignment    UUID REFERENCES Users (id),
    project_id    UUID REFERENCES projects (id)
);

-- Attachments Table
CREATE TABLE Attachments
(
    id         UUID                NOT NULL PRIMARY KEY,
    task_id    UUID REFERENCES tasks (task_id) ON DELETE CASCADE,
    file_name  VARCHAR             NOT NULL,
    data       BYTEA               NOT NULL,
    mime_type  VARCHAR             NOT NULL,
    size       INTEGER   DEFAULT 0 NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

-- Task Comments Table
CREATE TABLE task_comments
(
    id         UUID NOT NULL PRIMARY KEY,
    task_id    UUID REFERENCES tasks (task_id),
    user_id    UUID REFERENCES Users (id),
    comment    TEXT,
    replay_to  UUID REFERENCES task_comments (id) default NULL,
    created_at TIMESTAMP
);

-- ===============================
-- Triggers
-- ===============================

-- Trigger to create the permission for a project
CREATE OR REPLACE TRIGGER create_project_permission
    AFTER INSERT
    ON projects
    FOR EACH ROW
EXECUTE FUNCTION create_project_permission();
END;


-- ===============================
-- Insert Default Data
-- ===============================

-- Insert Default Roles
INSERT INTO roles (id, name)
VALUES (gen_random_uuid(), 'Owner'),
       (gen_random_uuid(), 'Admin'),
       (gen_random_uuid(), 'Member');



-- ===============================
-- Functions
-- ===============================

-- Function to create the permission for a project
DROP FUNCTION IF EXISTS create_project_permission();
CREATE OR REPLACE FUNCTION create_project_permission()
    RETURNS TRIGGER
AS
$$
BEGIN
    INSERT INTO project_settings (id, project_id, role_id, permissions)
    VALUES (gen_random_uuid(), NEW.id, (SELECT id FROM roles WHERE name = 'Owner'),
            '{
              "create": true,
              "read": true,
              "update": true,
              "delete": true
            }');
    INSERT INTO project_settings (id, project_id, role_id, permissions)
    VALUES (gen_random_uuid(), NEW.id, (SELECT id FROM roles WHERE name = 'Admin'),
            '{
              "create": true,
              "read": true,
              "update": true,
              "delete": true
            }');
    INSERT INTO project_settings (id, project_id, role_id, permissions)
    VALUES (gen_random_uuid(), NEW.id, (SELECT id FROM roles WHERE name = 'Member'),
            '{
              "create": false,
              "read": true,
              "update": false,
              "delete": false
            }');
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

-- Function to get the project settings
DROP FUNCTION IF EXISTS get_project_settings(UUID);
CREATE OR REPLACE FUNCTION get_project_settings(project_id_param UUID)
    RETURNS TABLE
            (
                id          UUID,
                project_id  UUID,
                role_id     UUID,
                role_name   VARCHAR,
                permissions JSONB
            )
AS
$$
BEGIN
    RETURN QUERY
    SELECT ps.id                                  AS id,
           ps.project_id                          AS project_id,
           ps.role_id                             AS role_id,
           r.name                                AS role_name,
           jsonb_agg(
               jsonb_build_object(
                   'permission', permission_key,
                   'value', ps.permissions -> permission_key
               )
           ) AS permissions
    FROM project_settings ps
    CROSS JOIN LATERAL jsonb_object_keys(ps.permissions) AS permission_key
    JOIN roles r ON ps.role_id = r.id
    WHERE ps.project_id = project_id_param
    GROUP BY ps.id, ps.project_id, ps.role_id, r.name;
END
$$ LANGUAGE plpgsql;


-- Function to DELETE a project and all its dependencies (tasks, comments, attachments, members, settings, repository,etc)
DROP FUNCTION IF EXISTS delete_project(UUID);
CREATE OR REPLACE FUNCTION delete_project(project_id_param UUID)
    RETURNS boolean
AS
$$
DECLARE
    project_name VARCHAR;
BEGIN
    SELECT name INTO project_name FROM projects WHERE id = project_id_param;
    DELETE FROM tasks WHERE project_id = project_id_param;
    DELETE FROM task_comments WHERE task_id IN (SELECT task_id FROM tasks WHERE project_id = project_id_param);
    DELETE FROM Attachments WHERE task_id IN (SELECT task_id FROM tasks WHERE project_id = project_id_param);
    DELETE FROM project_members WHERE project_id = project_id_param;
    DELETE FROM project_settings WHERE project_id = project_id_param;
    DELETE FROM project_repositories WHERE project_id = project_id_param;
    DELETE FROM project_invitations WHERE project_id = project_id_param;
    DELETE FROM projects WHERE id = project_id_param;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to get project details
    DROP FUNCTION IF EXISTS get_project_details(UUID, VARCHAR);
    CREATE OR REPLACE FUNCTION get_project_details(project_id_param UUID, project_name_param VARCHAR)
        RETURNS TABLE
                (
                    project_id          UUID,
                    project_name        VARCHAR,
                    project_key         VARCHAR,
                    project_owner_id    UUID,
                    project_owner_name  VARCHAR,
                    project_owner_email VARCHAR,
                    project_description TEXT,
                    project_start_date  DATE,
                    project_end_date    DATE,
                    project_status      VARCHAR,
                    project_visibility  BOOLEAN,
                    project_repository  TEXT,
                    members             JSONB
                )
    AS
$$
BEGIN
RETURN QUERY
SELECT p.id                         AS project_id,
       p.name                       AS project_name,
       p.project_key                AS project_key,
       p.owner                      AS project_owner_id,
       u.username                   AS project_owner_name,
       u.email                      AS project_owner_email,
       p.description                AS project_description,
       p.start_date                 AS project_start_date,
       p.end_date                   AS project_end_date,
       p.status                     AS project_status,
       p.visibility                 AS project_visibility,
       pr.url                       AS project_repository,
       (SELECT jsonb_agg(
                       jsonb_build_object(
                               'member_id', mu.id,
                               'member_username', mu.username,
                               'member_email', mu.email,
                               'member_role', pm.role,
                               'join_date', pm.join_date
                           )
                   )
        FROM project_members pm
                 JOIN Users mu ON pm.user_id = mu.id
        WHERE pm.project_id = p.id) AS members
FROM projects p
         JOIN Users u ON p.owner = u.id
         LEFT JOIN project_repositories pr ON p.id = pr.project_id
WHERE p.id = project_id_param
   OR p.name = project_name_param
GROUP BY p.id, u.username, u.email, pr.url;
END;
$$ LANGUAGE plpgsql;


-- Function to get all projects from a user
DROP FUNCTION IF EXISTS get_all_projects_from_user(UUID);
CREATE OR REPLACE FUNCTION get_all_projects_from_user(user_id_param UUID)
    RETURNS TABLE
            (
                project_id          UUID,
                project_name        VARCHAR,
                project_key         VARCHAR,
                project_owner_id    UUID,
                project_owner_name  VARCHAR,
                project_owner_email VARCHAR,
                project_description TEXT,
                project_start_date  DATE,
                project_end_date    DATE,
                project_status      VARCHAR,
                project_visibility  BOOLEAN,
                project_repository  TEXT,
                members             JSONB
            )
AS
$$
BEGIN
RETURN QUERY
SELECT p.id          AS project_id,
       p.name        AS project_name,
       p.project_key AS project_key,
       p.owner       AS project_owner_id,
       u.username    AS project_owner_name,
       u.email       AS project_owner_email,
       p.description AS project_description,
       p.start_date  AS project_start_date,
       p.end_date    AS project_end_date,
       p.status      AS project_status,
       p.visibility  AS project_visibility,
       pr.url        AS project_repository,
       jsonb_agg(
               jsonb_build_object(
                       'member_id', u.id,
                       'member_username', u.username,
                       'member_email', u.email,
                       'member_role', pm.role,
                       'join_date', pm.join_date
                   )
           )         AS members
FROM projects p
         JOIN Users u ON p.owner = u.id
         LEFT JOIN project_repositories pr ON p.id = pr.project_id
         LEFT JOIN project_members pm ON p.id = pm.project_id
WHERE pm.user_id = user_id_param
GROUP BY p.id, u.username, u.email, pr.url;
END;
$$ LANGUAGE plpgsql;

-- Function to get all tasks from a project
DROP FUNCTION IF EXISTS get_all_tasks_from_project(UUID);
CREATE OR REPLACE FUNCTION get_all_tasks_from_project(project_id_param UUID)
    RETURNS TABLE
            (
                task_id            UUID,
                task_key           VARCHAR,
                task_name          VARCHAR,
                task_description   TEXT,
                task_status        VARCHAR,
                task_creation_date DATE,
                task_deadline      DATE,
                task_priority      INTEGER,
                task_assignment    UUID
            )
AS
$$
BEGIN
RETURN QUERY
SELECT t.task_id           AS task_id,
       t.task_key::VARCHAR AS task_key,
       t.name::VARCHAR     AS task_name,
       t.description::TEXT AS task_description,
       t.status::VARCHAR   AS task_status,
       t.creation_date     AS task_creation_date,
       t.deadline          AS task_deadline,
       t.priority          AS task_priority,
       t.assignment        AS task_assignment
FROM tasks t
WHERE t.project_id = project_id_param;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION get_all_tasks_from_project(project_id_param UUID)
    RETURNS TABLE
            (
                task_id            UUID,
                task_key           VARCHAR,
                task_name          VARCHAR,
                task_description   TEXT,
                task_status        VARCHAR,
                task_creation_date DATE,
                task_deadline      DATE,
                task_priority      INTEGER,
                task_assignment    UUID
            )
AS
$$
BEGIN
RETURN QUERY
SELECT t.task_id           AS task_id,
       t.task_key::VARCHAR AS task_key,
       t.name::VARCHAR     AS task_name,
       t.description::TEXT AS task_description,
       t.status::VARCHAR   AS task_status,
       t.creation_date     AS task_creation_date,
       t.deadline          AS task_deadline,
       t.priority          AS task_priority,
       t.assignment        AS task_assignment
FROM tasks t
WHERE t.project_id = project_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to get all tasks from a user
DROP FUNCTION IF EXISTS get_all_tasks_from_user(UUID, VARCHAR);
CREATE OR REPLACE FUNCTION get_all_tasks_from_user(user_id_param UUID, user_email_param VARCHAR)
    RETURNS TABLE
            (
                task_id            UUID,
                task_key           VARCHAR,
                task_name          VARCHAR,
                task_description   TEXT,
                task_status        VARCHAR,
                task_creation_date DATE,
                task_deadline      DATE,
                task_priority      INTEGER,
                task_assignment    UUID,
                project_id         UUID,
                project_name       VARCHAR
            )
AS
$$
BEGIN
RETURN QUERY
SELECT t.task_id       AS task_id,
       t.task_key      AS task_key,
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
         JOIN Users u ON t.assignment = u.id
WHERE t.assignment = user_id_param
   OR u.email = user_email_param;
END;
$$ LANGUAGE plpgsql;

-- Function to get all tasks from a user and project
DROP FUNCTION IF EXISTS get_all_tasks_from_user_and_project(UUID, UUID);
CREATE OR REPLACE FUNCTION get_all_tasks_from_user_and_project(user_id_param UUID, project_id_param UUID)
    RETURNS TABLE
            (
                task_id            UUID,
                task_key           VARCHAR,
                task_name          VARCHAR,
                task_description   TEXT,
                task_status        VARCHAR,
                task_creation_date DATE,
                task_deadline      DATE,
                task_priority      INTEGER,
                task_assignment    UUID
            )
AS
$$
BEGIN
RETURN QUERY
SELECT t.task_id       AS task_id,
       t.task_key      AS task_key,
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

-- Function to get task details
DROP FUNCTION IF EXISTS get_task_details(UUID);
CREATE OR REPLACE FUNCTION get_task_details(task_id_param UUID)
    RETURNS TABLE
            (
                task_id            UUID,
                task_key           VARCHAR,
                task_name          VARCHAR,
                task_description   TEXT,
                task_status        VARCHAR,
                task_creation_date DATE,
                task_deadline      DATE,
                task_priority      INTEGER,
                user_assigned      UUID,
                user_username      VARCHAR,
                user_email         VARCHAR,
                project_id         UUID,
                project_name       VARCHAR
            )
AS
$$
BEGIN
RETURN QUERY
SELECT t.task_id       AS task_id,
       t.task_key      AS task_key,
       t.name          AS task_name,
       t.description   AS task_description,
       t.status        AS task_status,
       t.creation_date AS task_creation_date,
       t.deadline      AS task_deadline,
       t.priority      AS task_priority,
       t.assignment    AS user_assigned,
       u.username      AS user_username,
       u.email         AS user_email,
       p.id            AS project_id,
       p.name          AS project_name
FROM tasks t
         JOIN projects p ON t.project_id = p.id
         JOIN Users u ON t.assignment = u.id
WHERE t.task_id = task_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to get all attachments from a task
DROP FUNCTION IF EXISTS get_all_attachments_from_task(UUID);
CREATE OR REPLACE FUNCTION get_all_attachments_from_task(task_id_param UUID)
    RETURNS TABLE
            (
                attachment_id UUID,
                task_id       UUID,
                file_name     VARCHAR,
                data          BYTEA,
                mime_type     VARCHAR
            )
AS
$$
BEGIN
RETURN QUERY
SELECT a.id        AS attachment_id,
       a.task_id   AS task_id,
       a.file_name AS file_name,
       a.data      AS data,
       a.mime_type AS mime_type
FROM Attachments a
WHERE a.task_id = task_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to get all comments from a task
DROP FUNCTION IF EXISTS get_all_comments_from_task(UUID);
CREATE OR REPLACE FUNCTION get_all_comments_from_task(task_id_param UUID)
    RETURNS TABLE
            (
                comment_id    UUID,
                task_id       UUID,
                user_id       UUID,
                user_username VARCHAR,
                user_email    VARCHAR,
                comment       TEXT,
                created_at    TIMESTAMP
            )
AS
$$
BEGIN
RETURN QUERY
SELECT tc.id         AS comment_id,
       tc.task_id    AS task_id,
       tc.user_id    AS user_id,
       u.username    AS user_username,
       u.email       AS user_email,
       tc.comment    AS comment,
       tc.created_at AS created_at
FROM task_comments tc
         JOIN Users u ON tc.user_id = u.id
WHERE tc.task_id = task_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to get all notifications from a user
DROP FUNCTION IF EXISTS get_all_notifications_from_user(UUID);
CREATE OR REPLACE FUNCTION get_all_notifications_from_user(user_id_param UUID)
    RETURNS TABLE
            (
                notification_id UUID,
                title           TEXT,
                from_user_id    UUID,
                from_user_name  VARCHAR,
                from_user_email VARCHAR,
                message         TEXT,
                to_user_id      UUID,
                created_at      TIMESTAMP,
                read            BOOLEAN
            )
AS
$$
BEGIN
RETURN QUERY
SELECT n.id         AS notification_id,
       n.title      AS title,
       n.from_user  AS from_user_id,
       u.username   AS from_user_name,
       u.email      AS from_user_email,
       n.message    AS message,
       n.to_user    AS to_user_id,
       n.created_at AS created_at,
       n.read       AS read
FROM notifications n
         JOIN Users u ON n.from_user = u.id
WHERE n.to_user = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to get all project's members
DROP FUNCTION IF EXISTS get_all_project_members(UUID);
CREATE OR REPLACE FUNCTION get_all_project_members(project_id_param UUID)
    RETURNS TABLE
            (
                member_id    UUID,
                member_name  VARCHAR,
                member_email VARCHAR,
                member_role  VARCHAR,
                join_date    DATE
            )
AS
$$
BEGIN
RETURN QUERY
SELECT u.id         AS member_id,
       u.username   AS member_name,
       u.email      AS member_email,
       pm.role      AS member_role,
       pm.join_date AS join_date
FROM project_members pm
         JOIN Users u ON pm.user_id = u.id
WHERE pm.project_id = project_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to get all comments from a task
DROP FUNCTION IF EXISTS get_all_commets_from_user(UUID);
CREATE OR REPLACE FUNCTION get_all_commets_from_user(task_id_param UUID)
    RETURNS TABLE
            (
                id         UUID,
                user_id    UUID,
                username   VARCHAR,
                task_id    UUID,
                comment    TEXT,
                created_at TIMESTAMP
            )
AS
$$
BEGIN
RETURN QUERY
SELECT tc.id         AS id,
       tc.user_id    AS user_id,
       u.username    AS username,
       tc.task_id    AS task_id,
       tc.comment    AS comment,
       tc.created_at AS created_at
FROM task_comments tc
         JOIN Users u ON tc.user_id = u.id
WHERE tc.task_id = task_id_param
ORDER BY tc.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get all public projects
DROP FUNCTION IF EXISTS get_all_public_projects();
CREATE OR REPLACE FUNCTION get_all_public_projects()
    RETURNS TABLE
            (
                project_id          UUID,
                project_name        VARCHAR,
                project_key         VARCHAR,
                project_owner_id    UUID,
                project_owner_name  VARCHAR,
                project_owner_email VARCHAR,
                project_description TEXT,
                project_start_date  DATE,
                project_end_date    DATE,
                project_status      VARCHAR,
                project_visibility  BOOLEAN,
                project_repository  TEXT,
                members             JSONB
            )
AS
$$
BEGIN
RETURN QUERY
SELECT p.id          AS project_id,
       p.name        AS project_name,
       p.project_key AS project_key,
       p.owner       AS project_owner_id,
       u.username    AS project_owner_name,
       u.email       AS project_owner_email,
       p.description AS project_description,
       p.start_date  AS project_start_date,
       p.end_date    AS project_end_date,
       p.status      AS project_status,
       p.visibility  AS project_visibility,
       pr.url        AS project_repository,
       jsonb_agg(
               jsonb_build_object(
                       'member_id', u.id,
                       'member_username', u.username,
                       'member_email', u.email,
                       'member_role', pm.role
                   )
           )         AS members
FROM projects p
         JOIN Users u ON p.owner = u.id
         LEFT JOIN project_repositories pr ON p.id = pr.project_id
         LEFT JOIN project_members pm ON p.id = pm.project_id
WHERE p.visibility = TRUE
GROUP BY p.id, u.username, u.email, pr.url;
END;
$$ LANGUAGE plpgsql;