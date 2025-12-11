--Following has been used to create the table schema
--Chars data type has been changed to cachar datatype
DROP TABLE IF EXISTS book_notes, book_details;
CREATE TABLE book_notes(
	id SERIAL PRIMARY KEY NOT NULL,
	title CHAR(200) NOT NULL,
	img_url CHAR(250),
	notes CHAR(600) NOT NULL
); 

CREATE TABLE book_details(
    id INT,
    author CHAR(60),
    date_read DATE,
    recommend INT NOT NULL,
    amazon_link CHAR(250),
    FOREIGN KEY (id) REFERENCES book_notes(id)
);