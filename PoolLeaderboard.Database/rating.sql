CREATE TABLE rating (
    id INT IDENTITY(1,1) CONSTRAINT pk_rating_id PRIMARY KEY,
    name NVARCHAR(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    rating SMALLINT NOT NULL,
    CONSTRAINT uq_rating_name UNIQUE (name)
);